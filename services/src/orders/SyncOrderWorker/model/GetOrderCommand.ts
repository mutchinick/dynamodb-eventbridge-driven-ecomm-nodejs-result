import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { ValueValidators } from '../../model/ValueValidators'

export type GetOrderCommandInput = Pick<OrderData, 'orderId'>

export type GetOrderCommandData = Pick<OrderData, 'orderId'>

type GetOrderCommandProps = {
  readonly orderData: GetOrderCommandData
  readonly options?: Record<string, unknown>
}

export class GetOrderCommand implements GetOrderCommandProps {
  //
  //
  //
  private constructor(
    readonly orderData: GetOrderCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    getOrderCommandInput: GetOrderCommandInput,
  ): Success<GetOrderCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'GetOrderCommand.validateAndBuild'
    console.info(`${logContext} init:`, { getOrderCommandInput })

    const propsResult = this.buildProps(getOrderCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, getOrderCommandInput })
      return propsResult
    }

    const { orderData, options } = propsResult.value
    const getOrderCommand = new GetOrderCommand(orderData, options)
    const getOrderCommandResult = Result.makeSuccess(getOrderCommand)
    console.info(`${logContext} exit success:`, { getOrderCommandResult, getOrderCommandInput })
    return getOrderCommandResult
  }

  //
  //
  //
  private static buildProps(
    getOrderCommandInput: GetOrderCommandInput,
  ): Success<GetOrderCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(getOrderCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId } = getOrderCommandInput
    const getOrderCommandProps: GetOrderCommandProps = { orderData: { orderId }, options: {} }
    return Result.makeSuccess(getOrderCommandProps)
  }

  //
  //
  //
  private static validateInput(
    getOrderCommandInput: GetOrderCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'GetOrderCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
    })

    try {
      schema.parse(getOrderCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, getOrderCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, getOrderCommandInput })
      return invalidArgsFailure
    }
  }
}
