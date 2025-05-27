import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { IncomingOrderPaymentRejectedEvent } from './IncomingOrderPaymentRejectedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockEventName = InventoryEventName.ORDER_PAYMENT_REJECTED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 4
const mockPrice = 100.34
const mockUserId = 'mockUserId'

function buildMockIncomingOrderPaymentRejectedEvent(): TypeUtilsMutable<IncomingOrderPaymentRejectedEvent> {
  const incomingOrderPaymentRejectedEvent: TypeUtilsMutable<IncomingOrderPaymentRejectedEvent> = {
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
  }
  return incomingOrderPaymentRejectedEvent
}

type MockEventDetail = {
  awsRegion: string
  eventID: string
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventVersion: string
  dynamodb: {
    NewImage: Record<string, AttributeValue>
  }
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
function buildMockEventBridgeEvent(
  incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
): EventBridgeEvent<string, MockEventDetail> {
  const mockEventBridgeEvent: EventBridgeEvent<string, MockEventDetail> = {
    'detail-type': 'mockDetailType',
    account: 'mockAccount',
    id: 'mockId',
    region: 'mockRegion',
    resources: [],
    source: 'mockSource',
    time: 'mockTime',
    version: 'mockVersion',
    detail: {
      awsRegion: 'mockAwsRegion',
      eventID: 'mockEventId',
      eventName: 'INSERT',
      eventSource: 'aws:dynamodb',
      eventVersion: 'mockEventVersion',
      dynamodb: {
        NewImage: marshall(incomingOrderPaymentRejectedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

describe(`Inventory Service DeallocateOrderPaymentRejectedWorker
          IncomingOrderPaymentRejectedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test EventBridgeEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input EventBridgeEvent is valid`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is undefined`, () => {
    const mockEventBridgeEvent = undefined as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is null`, () => {
    const mockEventBridgeEvent = null as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test EventBridgeEvent.detail edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail = undefined as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail = null as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test EventBridgeEvent.detail.dynamodb edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb = null as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test EventBridgeEvent.detail.dynamodb.newImage edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderPaymentRejectedEvent) is
      undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderPaymentRejectedEvent) is
      null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = null as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventName edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is not an InventoryEventName`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.createdAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt length < 4`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.updatedAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt length < 4`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData invalid`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.orderId is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.orderId is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.orderId is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.orderId is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.orderId length < 4`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku length < 4`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units < 1`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is not an integer`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is not a number`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData.price edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.price is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.price = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.price is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.price = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.price < 0`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.price = -1
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.price is not a number`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.price = '1' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData.userId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.userId is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.userId is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.userId is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.userId is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.userId length < 4`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<IncomingOrderPaymentRejectedEvent> if the execution
      path is successful`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderPaymentRejectedEvent = {
      eventName: mockIncomingOrderPaymentRejectedEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderPaymentRejectedEvent.eventData.orderId,
        sku: mockIncomingOrderPaymentRejectedEvent.eventData.sku,
        units: mockIncomingOrderPaymentRejectedEvent.eventData.units,
        price: mockIncomingOrderPaymentRejectedEvent.eventData.price,
        userId: mockIncomingOrderPaymentRejectedEvent.eventData.userId,
      },
      createdAt: mockIncomingOrderPaymentRejectedEvent.createdAt,
      updatedAt: mockIncomingOrderPaymentRejectedEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
