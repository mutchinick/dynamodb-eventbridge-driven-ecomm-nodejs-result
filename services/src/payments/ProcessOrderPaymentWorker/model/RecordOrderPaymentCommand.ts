import { z } from 'zod'
import { TypeUtilsPretty, TypeUtilsWrapper } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { ValueValidators } from '../../model/ValueValidators'

export type RecordOrderPaymentCommandInput = {
  existingOrderPaymentData?: OrderPaymentData
  newOrderPaymentFields: TypeUtilsPretty<
    Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId' | 'paymentId' | 'paymentStatus'>
  >
}

type RecordOrderPaymentCommandProps = {
  readonly commandData: OrderPaymentData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class RecordOrderPaymentCommand implements RecordOrderPaymentCommandProps {
  private static readonly ERROR_PAYMENT_ID_PREFIX = 'ERROR:ORDER_ID:'

  /**
   *
   */
  private constructor(
    public readonly commandData: OrderPaymentData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    recordOrderPaymentCommandInput: RecordOrderPaymentCommandInput,
  ): TypeUtilsWrapper<
    | Success<RecordOrderPaymentCommand>
    | Failure<'InvalidArgumentsError'>
    | Failure<'PaymentAlreadyRejectedError'>
    | Failure<'PaymentAlreadyAcceptedError'>
  > {
    const logContext = 'RecordOrderPaymentCommand.validateAndBuild'
    console.info(`${logContext} init:`, { recordOrderPaymentCommandInput })

    const propsResult = this.buildProps(recordOrderPaymentCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, recordOrderPaymentCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const recordOrderPaymentCommand = new RecordOrderPaymentCommand(commandData, options)
    const recordOrderPaymentCommandResult = Result.makeSuccess(recordOrderPaymentCommand)
    console.info(`${logContext} exit success:`, { recordOrderPaymentCommandResult })
    return recordOrderPaymentCommandResult
  }

  /**
   *
   */
  private static buildProps(
    recordOrderPaymentCommandInput: RecordOrderPaymentCommandInput,
  ): TypeUtilsWrapper<
    | Success<RecordOrderPaymentCommandProps>
    | Failure<'InvalidArgumentsError'>
    | Failure<'PaymentAlreadyRejectedError'>
    | Failure<'PaymentAlreadyAcceptedError'>
  > {
    const inputValidationResult = this.validateInput(recordOrderPaymentCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const qualifiedOrderPaymentDataResult = this.computeQualifiedOrderPaymentData(recordOrderPaymentCommandInput)
    if (Result.isFailure(qualifiedOrderPaymentDataResult)) {
      return qualifiedOrderPaymentDataResult
    }

    const qualifiedOrderPaymentData = qualifiedOrderPaymentDataResult.value
    const { orderId, sku, units, price, userId, createdAt, updatedAt } = qualifiedOrderPaymentData
    const { paymentId, paymentStatus, paymentRetries } = qualifiedOrderPaymentData
    const recordOrderPaymentCommandProps: RecordOrderPaymentCommandProps = {
      commandData: {
        orderId,
        sku,
        units,
        price,
        userId,
        createdAt,
        updatedAt,
        paymentId,
        paymentStatus,
        paymentRetries,
      },
      options: {},
    }
    return Result.makeSuccess(recordOrderPaymentCommandProps)
  }

  /**
   *
   */
  private static validateInput(
    recordOrderPaymentCommandInput: RecordOrderPaymentCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'RecordOrderPaymentCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const existingOrderPaymentDataSchema = z
      .object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
        paymentId: ValueValidators.validPaymentId().optional(),
        paymentStatus: ValueValidators.validPaymentStatus(),
        paymentRetries: ValueValidators.validPaymentRetries(),
      })
      .optional()

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const newOrderPaymentFieldsSchema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      paymentId: ValueValidators.validPaymentId().optional(),
      paymentStatus: ValueValidators.validPaymentStatus(),
    })

    const schema = z.object({
      existingOrderPaymentData: existingOrderPaymentDataSchema,
      newOrderPaymentFields: newOrderPaymentFieldsSchema,
    })

    try {
      schema.parse(recordOrderPaymentCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, recordOrderPaymentCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, recordOrderPaymentCommandInput })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private static computeQualifiedOrderPaymentData(
    recordOrderPaymentCommandInput: RecordOrderPaymentCommandInput,
  ): TypeUtilsWrapper<
    Success<OrderPaymentData> | Failure<'PaymentAlreadyRejectedError'> | Failure<'PaymentAlreadyAcceptedError'>
  > {
    const logContext = 'RecordOrderPaymentCommand.computeQualifiedOrderPaymentData'

    const currentDate = new Date().toISOString()
    const { existingOrderPaymentData, newOrderPaymentFields: newOrderPaymentFields } = recordOrderPaymentCommandInput

    const newPaymentId = newOrderPaymentFields.paymentId || this.generateErrorPaymentId(newOrderPaymentFields.orderId)

    if (!existingOrderPaymentData) {
      const qualifiedOrderPaymentData: OrderPaymentData = {
        orderId: newOrderPaymentFields.orderId,
        sku: newOrderPaymentFields.sku,
        units: newOrderPaymentFields.units,
        price: newOrderPaymentFields.price,
        userId: newOrderPaymentFields.userId,
        createdAt: currentDate,
        updatedAt: currentDate,
        paymentId: newPaymentId,
        paymentStatus: newOrderPaymentFields.paymentStatus,
        paymentRetries: 0,
      }
      return Result.makeSuccess(qualifiedOrderPaymentData)
    }

    if (existingOrderPaymentData.paymentStatus === 'PAYMENT_REJECTED') {
      const errorMessage = `Cannot modify the record of an already rejected payment.`
      const paymentFailure = Result.makeFailure('PaymentAlreadyRejectedError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { paymentFailure, recordOrderPaymentCommandInput })
      return paymentFailure
    }

    if (existingOrderPaymentData.paymentStatus === 'PAYMENT_ACCEPTED') {
      const errorMessage = `Cannot modify the record of an already accepted payment.`
      const paymentFailure = Result.makeFailure('PaymentAlreadyAcceptedError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { paymentFailure, recordOrderPaymentCommandInput })
      return paymentFailure
    }

    const qualifiedOrderPaymentData: OrderPaymentData = {
      orderId: existingOrderPaymentData.orderId,
      sku: existingOrderPaymentData.sku,
      units: existingOrderPaymentData.units,
      price: existingOrderPaymentData.price,
      userId: existingOrderPaymentData.userId,
      createdAt: existingOrderPaymentData.createdAt,
      updatedAt: currentDate,
      paymentId: newPaymentId,
      paymentStatus: newOrderPaymentFields.paymentStatus,
      paymentRetries: existingOrderPaymentData.paymentRetries + 1,
    }
    return Result.makeSuccess(qualifiedOrderPaymentData)
  }

  /**
   *
   */
  private static generateErrorPaymentId(orderId: string): string {
    const errorPaymentId = `${this.ERROR_PAYMENT_ID_PREFIX}${orderId}`
    return errorPaymentId
  }
}
