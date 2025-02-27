import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingRestockSkuRequestInput = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

type IncomingRestockSkuRequestProps = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

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
    try {
      this.validateInput(incomingRestockSkuRequestInput)
    } catch (error) {
      const logContext = 'IncomingRestockSkuRequest.buildProps'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingRestockSkuRequestInput })
      return invalidArgsFailure
    }

    const { sku, units, lotId } = incomingRestockSkuRequestInput
    const incomingRestockSkuRequestProps: IncomingRestockSkuRequestProps = { sku, units, lotId }
    return Result.makeSuccess(incomingRestockSkuRequestProps)
  }

  //
  //
  //
  private static validateInput(incomingRestockSkuRequestInput: IncomingRestockSkuRequestInput): void {
    z.object({
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      lotId: ValueValidators.validLotId(),
    }).parse(incomingRestockSkuRequestInput)
  }
}
