import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { IEsRaiseSkuRestockedEventClient } from '../EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'

export interface IRestockSkuApiService {
  restockSku: (
    incomingRestockSkuRequest: IncomingRestockSkuRequest,
  ) => Promise<Success<IncomingRestockSkuRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export type RestockSkuServiceOutput = TypeUtilsPretty<IncomingRestockSkuRequest>

export class RestockSkuApiService implements IRestockSkuApiService {
  //
  //
  //
  constructor(private readonly ddbSkuRestockedEventClient: IEsRaiseSkuRestockedEventClient) {}

  //
  //
  //
  public async restockSku(
    incomingRestockSkuRequest: IncomingRestockSkuRequest,
  ): Promise<Success<IncomingRestockSkuRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'RestockSkuApiService.restockSku'
    console.info(`${logContext} init:`, { incomingRestockSkuRequest })

    const raiseEventResult = await this.raiseSkuRestockedEvent(incomingRestockSkuRequest)
    if (Result.isSuccess(raiseEventResult) || Result.isFailureOfKind(raiseEventResult, 'DuplicateEventRaisedError')) {
      const serviceOutput: RestockSkuServiceOutput = { ...incomingRestockSkuRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logContext} exit success:`, { serviceOutputResult, incomingRestockSkuRequest })
      return serviceOutputResult
    }

    console.error(`${logContext} exit failure:`, { raiseEventResult, incomingRestockSkuRequest })
    return raiseEventResult
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

    const skuRestockedEventResult = SkuRestockedEvent.validateAndBuild(incomingRestockSkuRequest)
    if (Result.isFailure(skuRestockedEventResult)) {
      console.error(`${logContext} exit failure:`, { skuRestockedEventResult, incomingRestockSkuRequest })
      return skuRestockedEventResult
    }

    const skuRestockedEvent = skuRestockedEventResult.value
    const raiseEventResult = await this.ddbSkuRestockedEventClient.raiseSkuRestockedEvent(skuRestockedEvent)
    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, incomingRestockSkuRequest })
      : console.info(`${logContext} exit success:`, { raiseEventResult, incomingRestockSkuRequest })

    return raiseEventResult
  }
}
