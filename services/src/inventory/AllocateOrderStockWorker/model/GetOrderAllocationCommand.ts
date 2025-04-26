// FIXME: This component is duplicated in DeallocateOrderPaymentRejectedWorker.
// It should be moved to a common place. Will do soon.
import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'

export type GetOrderAllocationCommandInput = TypeUtilsPretty<Pick<OrderAllocationData, 'orderId' | 'sku'>>

type GetOrderAllocationCommandData = TypeUtilsPretty<Pick<OrderAllocationData, 'orderId' | 'sku'>>

type GetOrderAllocationCommandProps = {
  readonly commandData: GetOrderAllocationCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class GetOrderAllocationCommand implements GetOrderAllocationCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: GetOrderAllocationCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    getOrderAllocationCommandInput: GetOrderAllocationCommandInput,
  ): Success<GetOrderAllocationCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'GetOrderAllocationCommand.validateAndBuild'
    console.info(`${logContext} init:`, { getOrderAllocationCommandInput })

    const propsResult = this.buildProps(getOrderAllocationCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, getOrderAllocationCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const getOrderAllocationCommand = new GetOrderAllocationCommand(commandData, options)
    const getOrderAllocationCommandResult = Result.makeSuccess(getOrderAllocationCommand)
    console.info(`${logContext} exit success:`, { getOrderAllocationCommandResult })
    return getOrderAllocationCommandResult
  }

  /**
   *
   */
  private static buildProps(
    getOrderAllocationCommandInput: GetOrderAllocationCommandInput,
  ): Success<GetOrderAllocationCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(getOrderAllocationCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sku } = getOrderAllocationCommandInput
    const getOrderAllocationCommandProps: GetOrderAllocationCommandProps = {
      commandData: { orderId, sku },
      options: {},
    }
    return Result.makeSuccess(getOrderAllocationCommandProps)
  }

  /**
   *
   */
  private static validateInput(
    getOrderAllocationCommandInput: GetOrderAllocationCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'GetOrderAllocationCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
    })

    try {
      schema.parse(getOrderAllocationCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, getOrderAllocationCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, getOrderAllocationCommandInput })
      return invalidArgsFailure
    }
  }
}
