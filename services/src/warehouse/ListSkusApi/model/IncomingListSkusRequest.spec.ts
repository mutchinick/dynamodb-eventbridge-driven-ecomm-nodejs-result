import { Result } from '../../errors/Result'
import { IncomingListSkusRequest, IncomingListSkusRequestInput } from './IncomingListSkusRequest'

const mockSku = 'mockSku'
const mockSortDirection = 'asc'
const mockLimit = 10

function buildMockIncomingListSkusRequestInput(): IncomingListSkusRequestInput {
  const mockValidRequestInput: IncomingListSkusRequestInput = {
    sku: mockSku,
    sortDirection: mockSortDirection,
    limit: mockLimit,
  }
  return mockValidRequestInput
}

describe(`Warehouse Service ListSkusApi IncomingListSkusRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListSkusRequestInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingListSkusRequestInput is valid`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput is undefined`, () => {
    const mockIncomingListSkusRequestInput = undefined as never
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput is null`, () => {
    const mockIncomingListSkusRequestInput = null as never
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListSkusRequestData.sku edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingListSkusRequestInput.sku is undefined`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sku = undefined
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.sku is null`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sku = null
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.sku is empty`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sku = ''
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.sku is blank`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sku = '      '
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.sku length < 4`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sku = '123'
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListSkusRequestData.sortDirection edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingListSkusRequestInput.sortDirection is undefined`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortDirection = undefined
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.sortDirection is null`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortDirection = null
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.sortDirection is empty`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortDirection = '' as never
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.sortDirection is blank`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortDirection = '      ' as never
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.sortDirection is a random string`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortDirection = 'xyz' as never
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListSkusRequestData.limit edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingListSkusRequestInput.limit is undefined`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = undefined
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.limit is null`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = null
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.limit < 1`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = 0
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.limit > 1000`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = 1001
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.limit is not an integer`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = 3.45
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListSkusRequestInput.limit is not a number`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = '1' as never
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
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
  it(`returns the expected Success<IncomingListSkusRequest> if the execution path is successful`, () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    const expectedRequest: IncomingListSkusRequest = {
      sku: mockIncomingListSkusRequestInput.sku,
      sortDirection: mockIncomingListSkusRequestInput.sortDirection,
      limit: mockIncomingListSkusRequestInput.limit,
    }
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
