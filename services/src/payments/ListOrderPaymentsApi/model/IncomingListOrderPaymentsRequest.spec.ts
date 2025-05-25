import { Result } from '../../errors/Result'
import {
  IncomingListOrderPaymentsRequest,
  IncomingListOrderPaymentsRequestInput,
} from './IncomingListOrderPaymentsRequest'

const mockOrderId = 'mockOrderId'
const mockSortDirection = 'asc'
const mockLimit = 10

function buildMockIncomingListOrderPaymentsRequestInput(): IncomingListOrderPaymentsRequestInput {
  const mockValidRequestInput: IncomingListOrderPaymentsRequestInput = {
    orderId: mockOrderId,
    sortDirection: mockSortDirection,
    limit: mockLimit,
  }
  return mockValidRequestInput
}

describe(`Payments Service ListOrderPaymentsApi IncomingListOrderPaymentsRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListOrderPaymentsRequestInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingListOrderPaymentsRequestInput is
      valid`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput is undefined`, () => {
    const mockIncomingListOrderPaymentsRequestInput = undefined as never
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput is null`, () => {
    const mockIncomingListOrderPaymentsRequestInput = null as never
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListOrderPaymentsRequestData.orderId edge cases
   ************************************************************/
  it(`does not return a Failure if the input
      IncomingListOrderPaymentsRequestInput.orderId is undefined`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.orderId = undefined
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.orderId is null`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.orderId = null
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.orderId is empty`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.orderId = ''
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.orderId is blank`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.orderId = '      '
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.orderId length < 4`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.orderId = '123'
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListOrderPaymentsRequestData.sortDirection edge cases
   ************************************************************/
  it(`does not return a Failure if the input
      IncomingListOrderPaymentsRequestInput.sortDirection is undefined`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.sortDirection = undefined
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.sortDirection is null`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.sortDirection = null
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.sortDirection is empty`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.sortDirection = '' as never
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.sortDirection is blank`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.sortDirection = '      ' as never
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.sortDirection is a random string`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.sortDirection = 'xyz' as never
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListOrderPaymentsRequestData.limit edge cases
   ************************************************************/
  it(`does not return a Failure if the input
      IncomingListOrderPaymentsRequestInput.limit is undefined`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = undefined
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.limit is null`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = null
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.limit < 1`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = 0
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.limit > 1000`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = 1001
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.limit is not an integer`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = 3.45
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.limit is not a number`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = '1' as never
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
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
  it(`returns the expected Success<IncomingListOrderPaymentsRequest> if the execution
      path is successful`, () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    const expectedRequest: IncomingListOrderPaymentsRequest = {
      orderId: mockIncomingListOrderPaymentsRequestInput.orderId,
      sortDirection: mockIncomingListOrderPaymentsRequestInput.sortDirection,
      limit: mockIncomingListOrderPaymentsRequestInput.limit,
    }
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
