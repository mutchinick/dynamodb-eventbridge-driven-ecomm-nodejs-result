import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderEventName } from '../../model/OrderEventName'
import { IncomingOrderEvent } from './IncomingOrderEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = OrderEventName.ORDER_PLACED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 4
const mockPrice = 1432
const mockUserId = 'mockUserId'

function buildMockIncomingOrderEvent(): TypeUtilsMutable<IncomingOrderEvent> {
  const incomingIncomingOrderEvent: TypeUtilsMutable<IncomingOrderEvent> = {
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
  return incomingIncomingOrderEvent
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
function buildMockEventBridgeEvent(incomingOrderEvent: IncomingOrderEvent): EventBridgeEvent<string, MockEventDetail> {
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
        NewImage: marshall(incomingOrderEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

describe(`Orders Service SyncOrderWorker IncomingOrderEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test EventBridgeEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input EventBridgeEvent is valid`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is undefined`, () => {
    const mockEventBridgeEvent = undefined as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is null`, () => {
    const mockEventBridgeEvent = null as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
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
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = undefined as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = null as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
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
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb = null as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
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
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderEvent) is undefined`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderEvent) is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = null as never
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventName edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is undefined`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is empty`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is blank`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventName is not an OrderEventName`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.createdAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt is undefined`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt is empty`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt is blank`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.createdAt length < 4`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.updatedAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt is undefined`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt is empty`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt is blank`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.updatedAt length < 4`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData is undefined`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData is empty`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData invalid`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId is undefined`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId is empty`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId is blank`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.orderId length < 4`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.sku is undefined`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.sku is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.sku is empty`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.sku is blank`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.sku length < 4`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.units is undefined`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.units is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.units < 1`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.units is not an integer`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.units is not a number`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData.price edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.price is undefined`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.price is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.price < 0`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = -1
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.price is not a number`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = '0' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData.userId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.userId is undefined`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.userId is null`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.userId is empty`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.userId is blank`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderEvent.eventData.userId length < 4`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
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
  it(`returns the expected Success<IncomingOrderEvent> if the execution path is
      successful`, () => {
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderEvent = {
      eventName: mockIncomingOrderEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderEvent.eventData.orderId,
        sku: mockIncomingOrderEvent.eventData.sku,
        units: mockIncomingOrderEvent.eventData.units,
        price: mockIncomingOrderEvent.eventData.price,
        userId: mockIncomingOrderEvent.eventData.userId,
      },
      createdAt: mockIncomingOrderEvent.createdAt,
      updatedAt: mockIncomingOrderEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
