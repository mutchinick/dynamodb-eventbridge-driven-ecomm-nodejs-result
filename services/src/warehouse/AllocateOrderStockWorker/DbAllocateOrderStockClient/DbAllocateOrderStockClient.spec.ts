import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'
import { DbAllocateOrderStockClient } from './DbAllocateOrderStockClient'

const mockWarehouseTableName = 'mockWarehouseTableName'

process.env.WAREHOUSE_TABLE_NAME = mockWarehouseTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockEventName = WarehouseEventName.ORDER_CREATED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'

function buildMockAllocateOrderStockCommand(): TypeUtilsMutable<AllocateOrderStockCommand> {
  const mockClass = AllocateOrderStockCommand.validateAndBuild({
    incomingOrderCreatedEvent: {
      eventName: mockEventName,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockAllocateOrderStockCommand = buildMockAllocateOrderStockCommand()

function buildMockDdbCommand(): TransactWriteCommand {
  const ddbCommand = new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: mockWarehouseTableName,
          Item: {
            pk: `WAREHOUSE#SKU#${mockSku}`,
            sk: `SKU#${mockSku}#ORDER_ID#${mockOrderId}#ALLOCATION`,
            sku: mockSku,
            orderId: mockOrderId,
            units: mockUnits,
            price: mockPrice,
            userId: mockUserId,
            allocationStatus: `ALLOCATED`,
            createdAt: mockDate,
            updatedAt: mockDate,
            _tn: `WAREHOUSE#ALLOCATION`,
            _sn: `WAREHOUSE`,
            gsi1pk: `WAREHOUSE#ALLOCATION`,
            gsi1sk: `CREATED_AT#${mockDate}`,
          },
          ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        },
      },
      {
        Update: {
          TableName: mockWarehouseTableName,
          Key: {
            pk: `WAREHOUSE#SKU#${mockSku}`,
            sk: `SKU#${mockSku}`,
          },
          UpdateExpression: 'SET #units = #units - :units, #updatedAt = :updatedAt',
          ExpressionAttributeNames: {
            '#units': 'units',
            '#updatedAt': 'updatedAt',
          },
          ExpressionAttributeValues: {
            ':units': mockUnits,
            ':updatedAt': mockDate,
          },
          ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk) and #units >= :units',
        },
      },
    ],
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

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

function buildMockDdbDocClient_throws_ConditionalCheckFailedException_Duplicate_Depleted(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
    CancellationReasons: [
      { Code: DynamoDbUtils.CancellationReasons.ConditionalCheckFailed },
      { Code: DynamoDbUtils.CancellationReasons.ConditionalCheckFailed },
    ],
  })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws_ConditionalCheckFailedException_Depleted(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
    CancellationReasons: [null, { Code: DynamoDbUtils.CancellationReasons.ConditionalCheckFailed }],
  })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service AllocateOrderStockWorker DbAllocateOrderStockClient tests`, () => {
  //
  // Test AllocateOrderStockCommand edge cases
  //
  it(`returns a Success if the input AllocateOrderStockCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if the input AllocateOrderStockCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockValidCommand = undefined as AllocateOrderStockCommand
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockValidCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if the input AllocateOrderStockCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockValidCommand = null as AllocateOrderStockCommand
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockValidCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if the input AllocateOrderStockCommand.allocateOrderStockData 
      is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockValidCommand = buildMockAllocateOrderStockCommand()
    mockValidCommand.allocateOrderStockData = undefined
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockValidCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if the input AllocateOrderStockCommand.allocateOrderStockData 
      is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockValidCommand = buildMockAllocateOrderStockCommand()
    mockValidCommand.allocateOrderStockData = null
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockValidCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  //
  it(`returns a transient Failure of kind UnrecognizedError
      if DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  //
  // Test transaction errors
  //
  it(`returns a non-transient Failure of kind DuplicateStockAllocationError
      if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException error 
      when allocating the stock`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException_Duplicate()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateStockAllocationError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind DuplicateStockAllocationError
      if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException error 
      when both allocating and subtracting the stock`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException_Duplicate_Depleted()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateStockAllocationError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind DepletedStockAllocationError
      if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException error
      when subtracting the sku stock`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException_Depleted()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DepletedStockAllocationError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<void> with the expected data`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
