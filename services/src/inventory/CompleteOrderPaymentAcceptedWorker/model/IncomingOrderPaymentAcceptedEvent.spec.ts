import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { IncomingOrderPaymentAcceptedEvent } from './IncomingOrderPaymentAcceptedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 4
const mockPrice = 100.34
const mockUserId = 'mockUserId'

function buildMockIncomingOrderPaymentAcceptedEvent(): TypeUtilsMutable<IncomingOrderPaymentAcceptedEvent> {
  const incomingOrderPaymentAcceptedEvent: TypeUtilsMutable<IncomingOrderPaymentAcceptedEvent> = {
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
  return incomingOrderPaymentAcceptedEvent
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
  incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent,
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
        NewImage: marshall(incomingOrderPaymentAcceptedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

describe(`Inventory Service CompleteOrderPaymentAcceptedWorker
          IncomingOrderPaymentAcceptedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test EventBridgeEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input EventBridgeEvent is valid`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is undefined`, () => {
    const mockEventBridgeEvent = undefined as never
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is null`, () => {
    const mockEventBridgeEvent = null as never
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
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
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    mockEventBridgeEvent.detail = undefined as never
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    mockEventBridgeEvent.detail = null as never
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
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
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    mockEventBridgeEvent.detail.dynamodb = null as never
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
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
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderPaymentAcceptedEvent) is
      undefined`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderPaymentAcceptedEvent) is
      null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = null as never
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventName edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventName is undefined`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventName is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventName is empty`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventName is blank`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventName is not an InventoryEventName`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.createdAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.createdAt is undefined`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.createdAt is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.createdAt is empty`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.createdAt is blank`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.createdAt length < 4`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.updatedAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.updatedAt is undefined`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.updatedAt is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.updatedAt is empty`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.updatedAt is blank`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.updatedAt length < 4`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData is undefined`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData is empty`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData invalid`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.orderId is undefined`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.orderId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.orderId is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.orderId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.orderId is empty`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.orderId = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.orderId is blank`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.orderId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.orderId length < 4`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.orderId = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.sku is undefined`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.sku is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.sku is empty`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.sku is blank`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.sku length < 4`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.units is undefined`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.units is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.units < 1`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.units is not an integer`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.units is not a number`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData.price edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.price is undefined`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.price = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.price is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.price = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.price < 0`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.price = -1
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.price is not a number`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.price = '1' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData.userId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.userId is undefined`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.userId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.userId is null`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.userId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.userId is empty`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.userId = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.userId is blank`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.userId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentAcceptedEvent.eventData.userId length < 4`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    mockIncomingOrderPaymentAcceptedEvent.eventData.userId = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
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
  it(`returns the expected Success<IncomingOrderPaymentAcceptedEvent> if the execution
      path is successful`, () => {
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderPaymentAcceptedEvent)
    const result = IncomingOrderPaymentAcceptedEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderPaymentAcceptedEvent = {
      eventName: mockIncomingOrderPaymentAcceptedEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderPaymentAcceptedEvent.eventData.orderId,
        sku: mockIncomingOrderPaymentAcceptedEvent.eventData.sku,
        units: mockIncomingOrderPaymentAcceptedEvent.eventData.units,
        price: mockIncomingOrderPaymentAcceptedEvent.eventData.price,
        userId: mockIncomingOrderPaymentAcceptedEvent.eventData.userId,
      },
      createdAt: mockIncomingOrderPaymentAcceptedEvent.createdAt,
      updatedAt: mockIncomingOrderPaymentAcceptedEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
