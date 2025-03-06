import { Failure, Result, Success } from '../../errors/Result'
import { IEsRaiseOrderPlacedEventClient } from '../EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'

export interface IPlaceOrderApiService {
  placeOrder: (
    incomingPlaceOrderRequest: IncomingPlaceOrderRequest,
  ) => Promise<Success<IncomingPlaceOrderRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export type PlaceOrderServiceOutput = IncomingPlaceOrderRequest

export class PlaceOrderApiService implements IPlaceOrderApiService {
  //
  //
  //
  constructor(private readonly ddbOrderPlacedEventClient: IEsRaiseOrderPlacedEventClient) {}

  //
  //
  //
  public async placeOrder(
    incomingPlaceOrderRequest: IncomingPlaceOrderRequest,
  ): Promise<Success<IncomingPlaceOrderRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'PlaceOrderApiService.placeOrder'
    console.info(`${logContext} init:`, { incomingPlaceOrderRequest })

    const incomingRequestValidationResult = this.validateIncomingPlaceOrderRequest(incomingPlaceOrderRequest)
    if (Result.isFailure(incomingRequestValidationResult)) {
      console.error(`${logContext} exit failure:`, { incomingRequestValidationResult, incomingPlaceOrderRequest })
      return incomingRequestValidationResult
    }

    const raiseEventResult = await this.raiseOrderPlacedEvent(incomingPlaceOrderRequest)
    if (Result.isSuccess(raiseEventResult) || Result.isFailureOfKind(raiseEventResult, 'DuplicateEventRaisedError')) {
      const serviceOutput: PlaceOrderServiceOutput = { ...incomingPlaceOrderRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logContext} exit success:`, { serviceOutputResult, incomingPlaceOrderRequest })
      return serviceOutputResult
    }

    console.error(`${logContext} exit failure:`, { raiseEventResult, incomingPlaceOrderRequest })
    return raiseEventResult
  }

  //
  //
  //
  private validateIncomingPlaceOrderRequest(incomingPlaceOrderRequest: IncomingPlaceOrderRequest) {
    const logContext = 'PlaceOrderApiService.validateIncomingPlaceOrderRequest'
    console.info(`${logContext} init:`, { incomingPlaceOrderRequest })

    if (incomingPlaceOrderRequest instanceof IncomingPlaceOrderRequest === false) {
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', 'Invalid arguments error', false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingPlaceOrderRequest })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private async raiseOrderPlacedEvent(
    incomingPlaceOrderRequest: IncomingPlaceOrderRequest,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'PlaceOrderApiService.raiseOrderPlacedEvent'
    console.info(`${logContext} init:`, { incomingPlaceOrderRequest })

    const orderPlacedEventResult = OrderPlacedEvent.validateAndBuild(incomingPlaceOrderRequest)
    if (Result.isFailure(orderPlacedEventResult)) {
      console.error(`${logContext} exit failure:`, { orderPlacedEventResult, incomingPlaceOrderRequest })
      return orderPlacedEventResult
    }

    const orderPlacedEvent = orderPlacedEventResult.value
    const raiseEventResult = await this.ddbOrderPlacedEventClient.raiseOrderPlacedEvent(orderPlacedEvent)
    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, incomingPlaceOrderRequest })
      : console.info(`${logContext} exit success:`, { raiseEventResult, incomingPlaceOrderRequest })

    return raiseEventResult
  }
}
