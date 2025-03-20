import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { OrderCreatedEvent } from '../model/OrderCreatedEvent'
import { EsRaiseOrderCreatedEventClient } from './EsRaiseOrderCreatedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toUTCString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

function buildMockOrderCreatedEvent(): TypeUtilsMutable<OrderCreatedEvent> {
  const mockClass = OrderCreatedEvent.validateAndBuild({
    incomingEventName: OrderEventName.ORDER_PLACED_EVENT,
    orderData: {
      orderId: 'mockOrderId',
      orderStatus: OrderStatus.ORDER_CREATED_STATUS,
      sku: 'mockSku',
      units: 2,
      price: 3.98,
      userId: 'mockUserId',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockValidEvent = buildMockOrderCreatedEvent()

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

function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws_ConditionalCheckFailedException(): DynamoDBDocumentClient {
  const error = new ConditionalCheckFailedException({ $metadata: {}, message: '' })
  return { send: jest.fn().mockRejectedValue(error) } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service PlaceOrderApi EsRaiseOrderCreatedEventClient tests`, () => {
  //
  // Test OrderCreatedEvent edge cases
  //
  it(`returns a Success if the input OrderCreatedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderCreatedEvent
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderCreatedEvent
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEvent.eventDate is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderCreatedEvent()
    mockTestEvent.eventData = undefined
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEvent.eventDate is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderCreatedEvent()
    mockTestEvent.eventData = null
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`returns a transient Failure of kind UnrecognizedError if 
      DynamoDBDocumentClient.send throws a generic Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateEventRaisedError
      if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateEventRaisedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected result
  //
  it(`returns the expected Success<void> with the expected data`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
