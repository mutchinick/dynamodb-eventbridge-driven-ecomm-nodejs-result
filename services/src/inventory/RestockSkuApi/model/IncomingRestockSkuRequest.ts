import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingRestockSkuRequestInput = TypeUtilsPretty<Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>>

type IncomingRestockSkuRequestProps = TypeUtilsPretty<Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>>

//
//
//
export class IncomingRestockSkuRequest implements IncomingRestockSkuRequestProps {
  //
  //
  //
  private constructor(
    public readonly sku: string,
    public readonly units: number,
    public readonly lotId: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    incomingRestockSkuRequestInput: IncomingRestockSkuRequestInput,
  ): Success<IncomingRestockSkuRequest> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingRestockSkuRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingRestockSkuRequestInput })

    const propsResult = this.buildProps(incomingRestockSkuRequestInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingRestockSkuRequestInput })
      return propsResult
    }

    const { sku, units, lotId } = propsResult.value
    const incomingRestockSkuRequest = new IncomingRestockSkuRequest(sku, units, lotId)
    const incomingRestockSkuRequestResult = Result.makeSuccess(incomingRestockSkuRequest)
    console.info(`${logContext} exit success:`, { incomingRestockSkuRequestResult })
    return incomingRestockSkuRequestResult
  }

  //
  //
  //
  private static buildProps(
    incomingRestockSkuRequestInput: IncomingRestockSkuRequestInput,
  ): Success<IncomingRestockSkuRequestProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(incomingRestockSkuRequestInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { sku, units, lotId } = incomingRestockSkuRequestInput
    const incomingRestockSkuRequestProps: IncomingRestockSkuRequestProps = {
      sku,
      units,
      lotId,
    }
    return Result.makeSuccess(incomingRestockSkuRequestProps)
  }

  //
  //
  //
  private static validateInput(
    incomingRestockSkuRequestInput: IncomingRestockSkuRequestInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingRestockSkuRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      lotId: ValueValidators.validLotId(),
    })

    try {
      schema.parse(incomingRestockSkuRequestInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingRestockSkuRequestInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingRestockSkuRequestInput })
      return invalidArgsFailure
    }
  }
}
