import { OrderError } from '../../errors/OrderError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { IncomingOrderEvent } from './IncomingOrderEvent'
import { UpdateOrderCommand, UpdateOrderCommandInput } from './UpdateOrderCommand'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingOrderEvent = {
  -readonly [K in keyof IncomingOrderEvent]: IncomingOrderEvent[K]
}

type Mutable_UpdateOrderCommandInput = {
  existingOrderData: OrderData
  incomingOrderEvent: Mutable_IncomingOrderEvent
}

function buildMockValidIncomingOrderEvent(): Mutable_IncomingOrderEvent {
  const mockValidOrderEvent: Mutable_IncomingOrderEvent = {
    eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
    eventData: {
      orderId: 'mockOrderId',
      orderStatus: OrderStatus.ORDER_CREATED_STATUS,
      sku: 'mockSku',
      quantity: 12,
      price: 1440,
      userId: 'mockUserId',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidOrderEvent
}

function buildMockValidOrderData() {
  const mockValidOrderData: OrderData = {
    orderId: 'mockOrderId',
    orderStatus: OrderStatus.ORDER_CREATED_STATUS,
    sku: 'mockSku',
    quantity: 12,
    price: 1440,
    userId: 'mockUserId',
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidOrderData
}

function buildMockValidUpdateOrderCommandInput() {
  const mockValidInput: Mutable_UpdateOrderCommandInput = {
    existingOrderData: buildMockValidOrderData(),
    incomingOrderEvent: buildMockValidIncomingOrderEvent(),
  }
  return mockValidInput
}

describe('Orders Service SyncOrderWorker UpdateOrderCommand tests', () => {
  it('does not throw if the input UpdateOrderCommandInput is valid', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  //
  // Test UpdateOrderCommandInput edge cases
  //
  it('throws if the input UpdateOrderCommandInput is undefined', () => {
    const mockUpdateOrderCommandInput: UpdateOrderCommandInput = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput is null', () => {
    const mockUpdateOrderCommandInput: UpdateOrderCommandInput = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.orderId edge cases
  //
  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderId is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.orderId
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderId is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderId is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderId is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = '' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderId is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = '      ' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderId length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = 'ABC' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.orderStatus edge cases
  //
  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderStatus is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.orderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderStatus is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderStatus is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderStatus is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = '' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderStatus is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = '      ' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.orderStatus not an OrderStatus', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = 'mockInvalidValue' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.sku edge cases
  //
  it('throws if the input UpdateOrderCommandInput.existingOrderData.sku is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.sku
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.sku is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.sku is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.sku is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = '' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.sku is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = '      ' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.sku length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = '      ' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.quantity edge cases
  //
  it('throws if the input UpdateOrderCommandInput.existingOrderData.quantity is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.quantity
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.quantity is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.quantity = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.quantity is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.quantity = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.quantity < 0', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.quantity = -1
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.quantity == 0', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.quantity = 0
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.quantity is not a number', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.quantity = '1' as unknown as number
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.price edge cases
  //
  it('throws if the input UpdateOrderCommandInput.existingOrderData.price is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.price
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.price is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.price is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.price < 0', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = -1
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.price is not a number', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = '1' as unknown as number
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.userId edge cases
  //
  it('throws if the input UpdateOrderCommandInput.existingOrderData.userId is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.userId
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.userId is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.userId is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.userId is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = ''
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.userId is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = '      '
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.userId length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = '123'
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.createdAt edge cases
  //
  it('throws if the input UpdateOrderCommandInput.existingOrderData.createdAt is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.createdAt
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.createdAt is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.createdAt is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.createdAt is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = ''
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.createdAt is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = '      '
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.createdAt length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = '123'
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.updatedAt edge cases
  //
  it('throws if the input UpdateOrderCommandInput.existingOrderData.updatedAt is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.updatedAt
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.updatedAt is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.updatedAt is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.updatedAt is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = ''
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.updatedAt is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = '      '
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.existingOrderData.updatedAt length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = '123'
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventName edge cases
  //
  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventName is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventName
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventName is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventName is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventName is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = '' as OrderEventName
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventName is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = '      ' as OrderEventName
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventName is not an IncomingOrderEventName', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = 'mockOrderEventName' as OrderEventName
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId edge cases
  //
  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = ''
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = '      '
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = '123'
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus edge cases
  //
  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = '' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = '      ' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is not an OrderStatus', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = 'mockOrderStatus' as OrderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.sku edge cases
  //
  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = ''
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = '      '
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.sku length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = '123'
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.quantity edge cases
  //
  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.quantity is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.quantity
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.quantity is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.quantity = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.quantity is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.quantity = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.quantity < 0', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.quantity = -1
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.quantity == 0', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.quantity = 0
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.quantity is not an integer', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.quantity = 3.45
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.quantity is not a number', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.quantity = '1' as unknown as number
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.price edge cases
  //
  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.price is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.price is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.price is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.price < 0', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = -1
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.price is not a number', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = '1' as unknown as number
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.userId edge cases
  //
  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = ''
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = '      '
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.userId length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = '123'
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt edge cases
  //
  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = ''
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = '      '
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = '123'
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt edge cases
  //
  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = ''
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = '      '
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = '123'
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.createdAt edge cases
  //
  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.createdAt is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.createdAt
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.createdAt is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.createdAt is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.createdAt is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = ''
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.createdAt is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = '      '
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.createdAt length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = '123'
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.updatedAt edge cases
  //
  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.updatedAt is missing', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.updatedAt is undefined', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.updatedAt is null', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = null
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.updatedAt is empty', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = ''
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.updatedAt is blank', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = '      '
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  it('throws if the input UpdateOrderCommandInput.incomingOrderEvent.updatedAt length < 4', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = '123'
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow()
  })

  //
  // Test Event and Order Status Transition edge cases
  //
  it('throws an DoNotRetryError error if the input existingOrderData.orderStatus is not valid for transition', () => {
    try {
      const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
      mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_CANCELED_STATUS
      mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_STOCK_ALLOCATED_EVENT
      UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.DoNotRetryError)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  it('throws an InvalidOrderStatusTransitionError_OrderNotFound error if the input existingOrderData is null', () => {
    try {
      const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
      mockUpdateOrderCommandInput.existingOrderData = null
      mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_STOCK_ALLOCATED_EVENT
      UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.InvalidOrderStatusTransitionError_OrderNotFound)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  it('throws an InvalidOrderStatusTransitionError_Forbidden error if the input existingOrderData.orderStatus is not valid for transition', () => {
    try {
      const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
      mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_CANCELED_STATUS
      mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_STOCK_ALLOCATED_EVENT
      UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.InvalidOrderStatusTransitionError_Forbidden)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  it('throws an InvalidOrderStatusTransitionError_OrderNotReady error if the input existingOrderData.orderStatus is not ready for transition', () => {
    try {
      const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
      mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_CREATED_STATUS
      mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_FULFILLED_EVENT
      UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.InvalidOrderStatusTransitionError_OrderNotReady)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  it('throws an InvalidOrderStatusTransitionError_Redundant error if the input existingOrderData.orderStatus is not ready for transition', () => {
    try {
      const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
      mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS
      mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_PAYMENT_ACCEPTED_EVENT
      UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.InvalidOrderStatusTransitionError_Redundant)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  //
  // Test expected results
  //
  it('returns the expected UpdateOrderCommand with orderStatus === ORDER_STOCK_ALLOCATED_STATUS', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    const updateOrderCommand = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    const expected: UpdateOrderCommand = {
      orderData: {
        orderId: mockUpdateOrderCommandInput.existingOrderData.orderId,
        orderStatus: OrderStatus.ORDER_STOCK_ALLOCATED_STATUS,
        updatedAt: mockDate,
      },
      options: {},
    }
    expect(updateOrderCommand).toMatchObject(expected)
  })

  it('returns the expected UpdateOrderCommand with orderStatus === ORDER_STOCK_DEPLETED_STATUS', () => {
    const mockUpdateOrderCommandInput = buildMockValidUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_STOCK_DEPLETED_EVENT
    const updateOrderCommand = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    const expected: UpdateOrderCommand = {
      orderData: {
        orderId: mockUpdateOrderCommandInput.existingOrderData.orderId,
        orderStatus: OrderStatus.ORDER_STOCK_DEPLETED_STATUS,
        updatedAt: mockDate,
      },
      options: {},
    }
    expect(updateOrderCommand).toMatchObject(expected)
  })
})
