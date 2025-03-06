import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { Result } from '../../errors/Result'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { IncomingOrderEvent } from './IncomingOrderEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingOrderEvent = {
  -readonly [K in keyof IncomingOrderEvent]: IncomingOrderEvent[K]
}

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

function buildMockEventBrideEvent(incomingOrderEvent: IncomingOrderEvent) {
  const mockEventBridgeEvent: EventBridgeEvent<string, MockEventDetail> = {
    id: `mockId`,
    version: '0',
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
        NewImage: marshall(incomingOrderEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockValidIncomingOrderEvent(): Mutable_IncomingOrderEvent {
  const incomingIncomingOrderEvent: Mutable_IncomingOrderEvent = {
    eventName: OrderEventName.ORDER_PLACED_EVENT,
    eventData: {
      orderId: 'mockOrderId',
      orderStatus: OrderStatus.ORDER_CREATED_STATUS,
      sku: 'mockSku',
      units: 4,
      price: 1432,
      userId: 'mockUserId',
      createdAt: 'mockCreatedAt',
      updatedAt: 'mockUpdatedAt',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingIncomingOrderEvent
}

describe(`Orders Service SyncOrderWorker IncomingOrderEvent tests`, () => {
  //
  // Test valid IncomingOrderEvent success
  //
  it(`returns a Success if the input IncomingOrderEvent is valid`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  // Test EventBridgeEvent edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is undefined`, () => {
    const mockEventBridgeEvent = undefined as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is invalid`, () => {
    const mockEventBridgeEvent = 'mockInvalidValue' as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test EventBridgeEvent.detail edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = undefined as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is invalid`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail.dynamodb
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is invalid`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb.newImage edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderEvent) is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderEvent) is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderEvent) is invalid`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.eventName edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is blank`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is not an OrderEventName`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.eventData edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData invalid`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.eventData.orderId edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.orderId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId is blank`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId length < 4`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.eventData.orderStatus edge cases
  //
  it(`does not throw if the input IncomingOrderEvent.eventData.orderStatus is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.orderStatus
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`does not throw if the input IncomingOrderEvent.eventData.orderStatus is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderStatus = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderStatus is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderStatus = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderStatus is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderStatus = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderStatus is blank`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderStatus = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderStatus is not an OrderStatus`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderStatus = 'mockOrderStatus' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.eventData.sku edge cases
  //
  it(`does not throw if the input IncomingOrderEvent.eventData.sku is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`does not throw if the input IncomingOrderEvent.eventData.sku is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.sku is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.sku is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.sku is blank`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.sku length < 4`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.eventData.units edge cases
  //
  it(`does not throw if the input IncomingOrderEvent.eventData.units is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.units
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`does not throw if the input IncomingOrderEvent.eventData.units is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.units is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.units is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.units is not a number`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.units < 1`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.units is not an integer`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.eventData.price edge cases
  //
  it(`does not throw if the input IncomingOrderEvent.eventData.price is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.price
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`does not throw if the input IncomingOrderEvent.eventData.price is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.price is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.price is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.price is not a number`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = '0' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.price < 0`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = -1
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.eventData.userId edge cases
  //
  it(`does not throw if the input IncomingOrderEvent.eventData.userId is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.userId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`does not throw if the input IncomingOrderEvent.eventData.userId is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.userId is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.userId is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.userId is blank`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.userId length < 4`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.eventData.createdAt edge cases
  //
  it(`does not throw if the input IncomingOrderEvent.eventData.createdAt is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`does not throw if the input IncomingOrderEvent.eventData.createdAt is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.createdAt is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.createdAt is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.createdAt is blank`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.createdAt length < 4`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.eventData.updatedAt edge cases
  //
  it(`does not throw if the input IncomingOrderEvent.eventData.updatedAt is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`does not throw if the input IncomingOrderEvent.eventData.updatedAt is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.updatedAt is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.updatedAt is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.updatedAt is blank`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.updatedAt length < 4`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.createdAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt is blank`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt length < 4`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderEvent.updatedAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt is undefined`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt is null`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt is empty`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt is blank`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt length < 4`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<IncomingOrderEvent> with the expected data`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderEvent = {
      eventName: mockIncomingOrderEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderEvent.eventData.orderId,
        orderStatus: mockIncomingOrderEvent.eventData.orderStatus,
        sku: mockIncomingOrderEvent.eventData.sku,
        units: mockIncomingOrderEvent.eventData.units,
        price: mockIncomingOrderEvent.eventData.price,
        userId: mockIncomingOrderEvent.eventData.userId,
        createdAt: mockIncomingOrderEvent.eventData.createdAt,
        updatedAt: mockIncomingOrderEvent.eventData.updatedAt,
      },
      createdAt: mockIncomingOrderEvent.createdAt,
      updatedAt: mockIncomingOrderEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })

  it(`returns the expected Success<IncomingOrderEvent> if the input is valid and sku is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderEvent = {
      eventName: mockIncomingOrderEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderEvent.eventData.orderId,
        orderStatus: mockIncomingOrderEvent.eventData.orderStatus,
        units: mockIncomingOrderEvent.eventData.units,
        price: mockIncomingOrderEvent.eventData.price,
        userId: mockIncomingOrderEvent.eventData.userId,
        createdAt: mockIncomingOrderEvent.eventData.createdAt,
        updatedAt: mockIncomingOrderEvent.eventData.updatedAt,
      },
      createdAt: mockIncomingOrderEvent.createdAt,
      updatedAt: mockIncomingOrderEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })

  it(`returns the expected Success<IncomingOrderEvent> if the input is valid and units is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.units
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderEvent = {
      eventName: mockIncomingOrderEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderEvent.eventData.orderId,
        orderStatus: mockIncomingOrderEvent.eventData.orderStatus,
        sku: mockIncomingOrderEvent.eventData.sku,
        price: mockIncomingOrderEvent.eventData.price,
        userId: mockIncomingOrderEvent.eventData.userId,
        createdAt: mockIncomingOrderEvent.eventData.createdAt,
        updatedAt: mockIncomingOrderEvent.eventData.updatedAt,
      },
      createdAt: mockIncomingOrderEvent.createdAt,
      updatedAt: mockIncomingOrderEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })

  it(`returns the expected Success<IncomingOrderEvent> if the input is valid and price is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.price
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderEvent = {
      eventName: mockIncomingOrderEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderEvent.eventData.orderId,
        orderStatus: mockIncomingOrderEvent.eventData.orderStatus,
        sku: mockIncomingOrderEvent.eventData.sku,
        units: mockIncomingOrderEvent.eventData.units,
        userId: mockIncomingOrderEvent.eventData.userId,
        createdAt: mockIncomingOrderEvent.eventData.createdAt,
        updatedAt: mockIncomingOrderEvent.eventData.updatedAt,
      },
      createdAt: mockIncomingOrderEvent.createdAt,
      updatedAt: mockIncomingOrderEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })

  it(`returns the expected Success<IncomingOrderEvent> if the input is valid and userId is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.userId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderEvent = {
      eventName: mockIncomingOrderEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderEvent.eventData.orderId,
        orderStatus: mockIncomingOrderEvent.eventData.orderStatus,
        sku: mockIncomingOrderEvent.eventData.sku,
        units: mockIncomingOrderEvent.eventData.units,
        price: mockIncomingOrderEvent.eventData.price,
        createdAt: mockIncomingOrderEvent.eventData.createdAt,
        updatedAt: mockIncomingOrderEvent.eventData.updatedAt,
      },
      createdAt: mockIncomingOrderEvent.createdAt,
      updatedAt: mockIncomingOrderEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })

  it(`returns the expected Success<IncomingOrderEvent> if the input is valid and createdAt is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderEvent = {
      eventName: mockIncomingOrderEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderEvent.eventData.orderId,
        orderStatus: mockIncomingOrderEvent.eventData.orderStatus,
        sku: mockIncomingOrderEvent.eventData.sku,
        units: mockIncomingOrderEvent.eventData.units,
        price: mockIncomingOrderEvent.eventData.price,
        userId: mockIncomingOrderEvent.eventData.userId,
        updatedAt: mockIncomingOrderEvent.eventData.updatedAt,
      },
      createdAt: mockIncomingOrderEvent.createdAt,
      updatedAt: mockIncomingOrderEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })

  it(`returns the expected Success<IncomingOrderEvent> if the input is valid and updatedAt is missing`, () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderEvent = {
      eventName: mockIncomingOrderEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderEvent.eventData.orderId,
        orderStatus: mockIncomingOrderEvent.eventData.orderStatus,
        sku: mockIncomingOrderEvent.eventData.sku,
        units: mockIncomingOrderEvent.eventData.units,
        price: mockIncomingOrderEvent.eventData.price,
        userId: mockIncomingOrderEvent.eventData.userId,
        createdAt: mockIncomingOrderEvent.eventData.createdAt,
      },
      createdAt: mockIncomingOrderEvent.createdAt,
      updatedAt: mockIncomingOrderEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })
})
