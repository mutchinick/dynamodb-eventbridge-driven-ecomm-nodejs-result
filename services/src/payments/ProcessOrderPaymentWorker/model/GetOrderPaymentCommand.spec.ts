import { Result } from '../../errors/Result'
import { GetOrderPaymentCommand, GetOrderPaymentCommandInput } from './GetOrderPaymentCommand'

const mockOrderId = 'mockOrderId'

function buildMockGetOrderPaymentCommandInput(): GetOrderPaymentCommandInput {
  const mockValidInput: GetOrderPaymentCommandInput = {
    orderId: mockOrderId,
  }
  return mockValidInput
}

describe(`Payments Service ProcessOrderPaymentWorker GetOrderPaymentCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test GetOrderPaymentCommandInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input GetOrderPaymentCommandInput is valid`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    const result = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderPaymentCommandInput is undefined`, () => {
    const mockGetOrderPaymentCommandInput: GetOrderPaymentCommandInput = undefined
    const result = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderPaymentCommandInput is null`, () => {
    const mockGetOrderPaymentCommandInput: GetOrderPaymentCommandInput = null
    const result = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test GetOrderPaymentCommandInput.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderPaymentCommandInput.orderId is undefined`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    mockGetOrderPaymentCommandInput.orderId = undefined
    const result = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderPaymentCommandInput.orderId is null`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    mockGetOrderPaymentCommandInput.orderId = null
    const result = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderPaymentCommandInput.orderId is empty`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    mockGetOrderPaymentCommandInput.orderId = ''
    const result = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderPaymentCommandInput.orderId is blank`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    mockGetOrderPaymentCommandInput.orderId = '      '
    const result = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderPaymentCommandInput.orderId length < 4`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    mockGetOrderPaymentCommandInput.orderId = '123'
    const result = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
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
  it(`returns the expected Success<GetOrderPaymentCommand> if the execution path is
      successful`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    const result = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    const expectedCommand: GetOrderPaymentCommand = {
      commandData: {
        orderId: mockGetOrderPaymentCommandInput.orderId,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
