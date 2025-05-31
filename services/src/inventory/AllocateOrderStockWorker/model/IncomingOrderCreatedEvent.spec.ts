import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = InventoryEventName.ORDER_CREATED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 4
const mockPrice = 100.34
const mockUserId = 'mockUserId'

function buildMockIncomingOrderCreatedEvent(): TypeUtilsMutable<IncomingOrderCreatedEvent> {
  const incomingOrderCreatedEvent: TypeUtilsMutable<IncomingOrderCreatedEvent> = {
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
  return incomingOrderCreatedEvent
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
  incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
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
        NewImage: marshall(incomingOrderCreatedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

describe(`Inventory Service AllocateOrderStockWorker IncomingOrderCreatedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test EventBridgeEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input EventBridgeEvent is valid`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is undefined`, () => {
    const mockEventBridgeEvent = undefined as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is null`, () => {
    const mockEventBridgeEvent = null as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
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
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail = undefined as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail = null as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
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
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb = null as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
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
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderCreatedEvent) is
      undefined`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderCreatedEvent) is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = null as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventName edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventName is undefined`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventName is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventName is empty`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventName is blank`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventName is not an InventoryEventName`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.createdAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.createdAt is undefined`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.createdAt is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.createdAt is empty`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.createdAt is blank`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.createdAt length < 4`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.updatedAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.updatedAt is undefined`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.updatedAt is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.updatedAt is empty`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.updatedAt is blank`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.updatedAt length < 4`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData is undefined`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData is empty`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData invalid`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.orderId is undefined`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.orderId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.orderId is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.orderId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.orderId is empty`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.orderId = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.orderId is blank`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.orderId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.orderId length < 4`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.orderId = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.sku is undefined`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.sku is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.sku is empty`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.sku is blank`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.sku length < 4`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.units is undefined`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.units is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.units < 1`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.units is not an integer`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.units is not a number`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData.price edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.price is undefined`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.price = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.price is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.price = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.price < 0`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.price = -1
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.price is not a number`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.price = '1' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData.userId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.userId is undefined`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.userId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.userId is null`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.userId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.userId is empty`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.userId = '' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.userId is blank`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.userId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingOrderCreatedEvent.eventData.userId length < 4`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.userId = '123' as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
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
  it(`returns the expected Success<IncomingOrderCreatedEvent> if the execution path is
      successful`, () => {
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingOrderCreatedEvent = {
      eventName: InventoryEventName.ORDER_CREATED_EVENT,
      eventData: {
        sku: mockIncomingOrderCreatedEvent.eventData.sku,
        units: mockIncomingOrderCreatedEvent.eventData.units,
        orderId: mockIncomingOrderCreatedEvent.eventData.orderId,
        price: mockIncomingOrderCreatedEvent.eventData.price,
        userId: mockIncomingOrderCreatedEvent.eventData.userId,
      },
      createdAt: mockIncomingOrderCreatedEvent.createdAt,
      updatedAt: mockIncomingOrderCreatedEvent.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
