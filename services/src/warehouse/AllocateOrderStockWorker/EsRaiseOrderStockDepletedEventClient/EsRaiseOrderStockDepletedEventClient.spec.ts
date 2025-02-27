import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'
import { EsRaiseOrderStockDepletedEventClient } from './EsRaiseOrderStockDepletedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toUTCString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockValidEvent: OrderStockDepletedEvent = {
  eventName: WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
  createdAt: mockDate,
  updatedAt: mockDate,
  eventData: {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
  },
}

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `ORDER_ID#${mockValidEvent.eventData.orderId}`,
    sk: `EVENT#${mockValidEvent.eventName}`,
    _tn: '#EVENT',
    ...mockValidEvent,
  },
  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
})

function buildMockDdbDocClient_send_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Duplicate(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
    CancellationReasons: [{ Code: DynamoDbUtils.CancellationReasons.ConditionalCheckFailed }, null],
  })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service AllocateOrderStockApi EsRaiseOrderStockDepletedEventClient tests`, () => {
  //
  // Test OrderStockDepletedEvent edge cases
  //
  it(`returns a Success if the input OrderStockDepletedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockValidEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if OrderStockDepletedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderStockDepletedEvent
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if OrderStockDepletedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderStockDepletedEvent
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if OrderStockDepletedEvent is empty`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = {} as OrderStockDepletedEvent
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`returns a transient Failure of kind UnrecognizedError
      if DynamoDBDocumentClient.send throws a generic Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockValidEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateEventRaisedError
      if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Duplicate()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockValidEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateEventRaisedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<void>`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockValidEvent)
    const expectedResult = Result.makeSuccess()
    expect(result).toStrictEqual(expectedResult)
  })
})
