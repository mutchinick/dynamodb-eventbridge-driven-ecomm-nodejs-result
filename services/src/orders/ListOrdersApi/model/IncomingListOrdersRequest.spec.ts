import { Result } from '../../errors/Result'
import { IncomingListOrdersRequest, IncomingListOrdersRequestInput } from './IncomingListOrdersRequest'

function buildMockIncomingListOrdersRequestInput(): IncomingListOrdersRequestInput {
  const mockValidRequestInput: IncomingListOrdersRequestInput = {
    orderId: 'mockOrderId',
    sortOrder: 'asc',
    limit: 10,
  }
  return mockValidRequestInput
}

describe(`Orders Service ListOrdersApi IncomingListOrdersRequest tests`, () => {
  //
  // Test IncomingListOrdersRequestInput edge cases
  //
  it(`returns a Success if the input IncomingListOrdersRequestInput is valid`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput is undefined`, () => {
    const mockIncomingListOrdersRequestInput = undefined as never
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput is null`, () => {
    const mockIncomingListOrdersRequestInput = null as never
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput is invalid`, () => {
    const mockIncomingListOrdersRequestInput = 'mockInvalidValue' as never
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingListOrdersRequestData.orderId edge cases
  //
  it(`returns a Success if the input IncomingListOrdersRequestInput.orderId is missing`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    delete mockIncomingListOrdersRequestInput.orderId
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input IncomingListOrdersRequestInput.orderId is undefined`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = undefined
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.orderId is null`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = null
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.orderId is empty`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = ''
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.orderId is blank`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = '      '
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.orderId length < 4`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = '123'
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingListOrdersRequestData.sortOrder edge cases
  //
  it(`returns a Success if the input IncomingListOrdersRequestInput.sortOrder is missing`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    delete mockIncomingListOrdersRequestInput.sortOrder
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input IncomingListOrdersRequestInput.sortOrder is undefined`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortOrder = undefined
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.sortOrder is null`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortOrder = null
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.sortOrder is empty`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortOrder = '' as never
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.sortOrder is blank`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortOrder = '      ' as never
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.sortOrder is a random string`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortOrder = 'xyz' as never
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingListOrdersRequestData.limit edge cases
  //
  it(`returns a Success if the input IncomingListOrdersRequestInput.limit is missing`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    delete mockIncomingListOrdersRequestInput.limit
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input IncomingListOrdersRequestInput.limit is undefined`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = undefined
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.limit is null`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = null
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.limit is not a number`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = '1' as never
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.limit < 1`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 0
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.limit > 1000`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 1001
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingListOrdersRequestInput.limit is not an integer`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 3.45
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<IncomingListOrdersRequest> with the expected data`, () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    const expectedRequest: IncomingListOrdersRequest = {
      orderId: mockIncomingListOrdersRequestInput.orderId,
      sortOrder: mockIncomingListOrdersRequestInput.sortOrder,
      limit: mockIncomingListOrdersRequestInput.limit,
    }
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
