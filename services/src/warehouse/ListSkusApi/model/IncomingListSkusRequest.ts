import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { SortParams } from '../../model/SortParams'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingListSkusRequestInput = TypeUtilsPretty<Partial<Pick<RestockSkuData, 'sku'> & SortParams>>

type IncomingListSkusRequestProps = TypeUtilsPretty<Partial<Pick<RestockSkuData, 'sku'> & SortParams>>

export class IncomingListSkusRequest implements IncomingListSkusRequestProps {
  //
  //
  //
  private constructor(
    public readonly sku?: string,
    public readonly sortDirection?: 'asc' | 'desc',
    public readonly limit?: number,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    incomingListSkusRequestInput: IncomingListSkusRequestInput,
  ): Success<IncomingListSkusRequest> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingListSkusRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingListSkusRequestInput })

    const propsResult = this.buildProps(incomingListSkusRequestInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingListSkusRequestInput })
      return propsResult
    }

    const { sku, sortDirection, limit } = propsResult.value
    const incomingListSkusRequest = new IncomingListSkusRequest(sku, sortDirection, limit)
    const incomingListSkusRequestResult = Result.makeSuccess(incomingListSkusRequest)
    console.info(`${logContext} exit success:`, { incomingListSkusRequestResult, incomingListSkusRequestInput })
    return incomingListSkusRequestResult
  }

  //
  //
  //
  private static buildProps(
    incomingListSkusRequestInput: IncomingListSkusRequestInput,
  ): Success<IncomingListSkusRequestProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(incomingListSkusRequestInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { sku, sortDirection, limit } = incomingListSkusRequestInput
    const incomingListSkusRequestProps: IncomingListSkusRequestProps = {
      sku,
      sortDirection,
      limit,
    }
    return Result.makeSuccess(incomingListSkusRequestProps)
  }

  //
  //
  //
  private static validateInput(
    incomingListSkusRequestInput: IncomingListSkusRequestInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingListSkusRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      sku: ValueValidators.validSku().optional(),
      sortDirection: ValueValidators.validSortDirection().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(incomingListSkusRequestInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingListSkusRequestInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, incomingListSkusRequestInput })
      return invalidArgsFailure
    }
  }
}
