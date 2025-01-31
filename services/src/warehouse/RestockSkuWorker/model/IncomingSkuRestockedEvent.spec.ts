import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingSkuRestockedEvent = {
  -readonly [K in keyof IncomingSkuRestockedEvent]: IncomingSkuRestockedEvent[K]
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

function buildMockEventBrideEvent(incomingSkuRestockedEvent: IncomingSkuRestockedEvent) {
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
        NewImage: marshall(incomingSkuRestockedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockValidIncomingSkuRestockedEvent(): Mutable_IncomingSkuRestockedEvent {
  const incomingSkuRestockedEvent: Mutable_IncomingSkuRestockedEvent = {
    eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    eventData: {
      sku: 'mockSku',
      units: 4,
      lotId: 'mockLotId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingSkuRestockedEvent
}

describe('Warehouse Service RestockSkuWorker IncomingSkuRestockedEvent tests', () => {
  //
  // Test valid IncomingSkuRestockedEvent success
  //
  it('does not throw if the input IncomingSkuRestockedEvent is valid', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  // Test EventBridgeEvent edge cases
  //
  it('throws if the input EventBridgeEvent is undefined', async () => {
    const mockEventBridgeEvent = undefined as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent is invalid', async () => {
    const mockEventBridgeEvent = 'mockInvalidValue' as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test EventBridgeEvent.detail edge cases
  //
  it('throws if the input EventBridgeEvent.detail is missing', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    delete mockEventBridgeEvent.detail
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail is undefined', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail = undefined as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail is invalid', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test EventBridgeEvent.detail.dynamodb edge cases
  //
  it('throws if the input EventBridgeEvent.detail.dynamodb is missing', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    delete mockEventBridgeEvent.detail.dynamodb
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail.dynamodb is undefined', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail.dynamodb is invalid', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test EventBridgeEvent.detail.dynamodb.newImage edge cases
  //
  it('throws if the input EventBridgeEvent.detail.dynamodb.newImage (IncomingSkuRestockedEvent) is missing', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail.dynamodb.newImage (IncomingSkuRestockedEvent) is undefined', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail.dynamodb.newImage (IncomingSkuRestockedEvent) is invalid', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingSkuRestockedEvent.eventName edge cases
  //
  it('throws if the input IncomingSkuRestockedEvent.eventName is missing', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventName is undefined', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventName is null', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventName is empty', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventName is blank', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventName is not an WarehouseEventName', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingSkuRestockedEvent.eventData edge cases
  //
  it('throws if the input IncomingSkuRestockedEvent.eventData is missing', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData is undefined', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData is null', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData is empty', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData invalid', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingSkuRestockedEvent.eventData.sku edge cases
  //
  it('throws if the input IncomingSkuRestockedEvent.eventData.sku is missing', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.sku is undefined', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.sku is null', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.sku is empty', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.sku is blank', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.sku length < 4', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingSkuRestockedEvent.eventData.units edge cases
  //
  it('throws if the input IncomingSkuRestockedEvent.eventData.units is missing', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.eventData.units
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.units is undefined', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.units is null', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.units is empty', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.units is not a number', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.units < 1', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.units is not an integer', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingSkuRestockedEvent.eventData.lotId edge cases
  //
  it('throws if the input IncomingSkuRestockedEvent.eventData.lotId is missing', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.eventData.lotId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.lotId is undefined', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.lotId is null', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.lotId is empty', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.lotId is blank', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.eventData.lotId length < 4', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingSkuRestockedEvent.createdAt edge cases
  //
  it('throws if the input IncomingSkuRestockedEvent.createdAt is missing', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.createdAt is undefined', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.createdAt is null', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.createdAt is empty', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.createdAt is blank', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.createdAt length < 4', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingSkuRestockedEvent.updatedAt edge cases
  //
  it('throws if the input IncomingSkuRestockedEvent.updatedAt is missing', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.updatedAt is undefined', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.updatedAt is null', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.updatedAt is empty', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.updatedAt is blank', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingSkuRestockedEvent.updatedAt length < 4', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test expected results
  //
  it('returns the expected IncomingSkuRestockedEvent if the input is valid', async () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    const expected = mockIncomingSkuRestockedEvent
    expect(result).toMatchObject(expected)
  })
})
