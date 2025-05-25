import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { SortParams } from '../../model/SortParams'
import { ValueValidators } from '../../model/ValueValidators'

export type ListOrderPaymentsCommandInput = TypeUtilsPretty<Partial<Pick<OrderPaymentData, 'orderId'> & SortParams>>

type ListOrderPaymentsCommandData = TypeUtilsPretty<Partial<Pick<OrderPaymentData, 'orderId'> & SortParams>>

type ListOrderPaymentsCommandProps = {
  readonly commandData: ListOrderPaymentsCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class ListOrderPaymentsCommand implements ListOrderPaymentsCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: ListOrderPaymentsCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    listOrderPaymentsCommandInput: ListOrderPaymentsCommandInput,
  ): Success<ListOrderPaymentsCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListOrderPaymentsCommand.validateAndBuild'
    console.info(`${logContext} init:`, { listOrderPaymentsCommandInput })

    const propsResult = this.buildProps(listOrderPaymentsCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, listOrderPaymentsCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const listOrderPaymentsCommand = new ListOrderPaymentsCommand(commandData, options)
    const listOrderPaymentsCommandResult = Result.makeSuccess(listOrderPaymentsCommand)
    console.info(`${logContext} exit success:`, { listOrderPaymentsCommandResult, listOrderPaymentsCommandInput })
    return listOrderPaymentsCommandResult
  }

  /**
   *
   */
  private static buildProps(
    listOrderPaymentsCommandInput: ListOrderPaymentsCommandInput,
  ): Success<ListOrderPaymentsCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(listOrderPaymentsCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sortDirection, limit } = listOrderPaymentsCommandInput
    const listOrderPaymentsCommandProps: ListOrderPaymentsCommandProps = {
      commandData: { orderId, sortDirection, limit },
      options: {},
    }
    return Result.makeSuccess(listOrderPaymentsCommandProps)
  }

  /**
   *
   */
  private static validateInput(
    listOrderPaymentsCommandInput: ListOrderPaymentsCommandData,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListOrderPaymentsCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId().optional(),
      sortDirection: ValueValidators.validSortDirection().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(listOrderPaymentsCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, listOrderPaymentsCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, listOrderPaymentsCommandInput })
      return invalidArgsFailure
    }
  }
}
