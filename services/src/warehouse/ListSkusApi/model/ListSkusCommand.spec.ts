import { Result } from '../../errors/Result'
import { ListSkusCommand, ListSkusCommandInput } from './ListSkusCommand'

function buildMockListSkusCommandInput(): ListSkusCommandInput {
  const mockValidInput: ListSkusCommandInput = {
    sku: 'mockSku',
    sortDirection: 'asc',
    limit: 10,
  }
  return mockValidInput
}

describe(`Warehouse Service ListSkusApi ListSkusCommand tests`, () => {
  //
  // Test ListSkusCommandData edge cases
  //
  it(`returns a Success if the input ListSkusCommandInput is valid`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput is undefined`, () => {
    const mockListSkusCommandInput = undefined as unknown as ListSkusCommandInput
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput is null`, () => {
    const mockListSkusCommandInput = null as unknown as ListSkusCommandInput
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test ListSkusCommandData.sku edge cases
  //
  it(`returns a Success if the input ListSkusCommandInput.sku is missing`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    delete mockListSkusCommandInput.sku
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input ListSkusCommandInput.sku is undefined`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sku = undefined
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.sku is null`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sku = null
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.sku is empty`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sku = ''
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.sku is blank`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sku = '      '
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.sku length < 4`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sku = '123'
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test ListSkusCommandData.sortDirection edge cases
  //
  it(`returns a Success if the input ListSkusCommandInput.sortDirection is missing`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    delete mockListSkusCommandInput.sortDirection
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input ListSkusCommandInput.sortDirection is undefined`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sortDirection = undefined
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.sortDirection is null`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sortDirection = null
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.sortDirection is empty`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sortDirection = '' as never
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.sortDirection is blank`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sortDirection = '      ' as never
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.sortDirection is a random string`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sortDirection = 'xyz' as never
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test ListSkusCommandData.limit edge cases
  //
  it(`returns a Success if the input ListSkusCommandInput.limit is missing`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    delete mockListSkusCommandInput.limit
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input ListSkusCommandInput.limit is undefined`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = undefined
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.limit is null`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = null
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.limit is not a number`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = '1' as never
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.limit < 1`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = 0
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.limit > 1000`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = 1001
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      ListSkusCommandInput.limit is not an integer`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = 3.45
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<ListSkusCommand> with the expected data`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    const expectedCommand: ListSkusCommand = {
      commandData: {
        sku: mockListSkusCommandInput.sku,
        limit: mockListSkusCommandInput.limit,
        sortDirection: mockListSkusCommandInput.sortDirection,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
