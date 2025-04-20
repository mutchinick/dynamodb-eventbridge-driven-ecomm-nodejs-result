import { Result } from '../../errors/Result'
import { GetOrderAllocationCommand, GetOrderAllocationCommandInput } from './GetOrderAllocationCommand'

const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'

function buildMockGetOrderAllocationCommandInput(): GetOrderAllocationCommandInput {
  const mockValidInput: GetOrderAllocationCommandInput = {
    orderId: mockOrderId,
    sku: mockSku,
  }
  return mockValidInput
}

describe(`Warehouse Service DeallocateOrderPaymentRejectedWorker GetOrderAllocationCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test GetOrderAllocationCommandInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input GetOrderAllocationCommandInput is valid`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput is undefined`, () => {
    const mockGetOrderAllocationCommandInput: GetOrderAllocationCommandInput = undefined
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput is null`, () => {
    const mockGetOrderAllocationCommandInput: GetOrderAllocationCommandInput = null
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test GetOrderAllocationCommandInput.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput.orderId is undefined`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.orderId = undefined
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput.orderId is null`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.orderId = null
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput.orderId is empty`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.orderId = ''
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput.orderId is blank`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.orderId = '      '
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput.orderId length < 4`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.orderId = '123'
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test GetOrderAllocationCommandInput.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput.sku is undefined`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.sku = undefined
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput.sku is null`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.sku = null
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput.sku is empty`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.sku = ''
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput.sku is blank`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.sku = '      '
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input GetOrderAllocationCommandInput.sku length < 4`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.sku = '123'
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
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
  it(`returns the expected Success<GetOrderAllocationCommand> if the execution path is successful`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    const expectedCommand: GetOrderAllocationCommand = {
      commandData: {
        orderId: mockGetOrderAllocationCommandInput.orderId,
        sku: mockGetOrderAllocationCommandInput.sku,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
