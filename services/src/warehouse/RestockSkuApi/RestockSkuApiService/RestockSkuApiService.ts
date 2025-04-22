import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { IEsRaiseSkuRestockedEventClient } from '../EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { SkuRestockedEvent, SkuRestockedEventInput } from '../model/SkuRestockedEvent'

export interface IRestockSkuApiService {
  restockSku: (
    incomingRestockSkuRequest: IncomingRestockSkuRequest,
  ) => Promise<Success<RestockSkuApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export type RestockSkuApiServiceOutput = TypeUtilsPretty<IncomingRestockSkuRequest>

export class RestockSkuApiService implements IRestockSkuApiService {
  //
  //
  //
  constructor(private readonly esRaiseSkuRestockedEventClient: IEsRaiseSkuRestockedEventClient) {}

  //
  //
  //
  public async restockSku(
    incomingRestockSkuRequest: IncomingRestockSkuRequest,
  ): Promise<Success<RestockSkuApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'RestockSkuApiService.restockSku'
    console.info(`${logContext} init:`, { incomingRestockSkuRequest })

    const inputValidationResult = this.validateInput(incomingRestockSkuRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingRestockSkuRequest })
      return inputValidationResult
    }

    const raiseEventResult = await this.raiseSkuRestockedEvent(incomingRestockSkuRequest)
    if (Result.isSuccess(raiseEventResult)) {
      const serviceOutput: RestockSkuApiServiceOutput = { ...incomingRestockSkuRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logContext} exit success:`, { serviceOutputResult, incomingRestockSkuRequest })
      return serviceOutputResult
    }

    if (Result.isFailureOfKind(raiseEventResult, 'DuplicateEventRaisedError')) {
      const serviceOutput: RestockSkuApiServiceOutput = { ...incomingRestockSkuRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logContext} exit success: from-error:`, {
        raiseEventResult,
        serviceOutputResult,
        incomingRestockSkuRequest,
      })
      return serviceOutputResult
    }

    console.error(`${logContext} exit failure:`, { raiseEventResult, incomingRestockSkuRequest })
    return raiseEventResult
  }

  //
  //
  //
  private validateInput(
    incomingRestockSkuRequest: IncomingRestockSkuRequest,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingRestockSkuRequest.validateInput'
    console.info(`${logContext} init:`, { incomingRestockSkuRequest })

    if (incomingRestockSkuRequest instanceof IncomingRestockSkuRequest === false) {
      const errorMessage = `Expected IncomingRestockSkuRequest but got ${incomingRestockSkuRequest}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingRestockSkuRequest })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private async raiseSkuRestockedEvent(
    incomingRestockSkuRequest: IncomingRestockSkuRequest,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'RestockSkuApiService.raiseSkuRestockedEvent'
    console.info(`${logContext} init:`, { incomingRestockSkuRequest })

    const { sku, units, lotId } = incomingRestockSkuRequest
    const skuRestockedEventInput: SkuRestockedEventInput = { sku, units, lotId }
    const skuRestockedEventResult = SkuRestockedEvent.validateAndBuild(skuRestockedEventInput)
    if (Result.isFailure(skuRestockedEventResult)) {
      console.error(`${logContext} exit failure:`, { skuRestockedEventResult, skuRestockedEventInput })
      return skuRestockedEventResult
    }

    const skuRestockedEvent = skuRestockedEventResult.value
    const raiseEventResult = await this.esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(skuRestockedEvent)
    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, skuRestockedEvent })
      : console.info(`${logContext} exit success:`, { raiseEventResult, skuRestockedEvent })

    return raiseEventResult
  }
}
