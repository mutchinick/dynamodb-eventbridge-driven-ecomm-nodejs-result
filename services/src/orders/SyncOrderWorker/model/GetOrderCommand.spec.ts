import { Result } from '../../errors/Result'
import { GetOrderCommand, GetOrderCommandInput } from './GetOrderCommand'

function buildMockValidGetOrderCommandInput() {
  const mockValidInput: GetOrderCommandInput = {
    orderId: 'mockOrderId',
  }
  return mockValidInput
}

describe(`Orders Service SyncOrderWorker GetOrderCommand tests`, () => {
  //
  // Test GetOrderCommandInput edge cases
  //
  it(`returns a Success if the input GetOrderCommandInput is valid`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput is undefined`, () => {
    const mockGetOrderCommandInput: GetOrderCommandInput = undefined
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput is null`, () => {
    const mockGetOrderCommandInput: GetOrderCommandInput = null
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test GetOrderCommandInput.orderId edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is missing`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    delete mockGetOrderCommandInput.orderId
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is undefined`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = undefined
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is null`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = null
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is empty`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = ''
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is blank`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = '      '
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId length < 4`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = '123'
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<GetOrderCommand> with the expected data`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    const expectedCommand: GetOrderCommand = {
      orderId: mockGetOrderCommandInput.orderId,
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(result).toMatchObject(expectedResult)
  })
})
