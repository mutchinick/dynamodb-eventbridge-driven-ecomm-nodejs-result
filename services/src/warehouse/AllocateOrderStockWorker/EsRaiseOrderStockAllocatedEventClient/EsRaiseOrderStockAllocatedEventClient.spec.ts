import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { EsRaiseOrderStockAllocatedEventClient } from './EsRaiseOrderStockAllocatedEventClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockEventName = WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'

function buildMockOrderStockAllocatedEvent(): TypeUtilsMutable<OrderStockAllocatedEvent> {
  const mockClass = OrderStockAllocatedEvent.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockOrderStockAllocatedEvent = buildMockOrderStockAllocatedEvent()

function buildMockDdbCommand(): PutCommand {
  const ddbCommand = new PutCommand({
    TableName: mockEventStoreTableName,
    Item: {
      pk: `EVENTS#ORDER_ID#${mockOrderId}`,
      sk: `EVENT#${mockEventName}`,
      _tn: `EVENTS#EVENT`,
      _sn: `EVENTS`,
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
      gsi1pk: `EVENTS#EVENT`,
      gsi1sk: `CREATED_AT#${mockDate}`,
    },
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
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

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service AllocateOrderStockWorker EsRaiseOrderStockAllocatedEventClient
          tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input OrderStockAllocatedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderStockAllocatedEvent
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderStockAllocatedEvent
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEvent is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = { ...mockOrderStockAllocatedEvent }
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEvent.eventData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderStockAllocatedEvent()
    mockTestEvent.eventData = undefined
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderStockAllocatedEvent()
    mockTestEvent.eventData = null
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
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
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateEventRaisedError if
      DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: 'ConditionalCheckFailed' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateEventRaisedError')).toBe(true)
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
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
