import { Result } from '../../errors/Result'
import { SubmitOrderPaymentCommand, SubmitOrderPaymentCommandInput } from './SubmitOrderPaymentCommand'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 12
const mockPrice = 12.34
const mockUserId = 'mockUserId'

function buildMockSubmitOrderPaymentCommandInput(): SubmitOrderPaymentCommandInput {
  const mockValidInput: SubmitOrderPaymentCommandInput = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return mockValidInput
}

describe(`Payments Service ProcessOrderPaymentWorker SubmitOrderPaymentCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SubmitOrderPaymentCommandInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input SubmitOrderPaymentCommandInput is valid`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput is undefined`, () => {
    const mockTestInput = undefined as never
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput is null`, () => {
    const mockTestInput = null as never
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test SubmitOrderPaymentCommandInput.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.orderId is undefined`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.orderId = undefined
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.orderId is null`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.orderId = null
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.orderId is empty`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.orderId = ''
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.orderId is blank`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.orderId = '      '
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.orderId length < 4`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.orderId = '123'
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test SubmitOrderPaymentCommandInput.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.sku is undefined`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.sku = undefined
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.sku is null`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.sku = null
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.sku is empty`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.sku = ''
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.sku is blank`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.sku = '      '
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.sku length < 4`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.sku = '123'
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test SubmitOrderPaymentCommandInput.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.units is undefined`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.units = undefined
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.units is null`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.units = null
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.units < 1`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.units = 0
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.units is not an integer`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.units = 3.45
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.units is not a number`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.units = '1' as unknown as number
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test SubmitOrderPaymentCommandInput.price edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.price is undefined`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.price = undefined
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.price is null`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.price = null
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.price < 0`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.price = -1
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.price is not a number`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.price = '1' as unknown as number
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test SubmitOrderPaymentCommandInput.userId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.userId is undefined`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.userId = undefined
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.userId is null`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.userId = null
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.userId is empty`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.userId = ''
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.userId is blank`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.userId = '      '
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.userId length < 4`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.userId = '123'
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test SubmitOrderPaymentCommandInput.existingPaymentStatus edge cases
   ************************************************************/
  it(`does not return a Failure if the input
      SubmitOrderPaymentCommandInput.existingPaymentStatus is undefined`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.existingPaymentStatus = undefined
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.existingPaymentStatus is null`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.existingPaymentStatus = null
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.existingPaymentStatus is empty`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.existingPaymentStatus = '' as never
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommandInput.existingPaymentStatus is not of PaymentStatus`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.existingPaymentStatus = 'mockInvalidValue' as never
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`does not return a Failure if the input
      SubmitOrderPaymentCommandInput.existingPaymentStatus is 'PAYMENT_FAILED'`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.existingPaymentStatus = 'PAYMENT_FAILED'
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind PaymentAlreadyRejectedError if the input
      SubmitOrderPaymentCommandInput.existingPaymentStatus is 'PAYMENT_REJECTED'`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.existingPaymentStatus = 'PAYMENT_REJECTED'
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'PaymentAlreadyRejectedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind PaymentAlreadyAcceptedError if the input
      SubmitOrderPaymentCommandInput.existingPaymentStatus is 'PAYMENT_ACCEPTED'`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    mockTestInput.existingPaymentStatus = 'PAYMENT_ACCEPTED'
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'PaymentAlreadyAcceptedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<SubmitOrderPaymentCommand> if the execution path is
      successful`, () => {
    const mockTestInput = buildMockSubmitOrderPaymentCommandInput()
    const result = SubmitOrderPaymentCommand.validateAndBuild(mockTestInput)
    const expectedCommand: SubmitOrderPaymentCommand = {
      commandData: {
        orderId: mockTestInput.orderId,
        sku: mockTestInput.sku,
        units: mockTestInput.units,
        price: mockTestInput.price,
        userId: mockTestInput.userId,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
