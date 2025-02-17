// TODO: Review Result, Success, Failure usage
import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingOrderCreatedEvent = {
  -readonly [K in keyof IncomingOrderCreatedEvent]: IncomingOrderCreatedEvent[K]
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

function buildMockEventBrideEvent(incomingOrderCreatedEvent: IncomingOrderCreatedEvent) {
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
        NewImage: marshall(incomingOrderCreatedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockValidIncomingOrderCreatedEvent(): Mutable_IncomingOrderCreatedEvent {
  const incomingOrderCreatedEvent: Mutable_IncomingOrderCreatedEvent = {
    eventName: WarehouseEventName.ORDER_CREATED_EVENT,
    eventData: {
      sku: 'mockSku',
      orderId: 'mockOrderId',
      units: 4,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingOrderCreatedEvent
}

describe('Warehouse Service AllocateOrderStockWorker IncomingOrderCreatedEvent tests', () => {
  //
  // Test valid IncomingOrderCreatedEvent success
  //
  it('returns a Success if the input IncomingOrderCreatedEvent is valid', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  // Test EventBridgeEvent edge cases
  //
  it('returns a non transient Failure if the input EventBridgeEvent is undefined', async () => {
    const mockEventBridgeEvent = undefined as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure if the input EventBridgeEvent is invalid', async () => {
    const mockEventBridgeEvent = 'mockInvalidValue' as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test EventBridgeEvent.detail edge cases
  //
  it('returns a non transient Failure if the input EventBridgeEvent.detail is missing', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    delete mockEventBridgeEvent.detail
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure if the input EventBridgeEvent.detail is undefined', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail = undefined as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure if the input EventBridgeEvent.detail is invalid', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb edge cases
  //
  it('returns a non transient Failure if the input EventBridgeEvent.detail.dynamodb is missing', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    delete mockEventBridgeEvent.detail.dynamodb
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure if the input EventBridgeEvent.detail.dynamodb is undefined', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure if the input EventBridgeEvent.detail.dynamodb is invalid', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb.newImage edge cases
  //
  it('returns a non transient Failure if the input EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderCreatedEvent) is missing', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure if the input EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderCreatedEvent) is undefined', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure if the input EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderCreatedEvent) is invalid', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderCreatedEvent.eventName edge cases
  //
  it('returns a non transient Failure IncomingOrderCreatedEvent.eventName is missing', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    delete mockIncomingOrderCreatedEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventName is undefined', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventName is null', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventName is empty', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventName is blank', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventName is not an WarehouseEventName', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderCreatedEvent.eventData edge cases
  //
  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData is missing', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    delete mockIncomingOrderCreatedEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData is undefined', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData is null', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData is empty', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData invalid', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderCreatedEvent.eventData.sku edge cases
  //
  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.sku is missing', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    delete mockIncomingOrderCreatedEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.sku is undefined', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.sku is null', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.sku is empty', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.sku is blank', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.sku length < 4', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderCreatedEvent.eventData.units edge cases
  //
  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.units is missing', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    delete mockIncomingOrderCreatedEvent.eventData.units
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.units is undefined', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.units is null', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.units is empty', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.units is not a number', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.units < 1', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.units is not an integer', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderCreatedEvent.eventData.orderId edge cases
  //
  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.orderId is missing', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    delete mockIncomingOrderCreatedEvent.eventData.orderId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.orderId is undefined', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.orderId = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.orderId is null', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.orderId = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.orderId is empty', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.orderId = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.orderId is blank', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.orderId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.eventData.orderId length < 4', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.eventData.orderId = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderCreatedEvent.createdAt edge cases
  //
  it('returns a non transient Failure IncomingOrderCreatedEvent.createdAt is missing', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    delete mockIncomingOrderCreatedEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.createdAt is undefined', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.createdAt is null', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.createdAt is empty', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.createdAt is blank', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.createdAt length < 4', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingOrderCreatedEvent.updatedAt edge cases
  //
  it('returns a non transient Failure IncomingOrderCreatedEvent.updatedAt is missing', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    delete mockIncomingOrderCreatedEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.updatedAt is undefined', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.updatedAt is null', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.updatedAt is empty', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.updatedAt is blank', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it('returns a non transient Failure IncomingOrderCreatedEvent.updatedAt length < 4', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    mockIncomingOrderCreatedEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it('returns the expected Success<IncomingOrderCreatedEvent> if the input is valid', async () => {
    const mockIncomingOrderCreatedEvent = buildMockValidIncomingOrderCreatedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderCreatedEvent)
    const result = IncomingOrderCreatedEvent.validateAndBuild(mockEventBridgeEvent)
    const expectedEvent = mockIncomingOrderCreatedEvent
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })
})
