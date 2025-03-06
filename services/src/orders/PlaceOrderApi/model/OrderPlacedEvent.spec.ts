import { Result } from '../../errors/Result'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderPlacedEvent, OrderPlacedEventInput } from './OrderPlacedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockValidOrderPlacedEventInput() {
  const mockValidInput: OrderPlacedEventInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 23.45,
    userId: 'mockUserId',
  }
  return mockValidInput
}

describe(`Orders Service PlaceOrderApi OrderPlacedEvent tests`, () => {
  //
  // Test OrderPlacedEventData edge cases
  //
  it(`returns a Success if the input OrderPlacedEventInput is valid`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput is undefined`, () => {
    const mockOrderPlacedEventInput = undefined as unknown as OrderPlacedEventInput
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput is null`, () => {
    const mockOrderPlacedEventInput = null as unknown as OrderPlacedEventInput
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderPlacedEventData.orderId edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.orderId is missing`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.orderId
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.orderId is undefined`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = undefined
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.orderId is null`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = null
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.orderId is empty`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = ''
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.orderId is blank`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = '      '
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.orderId length < 4`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = '123'
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderPlacedEventData.sku edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.sku is missing`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.sku
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.sku is undefined`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = undefined
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.sku is null`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = null
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.sku is empty`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = ''
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.sku is blank`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = '      '
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.sku length < 4`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = '123'
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderPlacedEventData.units edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.units is missing`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.units
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.units is undefined`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = undefined
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.units is null`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = null
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.units < 0`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = -1
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.units == 0`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = 0
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.units is not an integer`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = 3.45
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.units is not a number`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = '1' as unknown as number
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderPlacedEventData.price edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.price is missing`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.price
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.price is undefined`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = undefined
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.price is null`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = null
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.price < 0`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = -1
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.price is not a number`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = '1' as unknown as number
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderPlacedEventData.userId edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.userId is missing`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.userId
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.userId is undefined`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = undefined
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.userId is null`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = null
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.userId is empty`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = ''
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.userId is blank`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = '      '
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      OrderPlacedEventInput.userId length < 4`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = '123'
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<OrderPlacedEvent> with the expected data`, () => {
    const mockOrderPlacedEventInput = buildMockValidOrderPlacedEventInput()
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    const expectedEvent: OrderPlacedEvent = {
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: mockOrderPlacedEventInput.orderId,
        sku: mockOrderPlacedEventInput.sku,
        units: mockOrderPlacedEventInput.units,
        price: mockOrderPlacedEventInput.price,
        userId: mockOrderPlacedEventInput.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })
})
