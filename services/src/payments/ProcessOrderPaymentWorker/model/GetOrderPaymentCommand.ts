import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { ValueValidators } from '../../model/ValueValidators'

export type GetOrderPaymentCommandInput = TypeUtilsPretty<Pick<OrderPaymentData, 'orderId'>>

type GetOrderPaymentCommandData = TypeUtilsPretty<Pick<OrderPaymentData, 'orderId'>>

type GetOrderPaymentCommandProps = {
  readonly commandData: GetOrderPaymentCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class GetOrderPaymentCommand implements GetOrderPaymentCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: GetOrderPaymentCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    getOrderPaymentCommandInput: GetOrderPaymentCommandInput,
  ): Success<GetOrderPaymentCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'GetOrderPaymentCommand.validateAndBuild'
    console.info(`${logContext} init:`, { getOrderPaymentCommandInput })

    const propsResult = this.buildProps(getOrderPaymentCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, getOrderPaymentCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const getOrderPaymentCommand = new GetOrderPaymentCommand(commandData, options)
    const getOrderPaymentCommandResult = Result.makeSuccess(getOrderPaymentCommand)
    console.info(`${logContext} exit success:`, { getOrderPaymentCommandResult })
    return getOrderPaymentCommandResult
  }

  /**
   *
   */
  private static buildProps(
    getOrderPaymentCommandInput: GetOrderPaymentCommandInput,
  ): Success<GetOrderPaymentCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(getOrderPaymentCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId } = getOrderPaymentCommandInput
    const getOrderPaymentCommandProps: GetOrderPaymentCommandProps = {
      commandData: { orderId },
      options: {},
    }
    return Result.makeSuccess(getOrderPaymentCommandProps)
  }

  /**
   *
   */
  private static validateInput(
    getOrderPaymentCommandInput: GetOrderPaymentCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'GetOrderPaymentCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
    })

    try {
      schema.parse(getOrderPaymentCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, getOrderPaymentCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, getOrderPaymentCommandInput })
      return invalidArgsFailure
    }
  }
}
