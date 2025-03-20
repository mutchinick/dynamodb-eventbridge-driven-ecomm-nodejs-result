import { Result } from '../../errors/Result'
import { GetOrderCommand, GetOrderCommandInput } from './GetOrderCommand'

function buildMockGetOrderCommandInput() {
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
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
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
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    delete mockGetOrderCommandInput.orderId
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is undefined`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = undefined
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is null`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = null
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is empty`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = ''
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is blank`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = '      '
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommandInput.orderId length < 4`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
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
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    const expectedCommand: GetOrderCommand = {
      orderData: {
        orderId: mockGetOrderCommandInput.orderId,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toMatchObject(expectedResult)
  })
})
