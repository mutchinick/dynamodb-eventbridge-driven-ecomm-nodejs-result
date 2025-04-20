import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockEventName = WarehouseEventName.SKU_RESTOCKED_EVENT
const mockSku = 'mockSku'
const mockUnits = 4
const mockLotId = 'mockLotId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate

function buildMockIncomingSkuRestockedEvent(): TypeUtilsMutable<IncomingSkuRestockedEvent> {
  const incomingSkuRestockedEvent: TypeUtilsMutable<IncomingSkuRestockedEvent> = {
    eventName: mockEventName,
    eventData: {
      sku: mockSku,
      units: mockUnits,
      lotId: mockLotId,
    },
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }
  return incomingSkuRestockedEvent
}

type MockEventDetail = {
  awsRegion: string
  eventID: string
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventVersion: string
  dynamodb: {
    NewImage: AttributeValue | Record<string, AttributeValue>
  }
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockEventBrideEvent(
  incomingSkuRestockedEvent: IncomingSkuRestockedEvent,
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
        NewImage: marshall(incomingSkuRestockedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

describe(`Warehouse Service RestockSkuWorker IncomingSkuRestockedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test EventBridgeEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input EventBridgeEvent is valid`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is undefined`, () => {
    const mockEventBridgeEvent = undefined as never
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent is null`, () => {
    const mockEventBridgeEvent = null as never
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
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
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail = undefined as never
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail = null as never
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
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
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb = null as never
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
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
      EventBridgeEvent.detail.dynamodb.newImage (IncomingSkuRestockedEvent) is
      undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventBridgeEvent.detail.dynamodb.newImage (IncomingSkuRestockedEvent) is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = null as never
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.eventName edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventName is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventName is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventName is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventName is blank`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventName is not an WarehouseEventName`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.createdAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.createdAt is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.createdAt is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.createdAt is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.createdAt is blank`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.createdAt length < 4`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.updatedAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.updatedAt is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.updatedAt is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.updatedAt is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.updatedAt is blank`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.updatedAt length < 4`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.eventData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData invalid`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.eventData.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.sku is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.sku is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.sku is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.sku is blank`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.sku length < 4`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.eventData.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.units is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.units is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.units < 1`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.units is not an integer`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.units is not a number`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.eventData.lotId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.lotId is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.lotId is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.lotId is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.lotId is blank`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSkuRestockedEvent.eventData.lotId length < 4`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
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
  it(`returns the expected Success<IncomingSkuRestockedEvent> if the execution path is
      successful`, () => {
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent: IncomingSkuRestockedEvent = {
      eventName: mockIncomingSkuRestockedEvent.eventName,
      eventData: {
        sku: mockIncomingSkuRestockedEvent.eventData.sku,
        units: mockIncomingSkuRestockedEvent.eventData.units,
        lotId: mockIncomingSkuRestockedEvent.eventData.lotId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
