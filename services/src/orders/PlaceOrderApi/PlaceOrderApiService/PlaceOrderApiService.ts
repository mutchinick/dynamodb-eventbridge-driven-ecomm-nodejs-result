import { Failure, Result, Success } from '../../errors/Result'
import { IEsRaiseOrderPlacedEventClient } from '../EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { OrderPlacedEvent, OrderPlacedEventInput } from '../model/OrderPlacedEvent'

export interface IPlaceOrderApiService {
  placeOrder: (
    incomingPlaceOrderRequest: IncomingPlaceOrderRequest,
  ) => Promise<Success<IncomingPlaceOrderRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export type PlaceOrderApiServiceOutput = IncomingPlaceOrderRequest

export class PlaceOrderApiService implements IPlaceOrderApiService {
  //
  //
  //
  constructor(private readonly esRaiseOrderPlacedEventClient: IEsRaiseOrderPlacedEventClient) {}

  //
  //
  //
  public async placeOrder(
    incomingPlaceOrderRequest: IncomingPlaceOrderRequest,
  ): Promise<Success<IncomingPlaceOrderRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'PlaceOrderApiService.placeOrder'
    console.info(`${logContext} init:`, { incomingPlaceOrderRequest })

    const inputValidationResult = this.validateInput(incomingPlaceOrderRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingPlaceOrderRequest })
      return inputValidationResult
    }

    const raiseEventResult = await this.raiseOrderPlacedEvent(incomingPlaceOrderRequest)
    if (Result.isSuccess(raiseEventResult)) {
      const serviceOutput: PlaceOrderApiServiceOutput = { ...incomingPlaceOrderRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logContext} exit success:`, { serviceOutputResult, incomingPlaceOrderRequest })
      return serviceOutputResult
    }

    if (Result.isFailureOfKind(raiseEventResult, 'DuplicateEventRaisedError')) {
      const serviceOutput: PlaceOrderApiServiceOutput = { ...incomingPlaceOrderRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logContext} exit success: from-error:`, {
        raiseEventResult,
        serviceOutputResult,
        incomingPlaceOrderRequest,
      })
      return serviceOutputResult
    }

    console.error(`${logContext} exit failure:`, { raiseEventResult, incomingPlaceOrderRequest })
    return raiseEventResult
  }

  //
  //
  //
  private validateInput(incomingPlaceOrderRequest: IncomingPlaceOrderRequest) {
    const logContext = 'PlaceOrderApiService.validateInput'
    console.info(`${logContext} init:`, { incomingPlaceOrderRequest })

    if (incomingPlaceOrderRequest instanceof IncomingPlaceOrderRequest === false) {
      const errorMessage = `Expected IncomingPlaceOrderRequest but got ${incomingPlaceOrderRequest}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
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

    const { orderId, sku, units, price, userId } = incomingPlaceOrderRequest
    const orderPlacedEventInput: OrderPlacedEventInput = { orderId, sku, units, price, userId }
    const orderPlacedEventResult = OrderPlacedEvent.validateAndBuild(orderPlacedEventInput)
    if (Result.isFailure(orderPlacedEventResult)) {
      console.error(`${logContext} exit failure:`, { orderPlacedEventResult, orderPlacedEventInput })
      return orderPlacedEventResult
    }

    const orderPlacedEvent = orderPlacedEventResult.value
    const raiseEventResult = await this.esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(orderPlacedEvent)
    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, orderPlacedEvent })
      : console.info(`${logContext} exit success:`, { raiseEventResult, orderPlacedEvent })

    return raiseEventResult
  }
}
