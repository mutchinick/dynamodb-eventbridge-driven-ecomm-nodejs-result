import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
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
      quantity: 4,
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

describe('Orders Service SyncOrderWorker IncomingOrderEvent tests', () => {
  //
  // Test valid IncomingOrderEvent success
  //
  it('does not throw if the input IncomingOrderEvent is valid', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  // Test EventBridgeEvent edge cases
  //
  it('throws if the input EventBridgeEvent is undefined', async () => {
    const mockEventBridgeEvent = undefined as never
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent is invalid', async () => {
    const mockEventBridgeEvent = 'mockInvalidValue' as never
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test EventBridgeEvent.detail edge cases
  //
  it('throws if the input EventBridgeEvent.detail is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = undefined as never
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail is invalid', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test EventBridgeEvent.detail.dynamodb edge cases
  //
  it('throws if the input EventBridgeEvent.detail.dynamodb is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail.dynamodb
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail.dynamodb is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail.dynamodb is invalid', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test EventBridgeEvent.detail.dynamodb.newImage edge cases
  //
  it('throws if the input EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderEvent) is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderEvent) is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input EventBridgeEvent.detail.dynamodb.newImage (IncomingOrderEvent) is invalid', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.eventName edge cases
  //
  it('throws if the input IncomingOrderEvent.eventName is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventName is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventName is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventName is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventName is blank', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventName is not an OrderEventName', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.eventData edge cases
  //
  it('throws if the input IncomingOrderEvent.eventData is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData invalid', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.eventData.orderId edge cases
  //
  it('throws if the input IncomingOrderEvent.eventData.orderId is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.orderId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.orderId is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.orderId is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.orderId is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.orderId is blank', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.orderId length < 4', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderId = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.eventData.orderStatus edge cases
  //
  it('does not throw if the input IncomingOrderEvent.eventData.orderStatus is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.orderStatus
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('does not throw if the input IncomingOrderEvent.eventData.orderStatus is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderStatus = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.orderStatus is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderStatus = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.orderStatus is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderStatus = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.orderStatus is blank', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderStatus = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.orderStatus is not an OrderStatus', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.orderStatus = 'mockOrderStatus' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.eventData.sku edge cases
  //
  it('does not throw if the input IncomingOrderEvent.eventData.sku is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('does not throw if the input IncomingOrderEvent.eventData.sku is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.sku is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.sku is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.sku is blank', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.sku length < 4', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.eventData.quantity edge cases
  //
  it('does not throw if the input IncomingOrderEvent.eventData.quantity is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.quantity
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('does not throw if the input IncomingOrderEvent.eventData.quantity is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.quantity = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.quantity is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.quantity = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.quantity is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.quantity = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.quantity is not a number', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.quantity = '1' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.quantity < 1', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.quantity = 0.99
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.eventData.price edge cases
  //
  it('does not throw if the input IncomingOrderEvent.eventData.price is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.price
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('does not throw if the input IncomingOrderEvent.eventData.price is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.price is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.price is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.price is not a number', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = '0' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.price < 0', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.price = -1
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.eventData.userId edge cases
  //
  it('does not throw if the input IncomingOrderEvent.eventData.userId is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.userId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('does not throw if the input IncomingOrderEvent.eventData.userId is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.userId is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.userId is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.userId is blank', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.userId length < 4', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.userId = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.eventData.createdAt edge cases
  //
  it('does not throw if the input IncomingOrderEvent.eventData.createdAt is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('does not throw if the input IncomingOrderEvent.eventData.createdAt is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.createdAt is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.createdAt is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.createdAt is blank', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.createdAt length < 4', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.eventData.updatedAt edge cases
  //
  it('does not throw if the input IncomingOrderEvent.eventData.updatedAt is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('does not throw if the input IncomingOrderEvent.eventData.updatedAt is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.updatedAt is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.updatedAt is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.updatedAt is blank', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.eventData.updatedAt length < 4', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.eventData.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.createdAt edge cases
  //
  it('throws if the input IncomingOrderEvent.createdAt is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.createdAt is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.createdAt is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.createdAt is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.createdAt is blank', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.createdAt length < 4', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test IncomingOrderEvent.updatedAt edge cases
  //
  it('throws if the input IncomingOrderEvent.updatedAt is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.updatedAt is undefined', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.updatedAt is null', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.updatedAt is empty', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.updatedAt is blank', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  it('throws if the input IncomingOrderEvent.updatedAt length < 4', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    mockIncomingOrderEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    expect(() => IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)).toThrow()
  })

  //
  // Test expected results
  //
  it('returns the expected IncomingOrderEvent if the input is valid', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expected = mockIncomingOrderEvent
    expect(result).toMatchObject(expected)
  })

  it('returns the expected IncomingOrderEvent if the input is valid and sku is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expected = mockIncomingOrderEvent
    expect(result).toMatchObject(expected)
  })

  it('returns the expected IncomingOrderEvent if the input is valid and quantity is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.quantity
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expected = mockIncomingOrderEvent
    expect(result).toMatchObject(expected)
  })

  it('returns the expected IncomingOrderEvent if the input is valid and price is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.price
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expected = mockIncomingOrderEvent
    expect(result).toMatchObject(expected)
  })

  it('returns the expected IncomingOrderEvent if the input is valid and userId is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.userId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expected = mockIncomingOrderEvent
    expect(result).toMatchObject(expected)
  })

  it('returns the expected IncomingOrderEvent if the input is valid and createdAt is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expected = mockIncomingOrderEvent
    expect(result).toMatchObject(expected)
  })

  it('returns the expected IncomingOrderEvent if the input is valid and updatedAt is missing', async () => {
    const mockIncomingOrderEvent = buildMockValidIncomingOrderEvent()
    delete mockIncomingOrderEvent.eventData.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingOrderEvent)
    const result = IncomingOrderEvent.validateAndBuild(mockEventBridgeEvent)
    const expected = mockIncomingOrderEvent
    expect(result).toMatchObject(expected)
  })
})
