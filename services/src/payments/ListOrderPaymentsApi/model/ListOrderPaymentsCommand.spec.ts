import { Result } from '../../errors/Result'
import { ListOrderPaymentsCommand, ListOrderPaymentsCommandInput } from './ListOrderPaymentsCommand'

const mockOrderId = 'mockOrderId'
const mockSortDirection = 'asc'
const mockLimit = 10

function buildMockListOrderPaymentsCommandInput(): ListOrderPaymentsCommandInput {
  const mockValidInput: ListOrderPaymentsCommandInput = {
    orderId: mockOrderId,
    sortDirection: mockSortDirection,
    limit: mockLimit,
  }
  return mockValidInput
}

describe(`Payments Service ListOrderPaymentsApi ListOrderPaymentsCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test ListOrderPaymentsCommandInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input ListOrderPaymentsCommandInput is valid`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput is undefined`, () => {
    const mockListOrderPaymentsCommandInput = undefined as never
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput is null`, () => {
    const mockListOrderPaymentsCommandInput = null as never
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrderPaymentsCommandInput.orderId edge cases
   ************************************************************/
  it(`does not return a Failure if the input ListOrderPaymentsCommandInput.orderId is
      undefined`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.orderId = undefined
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.orderId is null`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.orderId = null
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.orderId is empty`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.orderId = ''
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.orderId is blank`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.orderId = '      '
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.orderId length < 4`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.orderId = '123'
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrderPaymentsCommandInput.sortDirection edge cases
   ************************************************************/
  it(`does not return a Failure if the input
      ListOrderPaymentsCommandInput.sortDirection is undefined`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.sortDirection = undefined
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.sortDirection is null`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.sortDirection = null
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.sortDirection is empty`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.sortDirection = '' as never
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.sortDirection is blank`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.sortDirection = '      ' as never
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.sortDirection is a random string`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.sortDirection = 'xyz' as never
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrderPaymentsCommandInput.limit edge cases
   ************************************************************/
  it(`does not return a Failure if the input ListOrderPaymentsCommandInput.limit is
      undefined`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = undefined
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.limit is null`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = null
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.limit is not a number`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = '1' as never
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.limit < 1`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = 0
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.limit > 1000`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = 1001
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.limit is not an integer`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = 3.45
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
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
  it(`returns the expected Success<ListOrderPaymentsCommand> if the execution path is
      successful`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    const expectedCommand: ListOrderPaymentsCommand = {
      commandData: {
        orderId: mockListOrderPaymentsCommandInput.orderId,
        sortDirection: mockListOrderPaymentsCommandInput.sortDirection,
        limit: mockListOrderPaymentsCommandInput.limit,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
