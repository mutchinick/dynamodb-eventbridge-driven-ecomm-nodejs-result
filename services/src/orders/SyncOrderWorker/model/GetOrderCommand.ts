import { z } from 'zod'
import { Result, Success, Failure } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { ValueValidators } from '../../model/ValueValidators'

export type GetOrderCommandInput = Pick<OrderData, 'orderId'>

type GetOrderCommandProps = {
  readonly orderId: string
  readonly options?: Record<string, unknown>
}

export class GetOrderCommand implements GetOrderCommandProps {
  //
  //
  //
  private constructor(
    public readonly orderId: string,
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

    const { orderId, options } = propsResult.value
    const getOrderCommand = new GetOrderCommand(orderId, options)
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
    try {
      this.validateInput(getOrderCommandInput)
    } catch (error) {
      const logContext = 'GetOrderCommand.buildProps'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, getOrderCommandInput })
      return invalidArgsFailure
    }

    const { orderId } = getOrderCommandInput
    const getOrderCommandProps: GetOrderCommandProps = { orderId, options: {} }
    return Result.makeSuccess(getOrderCommandProps)
  }

  //
  //
  //
  private static validateInput(getOrderCommandInput: GetOrderCommandInput): void {
    z.object({
      orderId: ValueValidators.validOrderId(),
    }).parse(getOrderCommandInput)
  }
}
