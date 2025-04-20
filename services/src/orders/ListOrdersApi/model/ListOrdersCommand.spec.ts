import { Result } from '../../errors/Result'
import { ListOrdersCommand, ListOrdersCommandInput } from './ListOrdersCommand'

const mockOrderId = 'mockOrderId'
const mockSortDirection = 'asc'
const mockLimit = 10

function buildMockListOrdersCommandInput() {
  const mockValidInput: ListOrdersCommandInput = {
    orderId: mockOrderId,
    sortDirection: mockSortDirection,
    limit: mockLimit,
  }
  return mockValidInput
}

describe(`Orders Service ListOrdersApi ListOrdersCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test ListOrdersCommandInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input ListOrdersCommandInput is valid`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput is undefined`, () => {
    const mockListOrdersCommandInput = undefined as never
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput is null`, () => {
    const mockListOrdersCommandInput = null as never
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrdersCommandInput.orderId edge cases
   ************************************************************/
  it(`does not return a Failure if the input ListOrdersCommandInput.orderId is undefined`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = undefined
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.orderId is null`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = null
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.orderId is empty`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = ''
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.orderId is blank`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = '      '
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.orderId length < 4`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = '123'
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrdersCommandInput.sortDirection edge cases
   ************************************************************/
  it(`does not return a Failure if the input ListOrdersCommandInput.sortDirection is undefined`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortDirection = undefined
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.sortDirection is null`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortDirection = null
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.sortDirection is empty`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortDirection = '' as never
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.sortDirection is blank`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortDirection = '      ' as never
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.sortDirection is a random string`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortDirection = 'xyz' as never
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrdersCommandInput.limit edge cases
   ************************************************************/
  it(`does not return a Failure if the input ListOrdersCommandInput.limit is undefined`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = undefined
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.limit is null`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = null
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.limit < 1`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = 0
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.limit > 1000`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = 1001
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.limit is not an integer`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = 3.45
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input ListOrdersCommandInput.limit is not a number`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = '1' as never
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
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
  it(`returns the expected Success<ListOrdersCommand> if the execution path is successful`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    const expectedCommand: ListOrdersCommand = {
      commandData: {
        orderId: mockListOrdersCommandInput.orderId,
        sortDirection: mockListOrdersCommandInput.sortDirection,
        limit: mockListOrdersCommandInput.limit,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
