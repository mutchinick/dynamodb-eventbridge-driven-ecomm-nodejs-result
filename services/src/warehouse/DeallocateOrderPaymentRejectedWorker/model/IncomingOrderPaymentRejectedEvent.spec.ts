import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IncomingOrderPaymentRejectedEvent } from './IncomingOrderPaymentRejectedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type MockEventDetail = {
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventID: string
  eventVersion: string
  awsRegion: string
  dynamodb: {
    NewImage: AttributeValue | Record<string, AttributeValue>
  }
}

// COMBAK: Figure a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockEventBrideEvent(
  incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
): EventBridgeEvent<string, MockEventDetail> {
  const mockEventBridgeEvent: EventBridgeEvent<string, MockEventDetail> = {
    id: `mockId`,
    version: 'mockVersion',
    'detail-type': 'mockDetailType',
    source: 'mockSource',
    account: 'mockAccount',
    time: 'mockTime',
    region: 'mockRegion',
    resources: [],
    detail: {
      eventID: 'mockEventId',
      eventVersion: 'mockEventVersion',
      awsRegion: 'mockAwsRegion',
      eventName: 'INSERT',
      eventSource: 'aws:dynamodb',
      dynamodb: {
        NewImage: marshall(incomingOrderPaymentRejectedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockIncomingOrderPaymentRejectedEvent(): TypeUtilsMutable<IncomingOrderPaymentRejectedEvent> {
  const incomingOrderPaymentRejectedEvent: TypeUtilsMutable<IncomingOrderPaymentRejectedEvent> = {
    eventName: WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT,
    eventData: {
      orderId: 'mockOrderId',
      sku: 'mockSku',
      units: 4,
      price: 100.34,
      userId: 'mockUserId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingOrderPaymentRejectedEvent
}

describe(`Warehouse Service DeallocateOrderPaymentRejectedWorker IncomingOrderPaymentRejectedEvent tests`, () => {
  //
  // Test valid IncomingOrderPaymentRejectedEvent success
  //
  it(`returns a Success if the input IncomingOrderPaymentRejectedEvent is valid`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  // Test EventBridgeEvent edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is undefined`, () => {
    const mockEventBridgeEvent = undefined as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is invalid`, () => {
    const mockEventBridgeEvent = 'mockInvalidValue' as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test EventBridgeEvent.detail edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is missing`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    delete mockEventBridgeEvent.detail
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail = undefined as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is invalid`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is missing`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    delete mockEventBridgeEvent.detail.dynamodb
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is invalid`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb.newImage edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderPaymentRejectedEvent) is missing`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderPaymentRejectedEvent) is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderPaymentRejectedEvent) is invalid`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventName edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is missing`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    delete mockIncomingOrderPaymentRejectedEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventName is not an WarehouseEventName`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventData edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData is missing`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    delete mockIncomingOrderPaymentRejectedEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData invalid`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventData.orderId edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
    IncomingOrderPaymentRejectedEvent.eventData.orderId is missing`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    delete mockIncomingOrderPaymentRejectedEvent.eventData.orderId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
    IncomingOrderPaymentRejectedEvent.eventData.orderId is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
    IncomingOrderPaymentRejectedEvent.eventData.orderId is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
    IncomingOrderPaymentRejectedEvent.eventData.orderId is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
    IncomingOrderPaymentRejectedEvent.eventData.orderId is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
    IncomingOrderPaymentRejectedEvent.eventData.orderId length < 4`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventData.sku edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is missing`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    delete mockIncomingOrderPaymentRejectedEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku length < 4`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventData.units edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is missing`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    delete mockIncomingOrderPaymentRejectedEvent.eventData.units
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is not a number`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units < 1`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is not an integer`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.createdAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt is missing`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    delete mockIncomingOrderPaymentRejectedEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.createdAt length < 4`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.updatedAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is missing`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    delete mockIncomingOrderPaymentRejectedEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is undefined`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is null`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is empty`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is blank`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderPaymentRejectedEvent.updatedAt length < 4`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    mockIncomingOrderPaymentRejectedEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<IncomingOrderPaymentRejectedEvent> with the expected data`, () => {
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderPaymentRejectedEvent)
    const result = IncomingOrderPaymentRejectedEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderPaymentRejectedEvent = {
      eventName: WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT,
      eventData: {
        sku: mockIncomingOrderPaymentRejectedEvent.eventData.sku,
        units: mockIncomingOrderPaymentRejectedEvent.eventData.units,
        orderId: mockIncomingOrderPaymentRejectedEvent.eventData.orderId,
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
