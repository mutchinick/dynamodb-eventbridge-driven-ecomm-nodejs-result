import { Result } from '../../errors/Result'
import { ListOrdersCommand, ListOrdersCommandInput } from './ListOrdersCommand'

function buildMockListOrdersCommandInput() {
  const mockValidInput: ListOrdersCommandInput = {
    orderId: 'mockOrderId',
    sortOrder: 'asc',
    limit: 10,
  }
  return mockValidInput
}

describe(`Orders Service ListOrdersApi ListOrdersCommand tests`, () => {
  //
  // Test ListOrdersCommandData edge cases
  //
  it(`returns a Success if the input ListOrdersCommandInput is valid`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput is undefined`, () => {
    const mockListOrdersCommandInput = undefined as unknown as ListOrdersCommandInput
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput is null`, () => {
    const mockListOrdersCommandInput = null as unknown as ListOrdersCommandInput
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test ListOrdersCommandData.orderId edge cases
  //
  it(`returns a Success if the input ListOrdersCommandInput.orderId is missing`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    delete mockListOrdersCommandInput.orderId
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input ListOrdersCommandInput.orderId is undefined`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = undefined
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.orderId is null`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = null
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.orderId is empty`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = ''
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.orderId is blank`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = '      '
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.orderId length < 4`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = '123'
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test ListOrdersCommandData.sortOrder edge cases
  //
  it(`returns a Success if the input ListOrdersCommandInput.sortOrder is missing`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    delete mockListOrdersCommandInput.sortOrder
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input ListOrdersCommandInput.sortOrder is undefined`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortOrder = undefined
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.sortOrder is null`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortOrder = null
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.sortOrder is empty`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortOrder = '' as never
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.sortOrder is blank`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortOrder = '      ' as never
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.sortOrder is a random string`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortOrder = 'xyz' as never
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test ListOrdersCommandData.limit edge cases
  //
  it(`returns a Success if the input ListOrdersCommandInput.limit is missing`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    delete mockListOrdersCommandInput.limit
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input ListOrdersCommandInput.limit is undefined`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = undefined
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.limit is null`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = null
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.limit is not a number`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = '1' as never
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.limit < 1`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = 0
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.limit > 1000`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = 1001
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListOrdersCommandInput.limit is not an integer`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = 3.45
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<ListOrdersCommand> with the expected data`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    const expectedCommand: ListOrdersCommand = {
      queryData: {
        orderId: mockListOrdersCommandInput.orderId,
        limit: mockListOrdersCommandInput.limit,
        sortOrder: mockListOrdersCommandInput.sortOrder,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toMatchObject(expectedResult)
  })
})
