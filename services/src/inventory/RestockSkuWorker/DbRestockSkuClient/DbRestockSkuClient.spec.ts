import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { RestockSkuCommand } from '../model/RestockSkuCommand'
import { DbRestockSkuClient } from './DbRestockSkuClient'

const mockInventoryName = 'mockInventoryTableName'

process.env.INVENTORY_TABLE_NAME = mockInventoryName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockSku = 'mockSku'
const mockUnits = 3
const mockLotId = 'mockLotId'

function buildMockRestockSkuCommand(): TypeUtilsMutable<RestockSkuCommand> {
  const mockClass = RestockSkuCommand.validateAndBuild({
    incomingSkuRestockedEvent: {
      eventName: InventoryEventName.SKU_RESTOCKED_EVENT,
      eventData: {
        sku: mockSku,
        units: mockUnits,
        lotId: mockLotId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockRestockSkuCommand = buildMockRestockSkuCommand()

function buildMockDdbCommand(): TransactWriteCommand {
  const ddbCommand = new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: mockInventoryName,
          Item: {
            pk: `INVENTORY#SKU#${mockSku}`,
            sk: `LOT_ID#${mockLotId}`,
            sku: mockSku,
            units: mockUnits,
            lotId: mockLotId,
            createdAt: mockDate,
            updatedAt: mockDate,
            _tn: 'INVENTORY#RESTOCK',
            _sn: `INVENTORY`,
            gsi1pk: 'INVENTORY#RESTOCK',
            gsi1sk: `CREATED_AT#${mockDate}`,
          },
          ConditionExpression: 'attribute_not_exists(pk)',
        },
      },
      {
        Update: {
          TableName: mockInventoryName,
          Key: {
            pk: `INVENTORY#SKU#${mockSku}`,
            sk: `SKU#${mockSku}`,
          },
          UpdateExpression:
            `SET ` +
            `#sku = :sku, ` +
            `#units = if_not_exists(#units, :zero) + :units, ` +
            `#createdAt = if_not_exists(#createdAt, :createdAt), ` +
            `#updatedAt = :updatedAt, ` +
            `#_tn = :_tn, ` +
            `#_sn = :_sn, ` +
            `#gsi1pk = :gsi1pk, ` +
            `#gsi1sk = :gsi1sk`,
          ExpressionAttributeNames: {
            '#sku': 'sku',
            '#units': 'units',
            '#createdAt': 'createdAt',
            '#updatedAt': 'updatedAt',
            '#_tn': '_tn',
            '#_sn': '_sn',
            '#gsi1pk': 'gsi1pk',
            '#gsi1sk': 'gsi1sk',
          },
          ExpressionAttributeValues: {
            ':sku': mockSku,
            ':units': mockUnits,
            ':createdAt': mockDate,
            ':updatedAt': mockDate,
            ':zero': 0,
            ':_tn': 'INVENTORY#SKU',
            ':_sn': 'INVENTORY',
            ':gsi1pk': 'INVENTORY#SKU',
            ':gsi1sk': `CREATED_AT#${mockDate}`,
          },
        },
      },
    ],
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
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

describe(`Inventory Service RestockSkuWorker DbRestockSkuClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommand edge cases
   ************************************************************/
  it(`does not return a Failure if the input RestockSkuCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockTestCommand = undefined as RestockSkuCommand
    const result = await dbRestockSkuClient.restockSku(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockTestCommand = null as RestockSkuCommand
    const result = await dbRestockSkuClient.restockSku(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommand is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockTestCommand = { ...mockRestockSkuCommand }
    const result = await dbRestockSkuClient.restockSku(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommand.commandData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = buildMockRestockSkuCommand()
    mockRestockSkuCommand.commandData = undefined
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = buildMockRestockSkuCommand()
    mockRestockSkuCommand.commandData = null
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
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
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateRestockOperationError if
      DynamoDBDocumentClient.send throws a ConditionalCheckFailedException error when
      restocking the sku`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException_Duplicate()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateRestockOperationError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<void> if the execution path is successful`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
