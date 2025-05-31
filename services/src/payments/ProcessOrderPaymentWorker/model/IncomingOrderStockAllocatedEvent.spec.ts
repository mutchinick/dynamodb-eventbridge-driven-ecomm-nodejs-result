import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { IncomingOrderStockAllocatedEvent } from './IncomingOrderStockAllocatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 4
const mockPrice = 100.34
const mockUserId = 'mockUserId'

function buildMockIncomingOrderStockAllocatedEvent(): TypeUtilsMutable<IncomingOrderStockAllocatedEvent> {
  const incomingOrderStockAllocatedEvent: TypeUtilsMutable<IncomingOrderStockAllocatedEvent> = {
    eventName: PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT,
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
  return incomingOrderStockAllocatedEvent
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
  incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
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
        NewImage: marshall(incomingOrderStockAllocatedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

describe(`Payments Service ProcessOrderPaymentWorker IncomingOrderStockAllocatedEvent
          tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test EventBridgeEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input EventBridgeEvent is valid`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is undefined`, () => {
    const mockEventBridgeEvent = undefined as never
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is null`, () => {
    const mockEventBridgeEvent = null as never
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
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
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    mockEventBridgeEvent.detail = undefined as never
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    mockEventBridgeEvent.detail = null as never
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
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
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    mockEventBridgeEvent.detail.dynamodb = null as never
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
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
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderStockAllocatedEvent) is
      undefined`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderStockAllocatedEvent) is
      null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = null as never
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventName edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventName is undefined`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventName is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventName is empty`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventName is blank`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventName is not an PaymentsEventName`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.createdAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.createdAt is undefined`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.createdAt is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.createdAt is empty`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.createdAt is blank`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.createdAt length < 4`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.updatedAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.updatedAt is undefined`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.updatedAt is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.updatedAt is empty`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.updatedAt is blank`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.updatedAt length < 4`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData is undefined`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData is empty`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData invalid`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.orderId is undefined`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.orderId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.orderId is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.orderId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.orderId is empty`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.orderId = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.orderId is blank`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.orderId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.orderId length < 4`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.orderId = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.sku is undefined`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.sku is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.sku is empty`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.sku is blank`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.sku length < 4`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.units is undefined`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.units is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.units < 1`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.units is not an integer`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.units is not a number`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData.price edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.price is undefined`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.price = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.price is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.price = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.price < 0`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.price = -1
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.price is not a number`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.price = '1' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData.userId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.userId is undefined`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.userId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.userId is null`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.userId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.userId is empty`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.userId = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.userId is blank`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.userId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderStockAllocatedEvent.eventData.userId length < 4`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    mockIncomingOrderStockAllocatedEvent.eventData.userId = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
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
  it(`returns the expected Success<IncomingOrderStockAllocatedEvent> if the execution
      path is successful`, () => {
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderStockAllocatedEvent)
    const result = IncomingOrderStockAllocatedEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderStockAllocatedEvent = {
      eventName: mockIncomingOrderStockAllocatedEvent.eventName,
      eventData: {
        sku: mockIncomingOrderStockAllocatedEvent.eventData.sku,
        units: mockIncomingOrderStockAllocatedEvent.eventData.units,
        orderId: mockIncomingOrderStockAllocatedEvent.eventData.orderId,
        price: mockIncomingOrderStockAllocatedEvent.eventData.price,
        userId: mockIncomingOrderStockAllocatedEvent.eventData.userId,
      },
      createdAt: mockIncomingOrderStockAllocatedEvent.createdAt,
      updatedAt: mockIncomingOrderStockAllocatedEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
