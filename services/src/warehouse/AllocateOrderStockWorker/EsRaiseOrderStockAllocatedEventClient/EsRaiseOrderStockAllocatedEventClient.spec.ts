import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { EsRaiseOrderStockAllocatedEventClient } from './EsRaiseOrderStockAllocatedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

function buildMockOrderStockAllocatedEvent(): TypeUtilsMutable<OrderStockAllocatedEvent> {
  const mockClass = OrderStockAllocatedEvent.validateAndBuild({
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockOrderStockAllocatedEvent = buildMockOrderStockAllocatedEvent()

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `ORDER_ID#${mockOrderStockAllocatedEvent.eventData.orderId}`,
    sk: `EVENT#${mockOrderStockAllocatedEvent.eventName}`,
    _tn: '#EVENT',
    ...mockOrderStockAllocatedEvent,
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

describe(`Warehouse Service AllocateOrderStockWorker EsRaiseOrderStockAllocatedEventClient tests`, () => {
  //
  // Test OrderStockAllocatedEvent edge cases
  //
  it(`returns a Success if the input OrderStockAllocatedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if OrderStockAllocatedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderStockAllocatedEvent
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if OrderStockAllocatedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderStockAllocatedEvent
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if OrderStockAllocatedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderStockAllocatedEvent()
    mockTestEvent.eventData = undefined
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError
      if OrderStockAllocatedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderStockAllocatedEvent()
    mockTestEvent.eventData = null
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`returns a transient Failure of kind UnrecognizedError
      if DynamoDBDocumentClient.send throws a generic Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  //
  // Test transaction errors
  //
  it(`returns a non-transient Failure of kind DuplicateEventRaisedError
      if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException_Duplicate()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateEventRaisedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<void> with the expected  data`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
