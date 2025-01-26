import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { OrderCreatedEvent, OrderCreatedEventInput } from './OrderCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockValidOrderData(): OrderData {
  return {
    orderId: 'mockOrderId',
    orderStatus: OrderStatus.ORDER_CREATED_STATUS,
    sku: 'mockSku',
    quantity: 14,
    price: 1897.99,
    userId: 'mockUserId',
    createdAt: 'mockCreatedAt',
    updatedAt: 'mockUpdatedAt',
  }
}

function buildMockValidOrderCreatedEventInput(): OrderCreatedEventInput {
  return {
    incomingEventName: OrderEventName.ORDER_PLACED_EVENT,
    orderData: buildMockValidOrderData(),
  }
}

describe('Orders Service SyncOrderWorker OrderCreatedEvent tests', () => {
  //
  // Test valid inputs
  //
  it('does not throw if the input OrderCreatedEventInput is valid', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).not.toThrow()
  })

  //
  // Test OrderCreatedEventInput edge cases
  //
  it('throws if the input OrderCreatedEventInput is undefined', () => {
    const mockOrderCreatedEventInput = undefined as never
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput is null', () => {
    const mockOrderCreatedEventInput = null as never
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput is invalid', () => {
    const mockOrderCreatedEventInput = 'mockInvalidValue' as never
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test eventName edge cases
  //
  it('throws if the input OrderCreatedEventInput.incomingEventName is missing', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.incomingEventName
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.incomingEventName is undefined', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = undefined
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.incomingEventName is null', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = null
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.incomingEventName is empty', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = '' as OrderEventName
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.incomingEventName is blank', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = '      ' as OrderEventName
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.incomingEventName is not an IncomingOrderEventName', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = 'mockEventName' as OrderEventName
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test OrderCreatedEventInput.orderData edge cases
  //
  it('throws if the input OrderCreatedEventInput.orderData is missing', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData is undefined', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData = undefined
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData is null', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData = null
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData is empty', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData = {} as never
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test OrderCreatedEventInput.orderData.orderId edge cases
  //
  it('throws if the input OrderCreatedEventInput.orderData.orderId is missing', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.orderId
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.orderId is undefined', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = undefined
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.orderId is null', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = null
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.orderId is empty', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = ''
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.orderId is blank', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = '      '
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.orderId length < 4', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = '123'
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test OrderCreatedEventInput.orderData.orderStatus edge cases
  //
  it('throws if the input OrderCreatedEventInput.orderData.orderStatus is missing', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.orderStatus
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.orderStatus is undefined', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = undefined
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.orderStatus is null', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = null
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.orderStatus is empty', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = '' as OrderStatus
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.orderStatus is blank', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = '      ' as OrderStatus
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.orderStatus not an OrderStatus', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = 'mockOrderStatus' as OrderStatus
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test OrderCreatedEventInput.orderData.sku edge cases
  //
  it('throws if the input OrderCreatedEventInput.orderData.sku is missing', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.sku
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.sku is undefined', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = undefined
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.sku is null', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = null
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.sku is empty', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = ''
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.sku is blank', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = '      '
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.sku length < 4', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = '123'
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test OrderCreatedEventInput.orderData.quantity edge cases
  //
  it('throws if the input OrderCreatedEventInput.orderData.quantity is missing', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.quantity
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.quantity is undefined', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.quantity = undefined
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.quantity is null', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.quantity = null
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.quantity < 0', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.quantity = -1
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.quantity == 0', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.quantity = 0
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.quantity is not a number', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.quantity = '1' as unknown as number
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.quantity is not an integer', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.quantity = 3.45
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test OrderCreatedEventInput.orderData.price edge cases
  //
  it('throws if the input OrderCreatedEventInput.orderData.price is missing', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.price
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.price is undefined', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = undefined
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.price is null', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = null
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.price < 0', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = -1
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.price is not a number', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = '1' as unknown as number
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test OrderCreatedEventInput.orderData.userId edge cases
  //
  it('throws if the input OrderCreatedEventInput.orderData.userId is missing', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.userId
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.userId is undefined', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = undefined
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.userId is null', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = null
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.userId is empty', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = ''
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.userId is blank', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = '      '
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.userId length < 4', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = '123'
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test OrderCreatedEventInput.orderData.createdAt edge cases
  //
  it('throws if the input OrderCreatedEventInput.orderData.createdAt is missing', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.createdAt
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.createdAt is undefined', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = undefined
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.createdAt is null', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = null
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.createdAt is empty', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = ''
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.createdAt is blank', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = '      '
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.createdAt length < 4', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = '123'
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test OrderCreatedEventInput.orderData.updatedAt edge cases
  //
  it('throws if the input OrderCreatedEventInput.orderData.updatedAt is missing', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.updatedAt
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.updatedAt is undefined', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = undefined
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.updatedAt is null', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = null
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.updatedAt is empty', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = ''
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.updatedAt is blank', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = '      '
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  it('throws if the input OrderCreatedEventInput.orderData.updatedAt length < 4', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = '123'
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).toThrow()
  })

  //
  // Test expected results
  //
  it('returns a valid OrderCreatedEvent with the expected orderStatus', () => {
    const mockOrderCreatedEventInput = buildMockValidOrderCreatedEventInput()
    const mockSyncedEventName = OrderEventName.ORDER_CREATED_EVENT
    const expected: OrderCreatedEvent = {
      eventName: mockSyncedEventName,
      eventData: mockOrderCreatedEventInput.orderData,
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const orderCreatedEvent = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(orderCreatedEvent).toMatchObject(expected)
  })
})
