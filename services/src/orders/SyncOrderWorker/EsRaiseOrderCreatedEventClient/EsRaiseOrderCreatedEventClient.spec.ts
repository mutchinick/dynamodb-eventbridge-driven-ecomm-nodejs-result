import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { OrderCreatedEvent } from '../model/OrderCreatedEvent'
import { EsRaiseOrderCreatedEventClient } from './EsRaiseOrderCreatedEventClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockIncomingEventName = OrderEventName.ORDER_PLACED_EVENT
const mockEventName = OrderEventName.ORDER_CREATED_EVENT
const mockOrderId = 'mockOrderId'
const mockOrderStatus = OrderStatus.ORDER_CREATED_STATUS
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'

function buildMockOrderCreatedEvent(): TypeUtilsMutable<OrderCreatedEvent> {
  const mockClass = OrderCreatedEvent.validateAndBuild({
    incomingEventName: mockIncomingEventName,
    orderData: {
      orderId: mockOrderId,
      orderStatus: mockOrderStatus,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockOrderCreatedEvent = buildMockOrderCreatedEvent()

function buildMockDdbCommand() {
  const ddbCommand = new PutCommand({
    TableName: mockEventStoreTableName,
    Item: {
      pk: `EVENTS#ORDER_ID#${mockOrderId}`,
      sk: `EVENT#${mockEventName}`,
      eventName: mockEventName,
      eventData: {
        orderId: mockOrderId,
        orderStatus: mockOrderStatus,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
      _tn: `EVENTS#EVENT`,
      _sn: `EVENTS`,
      gsi1pk: `EVENTS#EVENT`,
      gsi1sk: `CREATED_AT#${mockDate}`,
    },
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
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
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockOrderCreatedEvent)
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
      OrderCreatedEvent.eventData is undefined`, async () => {
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
      OrderCreatedEvent.eventData is null`, async () => {
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
    await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockOrderCreatedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockOrderCreatedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if 
      DynamoDBDocumentClient.send throws a generic Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockOrderCreatedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateEventRaisedError
      if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockOrderCreatedEvent)
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
    const result = await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockOrderCreatedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
