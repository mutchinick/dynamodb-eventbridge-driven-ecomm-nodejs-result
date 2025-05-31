import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { OrderPaymentAcceptedEvent } from '../model/OrderPaymentAcceptedEvent'
import { EsRaiseOrderPaymentAcceptedEventClient } from './EsRaiseOrderPaymentAcceptedEventClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'

function buildMockOrderPaymentAcceptedEvent(): TypeUtilsMutable<OrderPaymentAcceptedEvent> {
  const mockClass = OrderPaymentAcceptedEvent.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockOrderPaymentAcceptedEvent = buildMockOrderPaymentAcceptedEvent()

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

describe(`Payments Service ProcessOrderPaymentWorker
          EsRaiseOrderPaymentAcceptedEventClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test OrderPaymentAcceptedEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input OrderPaymentAcceptedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockOrderPaymentAcceptedEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderPaymentAcceptedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderPaymentAcceptedEvent
    const result = await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderPaymentAcceptedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderPaymentAcceptedEvent
    const result = await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderPaymentAcceptedEvent is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    const mockTestEvent = { ...mockOrderPaymentAcceptedEvent }
    const result = await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentAcceptedEvent.eventData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderPaymentAcceptedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderPaymentAcceptedEvent()
    mockTestEvent.eventData = undefined
    const result = await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderPaymentAcceptedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderPaymentAcceptedEvent()
    mockTestEvent.eventData = null
    const result = await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockTestEvent)
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
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockOrderPaymentAcceptedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockOrderPaymentAcceptedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockOrderPaymentAcceptedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateEventRaisedError if
      DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: 'ConditionalCheckFailed' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockOrderPaymentAcceptedEvent)
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
    const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(mockOrderPaymentAcceptedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
