import { Result } from '../../errors/Result'
import { IncomingPlaceOrderRequest, IncomingPlaceOrderRequestInput } from './IncomingPlaceOrderRequest'

const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 3.98
const mockUserId = 'mockUserId'

function buildMockIncomingPlaceOrderRequestInput(): IncomingPlaceOrderRequestInput {
  const mockValidRequestInput: IncomingPlaceOrderRequestInput = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return mockValidRequestInput
}

describe(`Orders Service PlaceOrderApi IncomingPlaceOrderRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingPlaceOrderRequestInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingPlaceOrderRequestInput is valid`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput is null`, () => {
    const mockIncomingPlaceOrderRequestInput = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingPlaceOrderRequestInput.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId is null`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId is empty`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId is blank`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '      ' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId length < 4`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '123' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingPlaceOrderRequestInput.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku is null`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku is empty`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku is blank`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '      ' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku length < 4`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '123' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingPlaceOrderRequestInput.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units is null`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units < 1`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = 0
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units is not an integer`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = 3.45
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units is not a number`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = '1' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingPlaceOrderRequestInput.price edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.price is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.price is null`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.price < 0`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = -1
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.price is not a number`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = '0' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingPlaceOrderRequestInput.userId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is undefined`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = undefined as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is null`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = null as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is empty`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is blank`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '      ' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId length < 4`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '123' as never
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
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
  it(`returns the expected Success<IncomingPlaceOrderRequest> if the execution path is
      successful`, () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    const expectedRequest: IncomingPlaceOrderRequest = {
      orderId: mockIncomingPlaceOrderRequestInput.orderId,
      sku: mockIncomingPlaceOrderRequestInput.sku,
      units: mockIncomingPlaceOrderRequestInput.units,
      price: mockIncomingPlaceOrderRequestInput.price,
      userId: mockIncomingPlaceOrderRequestInput.userId,
    }
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
