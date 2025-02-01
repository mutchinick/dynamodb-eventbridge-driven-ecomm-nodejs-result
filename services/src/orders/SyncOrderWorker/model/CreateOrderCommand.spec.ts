import { OrderError } from '../../errors/OrderError'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { CreateOrderCommand, CreateOrderCommandInput } from './CreateOrderCommand'
import { IncomingOrderEvent } from './IncomingOrderEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingOrderEvent = {
  -readonly [K in keyof IncomingOrderEvent]: IncomingOrderEvent[K]
}

type Mutable_CreateOrderCommandInput = {
  incomingOrderEvent: Mutable_IncomingOrderEvent
}

function buildMockValidIncomingOrderEvent(): Mutable_IncomingOrderEvent {
  const mockValidEvent: Mutable_IncomingOrderEvent = {
    eventName: OrderEventName.ORDER_PLACED_EVENT,
    eventData: {
      orderId: 'mockOrderId',
      sku: 'mockSku',
      units: 12,
      price: 149.99,
      userId: 'mockUserId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidEvent
}

function buildMockValidCreateOrderCommandInput() {
  const mockValidInput: Mutable_CreateOrderCommandInput = {
    incomingOrderEvent: buildMockValidIncomingOrderEvent() as Mutable_IncomingOrderEvent,
  }
  return mockValidInput
}

describe('Orders Service SyncOrderWorker CreateOrderCommand tests', () => {
  //
  // Test CreateOrderCommandInput edge cases
  //
  it('does not throw if the input CreateOrderCommandInput is valid', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).not.toThrow()
  })

  it('throws if the input CreateOrderCommandInput is undefined', () => {
    const mockFaultyInput: CreateOrderCommandInput = undefined
    expect(() => CreateOrderCommand.validateAndBuild(mockFaultyInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput is null', () => {
    const mockFaultyInput: CreateOrderCommandInput = null
    expect(() => CreateOrderCommand.validateAndBuild(mockFaultyInput)).toThrow()
  })

  //
  // Test CreateOrderCommandInput.incomingOrderEvent.eventName edge cases
  //
  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventName is missing', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    delete mockCreateOrderCommandInput.incomingOrderEvent.eventName
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventName is undefined', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventName = undefined
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventName is null', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventName = null
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventName is empty', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventName = '' as OrderEventName
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventName is blank', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventName = '      ' as OrderEventName
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventName is not an IncomingOrderEventName', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventName = 'mockOrderEventName' as OrderEventName
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  //
  // Test CreateOrderCommandInput.incomingOrderEvent.eventData.orderId edge cases
  //
  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId is missing', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    delete mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId is undefined', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId = undefined
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId is null', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId = null
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId is empty', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId = ''
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId is blank', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId = '      '
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId length < 4', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId = '123'
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  //
  // Test CreateOrderCommandInput.incomingOrderEvent.eventData.sku edge cases
  //
  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku is missing', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    delete mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku is undefined', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku = undefined
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku is null', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku = null
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku is empty', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku = ''
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku is blank', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku = '      '
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku length < 4', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku = '123'
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  //
  // Test CreateOrderCommandInput.incomingOrderEvent.eventData.units edge cases
  //
  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units is missing', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    delete mockCreateOrderCommandInput.incomingOrderEvent.eventData.units
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units is undefined', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = undefined
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units is null', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = null
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units < 0', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = -1
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units == 0', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = 0
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units is not an integer', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = 3.45
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units is not a number', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = '1' as unknown as number
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  //
  // Test CreateOrderCommandInput.incomingOrderEvent.eventData.price edge cases
  //
  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.price is missing', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    delete mockCreateOrderCommandInput.incomingOrderEvent.eventData.price
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.price is undefined', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.price = undefined
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.price is null', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.price = null
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.price < 0', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.price = -1
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.price is not a number', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.price = '1' as unknown as number
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  //
  // Test CreateOrderCommandInput.incomingOrderEvent.eventData.userId edge cases
  //
  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId is missing', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    delete mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId is undefined', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId = undefined
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId is null', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId = null
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId is empty', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId = ''
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId is blank', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId = '      '
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId length < 4', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId = '123'
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  //
  // Test CreateOrderCommandInput.incomingOrderEvent.createdAt edge cases
  //
  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.createdAt is missing', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    delete mockCreateOrderCommandInput.incomingOrderEvent.createdAt
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.createdAt is undefined', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.createdAt = undefined
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.createdAt is null', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.createdAt = null
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.createdAt is empty', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.createdAt = ''
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.createdAt is blank', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.createdAt = '      '
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.createdAt length < 4', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.createdAt = '123'
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  //
  // Test CreateOrderCommandInput.incomingOrderEvent.updatedAt edge cases
  //
  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt is missing', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    delete mockCreateOrderCommandInput.incomingOrderEvent.updatedAt
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt is undefined', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.updatedAt = undefined
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt is null', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.updatedAt = null
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt is empty', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.updatedAt = ''
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt is blank', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.updatedAt = '      '
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  it('throws if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt length < 4', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.updatedAt = '123'
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).toThrow()
  })

  //
  // Test Event and Order Status Transition edge cases
  //
  it('throws an DoNotRetryError error if the input incomingOrderEvent.eventName is not valid for transition', () => {
    try {
      const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
      mockCreateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_SHIPPED_EVENT
      CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.DoNotRetryError)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  it('throws an InvalidOrderStatusTransitionError_Forbidden error if the input incomingOrderEvent.eventName is not valid for transition', () => {
    try {
      const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
      mockCreateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_SHIPPED_EVENT
      CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.InvalidOrderStatusTransitionError_Forbidden)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  //
  // Test expected results
  //
  it('returns the expected CreateOrderCommand with orderStatus === ORDER_PLACED_STATUS', () => {
    const mockCreateOrderCommandInput = buildMockValidCreateOrderCommandInput()
    const createOrderCommand = CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    const expected: CreateOrderCommand = {
      orderData: {
        orderId: mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId,
        orderStatus: OrderStatus.ORDER_CREATED_STATUS,
        sku: mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku,
        units: mockCreateOrderCommandInput.incomingOrderEvent.eventData.units,
        price: mockCreateOrderCommandInput.incomingOrderEvent.eventData.price,
        userId: mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      options: {},
    }
    expect(createOrderCommand).toMatchObject(expected)
  })
})
