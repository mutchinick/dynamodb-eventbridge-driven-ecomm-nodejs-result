import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { SortParams } from '../../model/SortParams'
import { ValueValidators } from '../../model/ValueValidators'

export type ListSkusCommandInput = TypeUtilsPretty<Partial<Pick<RestockSkuData, 'sku'> & SortParams>>

type ListSkusCommandData = TypeUtilsPretty<Partial<Pick<RestockSkuData, 'sku'> & SortParams>>

type ListSkusCommandProps = {
  readonly commandData: ListSkusCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class ListSkusCommand implements ListSkusCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: ListSkusCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    listSkusCommandInput: ListSkusCommandInput,
  ): Success<ListSkusCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListSkusCommand.validateAndBuild'
    console.info(`${logContext} init:`, { listSkusCommandInput })

    const propsResult = this.buildProps(listSkusCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, listSkusCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const listSkusCommand = new ListSkusCommand(commandData, options)
    const listSkusCommandResult = Result.makeSuccess(listSkusCommand)
    console.info(`${logContext} exit success:`, { listSkusCommandResult, listSkusCommandInput })
    return listSkusCommandResult
  }

  /**
   *
   */
  private static buildProps(
    listSkusCommandInput: ListSkusCommandInput,
  ): Success<ListSkusCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(listSkusCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { sku, sortDirection, limit } = listSkusCommandInput
    const listSkusCommandProps: ListSkusCommandProps = {
      commandData: { sku, sortDirection, limit },
      options: {},
    }
    return Result.makeSuccess(listSkusCommandProps)
  }

  /**
   *
   */
  private static validateInput(
    listSkusCommandInput: ListSkusCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListSkusCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      sku: ValueValidators.validSku().optional(),
      sortDirection: ValueValidators.validSortDirection().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(listSkusCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, listSkusCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, listSkusCommandInput })
      return invalidArgsFailure
    }
  }
}
