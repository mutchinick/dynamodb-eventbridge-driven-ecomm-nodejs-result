import { z } from 'zod'
import { TypeUtilsPretty, TypeUtilsWrapper } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { ValueValidators } from '../../model/ValueValidators'

export type SubmitOrderPaymentCommandInput = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'> & {
    existingPaymentStatus?: OrderPaymentData['paymentStatus']
  }
>

type SubmitOrderPaymentCommandData = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type SubmitOrderPaymentCommandProps = {
  readonly commandData: SubmitOrderPaymentCommandData
  readonly options?: Record<string, unknown>
}
/**
 *
 */
export class SubmitOrderPaymentCommand implements SubmitOrderPaymentCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: SubmitOrderPaymentCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    submitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput,
  ): TypeUtilsWrapper<
    | Success<SubmitOrderPaymentCommand>
    | Failure<'InvalidArgumentsError'>
    | Failure<'PaymentAlreadyRejectedError'>
    | Failure<'PaymentAlreadyAcceptedError'>
  > {
    const logContext = 'SubmitOrderPaymentCommand.validateAndBuild'
    console.info(`${logContext} init:`, { submitOrderPaymentCommandInput })

    const propsResult = this.buildProps(submitOrderPaymentCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, submitOrderPaymentCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const submitOrderPaymentCommand = new SubmitOrderPaymentCommand(commandData, options)
    const submitOrderPaymentCommandResult = Result.makeSuccess(submitOrderPaymentCommand)
    console.info(`${logContext} exit success:`, { submitOrderPaymentCommandResult })
    return submitOrderPaymentCommandResult
  }

  /**
   *
   */
  private static buildProps(
    submitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput,
  ): TypeUtilsWrapper<
    | Success<SubmitOrderPaymentCommandProps>
    | Failure<'InvalidArgumentsError'>
    | Failure<'PaymentAlreadyRejectedError'>
    | Failure<'PaymentAlreadyAcceptedError'>
  > {
    const inputValidationResult = this.validateInput(submitOrderPaymentCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const paymentStatusValidationResult = this.validatePaymentStatus(submitOrderPaymentCommandInput)
    if (Result.isFailure(paymentStatusValidationResult)) {
      return paymentStatusValidationResult
    }

    const { orderId, sku, units, price, userId } = submitOrderPaymentCommandInput
    const submitOrderPaymentCommandProps: SubmitOrderPaymentCommandProps = {
      commandData: {
        orderId,
        sku,
        units,
        price,
        userId,
      },
      options: {},
    }
    return Result.makeSuccess(submitOrderPaymentCommandProps)
  }

  /**
   *
   */
  private static validateInput(
    submitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'SubmitOrderPaymentCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      existingPaymentStatus: ValueValidators.validPaymentStatus().optional(),
    })

    try {
      schema.parse(submitOrderPaymentCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, submitOrderPaymentCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, submitOrderPaymentCommandInput })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private static validatePaymentStatus(
    submitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput,
  ): Success<void> | Failure<'PaymentAlreadyRejectedError'> | Failure<'PaymentAlreadyAcceptedError'> {
    const logContext = 'SubmitOrderPaymentCommand.validatePaymentStatus'

    if (submitOrderPaymentCommandInput.existingPaymentStatus === 'PAYMENT_REJECTED') {
      const errorMessage = `Cannot submit an already rejected payment.`
      const paymentFailure = Result.makeFailure('PaymentAlreadyRejectedError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { paymentFailure, submitOrderPaymentCommandInput })
      return paymentFailure
    }

    if (submitOrderPaymentCommandInput.existingPaymentStatus === 'PAYMENT_ACCEPTED') {
      const errorMessage = `Cannot submit an already accepted payment.`
      const paymentFailure = Result.makeFailure('PaymentAlreadyAcceptedError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { paymentFailure, submitOrderPaymentCommandInput })
      return paymentFailure
    }

    return Result.makeSuccess()
  }
}
