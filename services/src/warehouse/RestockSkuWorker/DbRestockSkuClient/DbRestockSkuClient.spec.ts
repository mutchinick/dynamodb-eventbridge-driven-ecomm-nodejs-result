import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { RestockSkuCommand } from '../model/RestockSkuCommand'
import { DbRestockSkuClient } from './DbRestockSkuClient'

const mockWarehouseTableName = 'mockWarehouseTableName'

process.env.WAREHOUSE_TABLE_NAME = mockWarehouseTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockRestockSkuCommand(): TypeUtilsMutable<RestockSkuCommand> {
  const mockClass = RestockSkuCommand.validateAndBuild({
    incomingSkuRestockedEvent: {
      eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
      eventData: {
        sku: 'mockSku',
        units: 3,
        lotId: 'mockLotId',
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockRestockSkuCommand = buildMockRestockSkuCommand()

const expectedTransactWriteCommand = new TransactWriteCommand({
  TransactItems: [
    {
      Put: {
        TableName: mockWarehouseTableName,
        Item: {
          pk: `LOT_ID#${mockRestockSkuCommand.restockSkuData.lotId}`,
          sk: `LOT_ID#${mockRestockSkuCommand.restockSkuData.lotId}`,
          sku: mockRestockSkuCommand.restockSkuData.sku,
          units: mockRestockSkuCommand.restockSkuData.units,
          lotId: mockRestockSkuCommand.restockSkuData.lotId,
          createdAt: mockRestockSkuCommand.restockSkuData.createdAt,
          updatedAt: mockRestockSkuCommand.restockSkuData.updatedAt,
          _tn: 'WAREHOUSE#LOT',
        },
        ConditionExpression: 'attribute_not_exists(pk)',
      },
    },
    {
      Update: {
        TableName: mockWarehouseTableName,
        Key: {
          pk: `SKU#${mockRestockSkuCommand.restockSkuData.sku}`,
          sk: `SKU#${mockRestockSkuCommand.restockSkuData.sku}`,
        },
        UpdateExpression:
          `SET ` +
          `#sku = :sku, ` +
          `#units = if_not_exists(#units, :zero) + :units, ` +
          `#createdAt = if_not_exists(#createdAt, :createdAt), ` +
          `#updatedAt = :updatedAt, ` +
          `#_tn = :_tn`,
        ExpressionAttributeNames: {
          '#sku': 'sku',
          '#units': 'units',
          '#createdAt': 'createdAt',
          '#updatedAt': 'updatedAt',
          '#_tn': '_tn',
        },
        ExpressionAttributeValues: {
          ':sku': mockRestockSkuCommand.restockSkuData.sku,
          ':units': mockRestockSkuCommand.restockSkuData.units,
          ':createdAt': mockRestockSkuCommand.restockSkuData.createdAt,
          ':updatedAt': mockRestockSkuCommand.restockSkuData.updatedAt,
          ':zero': 0,
          ':_tn': 'WAREHOUSE#SKU',
        },
      },
    },
  ],
})

//
// Mock clients
//
function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws_ConditionalCheckFailedException_Duplicate(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
    CancellationReasons: [{ Code: DynamoDbUtils.CancellationReasons.ConditionalCheckFailed }, null],
  })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service RestockSkuWorker DbRestockSkuClient tests`, () => {
  //
  // Test RestockSkuCommand edge cases
  //
  it(`returns a Success if the input RestockSkuCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = undefined as RestockSkuCommand
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = null as RestockSkuCommand
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommand.restockSkuData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = buildMockRestockSkuCommand()
    mockRestockSkuCommand.restockSkuData = undefined
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommand.restockSkuData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = buildMockRestockSkuCommand()
    mockRestockSkuCommand.restockSkuData = null
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedTransactWriteCommand.input }),
    )
  })

  it(`returns a transient Failure of kind UnrecognizedError
      if DynamoDBDocumentClient.send throws a generic Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  //
  // Test transaction errors
  //
  it(`returns a non-transient Failure of kind DuplicateRestockOperationError
      if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException error 
      when restocking the sku`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException_Duplicate()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateRestockOperationError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the  expected Success<void> with the expected data`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
