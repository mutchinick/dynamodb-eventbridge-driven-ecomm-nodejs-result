import { Result } from '../../errors/Result'
import { RecordOrderPaymentCommand, RecordOrderPaymentCommandInput } from './RecordOrderPaymentCommand'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 12
const mockPrice = 12.34
const mockUserId = 'mockUserId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate
const mockPaymentId = 'mockPaymentId'

function buildMockRecordOrderPaymentCommandInput(): RecordOrderPaymentCommandInput {
  const mockValidInput: RecordOrderPaymentCommandInput = {
    existingOrderPaymentData: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
      paymentId: mockPaymentId,
      paymentStatus: 'PAYMENT_FAILED',
      paymentRetries: 0,
    },
    newOrderPaymentFields: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      paymentId: mockPaymentId,
      paymentStatus: 'PAYMENT_ACCEPTED',
    },
  }
  return mockValidInput
}

describe(`Payments Service ProcessOrderPaymentWorker RecordOrderPaymentCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test RecordOrderPaymentCommandInput edge cases
   ************************************************************/
  describe(`Test RecordOrderPaymentCommandInput edge cases`, () => {
    it(`does not return a Failure if the input RecordOrderPaymentCommandInput is valid`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput is undefined`, () => {
      const mockTestInput = undefined as never
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput is null`, () => {
      const mockTestInput = null as never
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test RecordOrderPaymentCommandInput.existingOrderPaymentData edge cases
   ************************************************************/
  describe(`Test RecordOrderPaymentCommandInput.existingOrderPaymentData edge cases`, () => {
    it(`does not return a Failure if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData is an empty object`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData = {} as never
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.existingOrderPaymentData.orderId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.orderId is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.orderId = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.orderId is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.orderId = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.orderId is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.orderId = ''
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.orderId is blank`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.orderId = '      '
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.orderId length < 4`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.orderId = '123'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.existingOrderPaymentData.sku edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.sku is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.sku = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.sku is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.sku = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.sku is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.sku = ''
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.sku is blank`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.sku = '      '
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.sku length < 4`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.sku = '123'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.existingOrderPaymentData.units edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.units is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.units = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.units is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.units = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.units < 1`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.units = 0
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.units is not an integer`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.units = 3.45
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.units is not a number`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.units = '1' as unknown as number
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.existingOrderPaymentData.price edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.price is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.price = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.price is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.price = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.price < 0`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.price = -1
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.price is not a number`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.price = '1' as unknown as number
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.existingOrderPaymentData.userId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.userId is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.userId = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.userId is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.userId = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.userId is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.userId = ''
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.userId is blank`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.userId = '      '
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.userId length < 4`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.userId = '123'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.existingOrderPaymentData.createdAt edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.createdAt is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.createdAt = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.createdAt is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.createdAt = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.createdAt is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.createdAt = ''
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.createdAt is blank`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.createdAt = '      '
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.createdAt length < 4`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.createdAt = '123'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.existingOrderPaymentData.updatedAt edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.updatedAt is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.updatedAt = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.updatedAt is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.updatedAt = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.updatedAt is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.updatedAt = ''
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.updatedAt is blank`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.updatedAt = '      '
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.updatedAt length < 4`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.updatedAt = '123'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentId edge cases
     ************************************************************/
    it(`does not return a Failure if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentId is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentId = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentId is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentId = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentId is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentId = ''
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentId is blank`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentId = '      '
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentId length < 4`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentId = '123'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentStatus edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentStatus is
        undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentStatus = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentStatus is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentStatus = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentStatus is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentStatus = '' as never
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentStatus is not of
        PaymentStatus`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentStatus = 'mockInvalidValue' as never
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`does not return a Failure if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentStatus is
        'PAYMENT_FAILED'`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentStatus = 'PAYMENT_FAILED'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind PaymentAlreadyRejectedError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentStatus is
        'PAYMENT_REJECTED'`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentStatus = 'PAYMENT_REJECTED'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'PaymentAlreadyRejectedError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind PaymentAlreadyAcceptedError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentStatus is
        'PAYMENT_ACCEPTED'`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentStatus = 'PAYMENT_ACCEPTED'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'PaymentAlreadyAcceptedError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentRetries edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentRetries is
        undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentRetries = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentRetries is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentRetries = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentRetries < 0`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentRetries = -1
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentRetries is not an
        integer`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentRetries = 3.45
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.existingOrderPaymentData.paymentRetries is not a
        number`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentRetries = '1' as unknown as number
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test RecordOrderPaymentCommandInput.newOrderPaymentFields edge cases
   ************************************************************/
  describe(`Test RecordOrderPaymentCommandInput.newOrderPaymentFields edge cases`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields is an empty object`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields = {} as never
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.newOrderPaymentFields.orderId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.orderId is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.orderId = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.orderId is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.orderId = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.orderId is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.orderId = ''
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.orderId is blank`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.orderId = '      '
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.orderId length < 4`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.orderId = '123'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.newOrderPaymentFields.sku edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.sku is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.sku = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.sku is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.sku = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.sku is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.sku = ''
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.sku is blank`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.sku = '      '
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.sku length < 4`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.sku = '123'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.newOrderPaymentFields.units edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.units is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.units = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.units is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.units = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.units < 1`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.units = 0
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.units is not an integer`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.units = 3.45
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.units is not a number`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.units = '1' as unknown as number
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.newOrderPaymentFields.price edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.price is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.price = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.price is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.price = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.price < 0`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.price = -1
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.price is not a number`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.price = '1' as unknown as number
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.newOrderPaymentFields.userId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.userId is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.userId = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.userId is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.userId = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.userId is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.userId = ''
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.userId is blank`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.userId = '      '
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.userId length < 4`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.userId = '123'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentId edge cases
     ************************************************************/
    it(`does not return a Failure if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentId is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentId = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentId is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentId = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentId is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentId = ''
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentId is blank`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentId = '      '
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentId length < 4`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentId = '123'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentStatus edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentStatus is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentStatus = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentStatus is null`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentStatus = null
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentStatus is empty`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentStatus = '' as never
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentStatus is not of
        PaymentStatus`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentStatus = 'mockInvalidValue' as never
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`does not return a Failure if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentStatus is
        'PAYMENT_ACCEPTED'`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentStatus = 'PAYMENT_ACCEPTED'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`does not return a Failure if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentStatus is
        'PAYMENT_REJECTED'`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentStatus = 'PAYMENT_REJECTED'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`does not return a Failure if the input
        RecordOrderPaymentCommandInput.newOrderPaymentFields.paymentStatus is
        'PAYMENT_FAILED'`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentStatus = 'PAYMENT_FAILED'
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      expect(Result.isFailure(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  describe(`Test expected results`, () => {
    it(`returns the expected Success<RecordOrderPaymentCommand> if the execution path is
        successful and existingOrderPaymentData is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      const expectedCommand: RecordOrderPaymentCommand = {
        commandData: {
          orderId: mockTestInput.newOrderPaymentFields.orderId,
          sku: mockTestInput.newOrderPaymentFields.sku,
          units: mockTestInput.newOrderPaymentFields.units,
          price: mockTestInput.newOrderPaymentFields.price,
          userId: mockTestInput.newOrderPaymentFields.userId,
          createdAt: mockCreatedAt,
          updatedAt: mockUpdatedAt,
          paymentId: mockTestInput.newOrderPaymentFields.paymentId,
          paymentStatus: mockTestInput.newOrderPaymentFields.paymentStatus,
          paymentRetries: 0,
        },
        options: {},
      }
      const expectedResult = Result.makeSuccess(expectedCommand)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expect.objectContaining(expectedResult))
    })

    it(`returns the expected Success<RecordOrderPaymentCommand> if the execution path is
        successful and existingOrderPaymentData.paymentId is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.existingOrderPaymentData.paymentId = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      const expectedCommand: RecordOrderPaymentCommand = {
        commandData: {
          orderId: mockTestInput.newOrderPaymentFields.orderId,
          sku: mockTestInput.newOrderPaymentFields.sku,
          units: mockTestInput.newOrderPaymentFields.units,
          price: mockTestInput.newOrderPaymentFields.price,
          userId: mockTestInput.newOrderPaymentFields.userId,
          createdAt: mockCreatedAt,
          updatedAt: mockUpdatedAt,
          paymentId: mockTestInput.newOrderPaymentFields.paymentId,
          paymentStatus: mockTestInput.newOrderPaymentFields.paymentStatus,
          paymentRetries: mockTestInput.existingOrderPaymentData.paymentRetries + 1,
        },
        options: {},
      }
      const expectedResult = Result.makeSuccess(expectedCommand)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expect.objectContaining(expectedResult))
    })

    it(`returns the expected Success<RecordOrderPaymentCommand> if the execution path is
        successful when existingOrderPaymentData is defined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      const expectedCommand: RecordOrderPaymentCommand = {
        commandData: {
          orderId: mockTestInput.existingOrderPaymentData.orderId,
          sku: mockTestInput.existingOrderPaymentData.sku,
          units: mockTestInput.existingOrderPaymentData.units,
          price: mockTestInput.existingOrderPaymentData.price,
          userId: mockTestInput.existingOrderPaymentData.userId,
          createdAt: mockTestInput.existingOrderPaymentData.createdAt,
          updatedAt: mockDate,
          paymentId: mockTestInput.newOrderPaymentFields.paymentId,
          paymentStatus: mockTestInput.newOrderPaymentFields.paymentStatus,
          paymentRetries: mockTestInput.existingOrderPaymentData.paymentRetries + 1,
        },
        options: {},
      }
      const expectedResult = Result.makeSuccess(expectedCommand)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expect.objectContaining(expectedResult))
    })

    it(`returns the expected Success<RecordOrderPaymentCommand> if the execution path is
        successful when newOrderPaymentFields.paymentId is undefined`, () => {
      const mockTestInput = buildMockRecordOrderPaymentCommandInput()
      mockTestInput.newOrderPaymentFields.paymentId = undefined
      const result = RecordOrderPaymentCommand.validateAndBuild(mockTestInput)
      const expectedCommand: RecordOrderPaymentCommand = {
        commandData: {
          orderId: mockTestInput.existingOrderPaymentData.orderId,
          sku: mockTestInput.existingOrderPaymentData.sku,
          units: mockTestInput.existingOrderPaymentData.units,
          price: mockTestInput.existingOrderPaymentData.price,
          userId: mockTestInput.existingOrderPaymentData.userId,
          createdAt: mockTestInput.existingOrderPaymentData.createdAt,
          updatedAt: mockDate,
          paymentId: `ERROR:ORDER_ID:${mockTestInput.newOrderPaymentFields.orderId}`,
          paymentStatus: mockTestInput.newOrderPaymentFields.paymentStatus,
          paymentRetries: mockTestInput.existingOrderPaymentData.paymentRetries + 1,
        },
        options: {},
      }
      const expectedResult = Result.makeSuccess(expectedCommand)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expect.objectContaining(expectedResult))
    })
  })
})
