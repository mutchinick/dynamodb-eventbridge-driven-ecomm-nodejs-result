import { OrderEventName } from '../../model/OrderEventName'
import { OrderPlacedEvent, OrderPlacedEventInput } from './OrderPlacedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockValidOrderPlacedEventInput() {
  const mockValidInput: OrderPlacedEventInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    quantity: 2,
    price: 23.45,
    userId: 'mockUserId',
  }
  return mockValidInput
}

describe('Orders Service PlaceOrderApi OrderPlacedEvent tests', () => {
  //
  // Test OrderPlacedEventData edge cases
  //
  it('does not throw if the input OrderPlacedEventInput is valid', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).not.toThrow()
  })

  it('throws if the input OrderPlacedEventInput is undefined', () => {
    const mockOrderPlacedEventInput = undefined as unknown as OrderPlacedEventInput
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput is null', () => {
    const mockOrderPlacedEventInput = null as unknown as OrderPlacedEventInput
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  //
  // Test OrderPlacedEventData.orderId edge cases
  //
  it('throws if the input OrderPlacedEventInput.orderId is missing', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.orderId
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.orderId is undefined', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = undefined
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.orderId is null', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = null
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.orderId is empty', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = ''
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.orderId is blank', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = '      '
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.orderId length < 4', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = '123'
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  //
  // Test OrderPlacedEventData.sku edge cases
  //
  it('throws if the input OrderPlacedEventInput.sku is missing', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.sku
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.sku is undefined', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = undefined
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.sku is null', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = null
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.sku is empty', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = ''
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.sku is blank', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = '      '
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.sku length < 4', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = '123'
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  //
  // Test OrderPlacedEventData.quantity edge cases
  //
  it('throws if the input OrderPlacedEventInput.quantity is missing', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.quantity
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.quantity is undefined', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.quantity = undefined
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.quantity is null', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.quantity = null
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.quantity < 0', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.quantity = -1
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.quantity == 0', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.quantity = 0
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.quantity is not a number', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.quantity = '1' as unknown as number
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  //
  // Test OrderPlacedEventData.price edge cases
  //
  it('throws if the input OrderPlacedEventInput.price is missing', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.price
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.price is undefined', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = undefined
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.price is null', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = null
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.price < 0', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = -1
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.price is not a number', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = '1' as unknown as number
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  //
  // Test OrderPlacedEventData.userId edge cases
  //
  it('throws if the input OrderPlacedEventInput.userId is missing', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.userId
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.userId is undefined', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = undefined
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.userId is null', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = null
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.userId is empty', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = ''
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.userId is blank', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = '      '
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  it('throws if the input OrderPlacedEventInput.userId length < 4', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = '123'
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).toThrow()
  })

  //
  // Test expected results
  //
  it('returns the expected OrderPlacedEvent with eventName and eventData', () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    const expected: OrderPlacedEvent = {
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: mockOrderPlacedEventInput.orderId,
        sku: mockOrderPlacedEventInput.sku,
        quantity: mockOrderPlacedEventInput.quantity,
        price: mockOrderPlacedEventInput.price,
        userId: mockOrderPlacedEventInput.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const orderPlacedEvent = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(orderPlacedEvent).toMatchObject(expected)
  })
})
