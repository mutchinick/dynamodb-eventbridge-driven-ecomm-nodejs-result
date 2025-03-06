import { Result } from '../../errors/Result'
import { IncomingPlaceOrderRequest, IncomingPlaceOrderRequestInput } from './IncomingPlaceOrderRequest'

function buildMockValidIncomingPlaceOrderRequestInput(): IncomingPlaceOrderRequestInput {
  const mockValidRequestInput: IncomingPlaceOrderRequestInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
  }
  return mockValidRequestInput
}

describe(`Orders Service PlaceOrderApi IncomingPlaceOrderRequest tests`, () => {
  //
  // Test IncomingPlaceOrderRequestInput edge cases
  //
  it(`returns a Success if the input IncomingPlaceOrderRequestInput is valid`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
    IncomingPlaceOrderRequestInput is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput is null`, () => {
    const mockIncomingPlaceOrderRequestInput = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput is invalid`, () => {
    const mockIncomingPlaceOrderRequestInput = 'mockInvalidValue' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingPlaceOrderRequestInput.orderId edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.orderId is missing`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.orderId
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.orderId is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.orderId is null`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.orderId is empty`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.orderId is blank`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '      ' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.orderId length < 4`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '123' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingPlaceOrderRequestInput.sku edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.sku is missing`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.sku
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.sku is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.sku is null`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.sku is empty`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.sku is blank`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '      ' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.sku length < 4`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '123' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingPlaceOrderRequestInput.units edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.units is missing`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.units
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.units is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.units is null`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.units is empty`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = '' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.units is not a number`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = '1' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.units < 1`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = 0
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.units is not an integer`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = 3.45
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingPlaceOrderRequestInput.price edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.price is missing`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.price
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.price is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.price is null`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.price is empty`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = '' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.price is not a number`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = '0' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.price < 0`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = -1
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingPlaceOrderRequestInput.userId edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.userId is missing`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.userId
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.userId is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.userId is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.userId is null`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.userId is empty`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.userId is blank`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '      ' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input 
      IncomingPlaceOrderRequestInput.userId length < 4`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '123' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<IncomingPlaceOrderRequest> with the expected data`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    const expectedRequest: IncomingPlaceOrderRequest = {
      orderId: mockIncomingPlaceOrderRequestInput.orderId,
      sku: mockIncomingPlaceOrderRequestInput.sku,
      units: mockIncomingPlaceOrderRequestInput.units,
      price: mockIncomingPlaceOrderRequestInput.price,
      userId: mockIncomingPlaceOrderRequestInput.userId,
    }
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(result).toMatchObject(expectedResult)
  })
})
