import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'
import { EsRaiseOrderStockDepletedEventClient } from './EsRaiseOrderStockDepletedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

function buildMockOrderStockDepletedEvent(): TypeUtilsMutable<OrderStockDepletedEvent> {
  const mockClass = OrderStockDepletedEvent.validateAndBuild({
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockOrderStockDepletedEvent = buildMockOrderStockDepletedEvent()

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `ORDER_ID#${mockOrderStockDepletedEvent.eventData.orderId}`,
    sk: `EVENT#${mockOrderStockDepletedEvent.eventName}`,
    _tn: '#EVENT',
    ...mockOrderStockDepletedEvent,
  },
  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
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
  const error = new ConditionalCheckFailedException({ $metadata: {}, message: '' })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service AllocateOrderStockWorker EsRaiseOrderStockDepletedEventClient tests`, () => {
  //
  // Test OrderStockDepletedEvent edge cases
  //
  it(`returns a Success if the input OrderStockDepletedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if OrderStockDepletedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
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
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderStockDepletedEvent
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if OrderStockDepletedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderStockDepletedEvent()
    mockTestEvent.eventData = undefined
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if OrderStockDepletedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderStockDepletedEvent()
    mockTestEvent.eventData = null
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`returns a transient Failure of kind UnrecognizedError
      if DynamoDBDocumentClient.send throws a generic Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateEventRaisedError
      if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException_Duplicate()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateEventRaisedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<void> with the expected data`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
