import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockAllocatedEvent, OrderStockAllocatedEventInput } from './OrderStockAllocatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockOrderStockAllocatedEventInput(): OrderStockAllocatedEventInput {
  const mockValidInput: OrderStockAllocatedEventInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 2.34,
    userId: 'mockUserId',
  }
  return mockValidInput
}

describe(`Warehouse Service AllocateOrderStockApi OrderStockAllocatedEvent tests`, () => {
  //
  // Test OrderStockAllocatedEventData edge cases
  //
  it(`returns a Success if the input OrderStockAllocatedEventInput is valid`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput is undefined`, () => {
    const mockOrderStockAllocatedEventInput = undefined as unknown as OrderStockAllocatedEventInput
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput is null`, () => {
    const mockOrderStockAllocatedEventInput = null as unknown as OrderStockAllocatedEventInput
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderStockAllocatedEventData.orderId edge cases
  //
  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is missing`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.orderId
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = undefined
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = null
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = ''
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = '      '
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = '123'
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderStockAllocatedEventData.sku edge cases
  //
  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is missing`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.sku
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = undefined
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = null
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = ''
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = '      '
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = '123'
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderStockAllocatedEventData.units edge cases
  //
  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is missing`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.units
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = undefined
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = null
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units < 0`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = -1
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units == 0`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = 0
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is not an integer`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = 2.34
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is not a number`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = '1' as unknown as number
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<OrderStockAllocatedEvent> with the expected data`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    const expectedEvent: OrderStockAllocatedEvent = {
      eventName: WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: mockOrderStockAllocatedEventInput.orderId,
        sku: mockOrderStockAllocatedEventInput.sku,
        units: mockOrderStockAllocatedEventInput.units,
        price: mockOrderStockAllocatedEventInput.price,
        userId: mockOrderStockAllocatedEventInput.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toMatchObject(expectedResult)
  })
})
