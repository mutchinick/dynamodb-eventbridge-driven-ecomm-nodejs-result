import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderStockAllocatedEvent, OrderStockAllocatedEventInput } from './OrderStockAllocatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.99
const mockUserId = 'mockUserId'

function buildMockOrderStockAllocatedEventInput(): OrderStockAllocatedEventInput {
  const mockValidInput: OrderStockAllocatedEventInput = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return mockValidInput
}

describe(`Inventory Service AllocateOrderStockApi OrderStockAllocatedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input OrderStockAllocatedEventInput is valid`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(false)
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

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput is null`, () => {
    const mockOrderStockAllocatedEventInput = null as unknown as OrderStockAllocatedEventInput
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput.orderId edge cases
   ************************************************************/
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

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput.sku edge cases
   ************************************************************/
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

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput.units edge cases
   ************************************************************/
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
      OrderStockAllocatedEventInput.units < 1`, () => {
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

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput.price edge cases
   ************************************************************/
  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.price is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.price = undefined
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.price is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.price = null
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.price < 0`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.price = -1
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.price is not a number`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.price = '1' as unknown as number
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput.userId edge cases
   ************************************************************/
  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.userId is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.userId = undefined
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.userId is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.userId = null
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.userId is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.userId = ''
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.userId is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.userId = '      '
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns non-transient Failure of kind InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.userId length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.userId = '123'
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<OrderStockAllocatedEvent> if the execution path is
      successful`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    const expectedEvent: OrderStockAllocatedEvent = {
      eventName: InventoryEventName.ORDER_STOCK_ALLOCATED_EVENT,
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
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
