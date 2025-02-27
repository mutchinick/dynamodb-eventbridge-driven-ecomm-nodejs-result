import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockAllocatedEvent, OrderStockAllocatedEventInput } from './OrderStockAllocatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockValidOrderStockAllocatedEventInput(): OrderStockAllocatedEventInput {
  const mockValidInput: OrderStockAllocatedEventInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
  }
  return mockValidInput
}

describe(`Warehouse Service AllocateOrderStockApi OrderStockAllocatedEvent tests`, () => {
  //
  // Test OrderStockAllocatedEventData edge cases
  //
  it(`returns a Success if the input OrderStockAllocatedEventInput is valid`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
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
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.orderId
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = undefined
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = null
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = ''
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = '      '
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
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
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.sku
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = undefined
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = null
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = ''
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = '      '
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
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
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.units
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = undefined
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = null
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units < 0`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = -1
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units == 0`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = 0
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is not an integer`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = 2.34
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is not a number`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
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
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    const orderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    const expectedEvent: OrderStockAllocatedEvent = {
      eventName: WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: mockOrderStockAllocatedEventInput.orderId,
        sku: mockOrderStockAllocatedEventInput.sku,
        units: mockOrderStockAllocatedEventInput.units,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(orderStockAllocatedEvent).toMatchObject(expectedResult)
  })
})
