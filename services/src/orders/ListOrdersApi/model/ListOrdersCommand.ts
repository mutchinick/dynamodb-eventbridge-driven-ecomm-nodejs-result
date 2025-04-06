import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { SortDirection } from '../../model/SortDirection'
import { ValueValidators } from '../../model/ValueValidators'

export type ListOrdersCommandInput = Partial<
  Pick<OrderData, 'orderId'> & { sortDirection: SortDirection } & { limit: number }
>

type ListOrdersCommandData = Partial<Pick<OrderData, 'orderId'> & { sortDirection: SortDirection } & { limit: number }>

type ListOrdersCommandProps = {
  readonly commandData: ListOrdersCommandData
  readonly options?: Record<string, unknown>
}

export class ListOrdersCommand implements ListOrdersCommandProps {
  //
  //
  //
  private constructor(
    public readonly commandData: ListOrdersCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    listOrdersCommandInput: ListOrdersCommandInput,
  ): Success<ListOrdersCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListOrdersCommand.validateAndBuild'
    console.info(`${logContext} init:`, { listOrdersCommandInput })

    const propsResult = this.buildProps(listOrdersCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, listOrdersCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const listOrdersCommand = new ListOrdersCommand(commandData, options)
    const listOrdersCommandResult = Result.makeSuccess(listOrdersCommand)
    console.info(`${logContext} exit success:`, { listOrdersCommandResult, listOrdersCommandInput })
    return listOrdersCommandResult
  }

  //
  //
  //
  private static buildProps(
    listOrdersCommandInput: ListOrdersCommandInput,
  ): Success<ListOrdersCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(listOrdersCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sortDirection, limit } = listOrdersCommandInput
    const listOrdersCommandProps: ListOrdersCommandProps = {
      commandData: { orderId, sortDirection, limit },
      options: {},
    }
    return Result.makeSuccess(listOrdersCommandProps)
  }

  //
  //
  //
  private static validateInput(
    listOrdersCommandInput: ListOrdersCommandData,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListOrdersCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId().optional(),
      sortDirection: ValueValidators.validSortDirection().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(listOrdersCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, listOrdersCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, listOrdersCommandInput })
      return invalidArgsFailure
    }
  }
}
