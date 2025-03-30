import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockDepletedEvent, OrderStockDepletedEventInput } from './OrderStockDepletedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockOrderStockDepletedEventInput(): OrderStockDepletedEventInput {
  const mockValidInput: OrderStockDepletedEventInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 1.23,
    userId: 'mockUserId',
  }
  return mockValidInput
}

describe(`Warehouse Service AllocateOrderStockApi OrderStockDepletedEvent tests`, () => {
  //
  // Test OrderStockDepletedEventData edge cases
  //
  it(`returns a Success if the input OrderStockDepletedEventInput is valid`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput is undefined`, () => {
    const mockOrderStockDepletedEventInput = undefined as unknown as OrderStockDepletedEventInput
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput is null`, () => {
    const mockOrderStockDepletedEventInput = null as unknown as OrderStockDepletedEventInput
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderStockDepletedEventData.orderId edge cases
  //
  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId is missing`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    delete mockOrderStockDepletedEventInput.orderId
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = undefined
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = null
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId is empty`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = ''
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId is blank`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = '      '
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId length < 4`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = '123'
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderStockDepletedEventData.sku edge cases
  //
  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku is missing`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    delete mockOrderStockDepletedEventInput.sku
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = undefined
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = null
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku is empty`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = ''
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku is blank`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = '      '
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku length < 4`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = '123'
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderStockDepletedEventData.units edge cases
  //
  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units is missing`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    delete mockOrderStockDepletedEventInput.units
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = undefined
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = null
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units < 0`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = -1
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units == 0`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = 0
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units is not an integer`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = 2.34
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units is not a number`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = '1' as unknown as number
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<OrderStockDepletedEvent> with the expected data`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    const expectedEvent: OrderStockDepletedEvent = {
      eventName: WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
      eventData: {
        orderId: mockOrderStockDepletedEventInput.orderId,
        sku: mockOrderStockDepletedEventInput.sku,
        units: mockOrderStockDepletedEventInput.units,
        price: mockOrderStockDepletedEventInput.price,
        userId: mockOrderStockDepletedEventInput.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
