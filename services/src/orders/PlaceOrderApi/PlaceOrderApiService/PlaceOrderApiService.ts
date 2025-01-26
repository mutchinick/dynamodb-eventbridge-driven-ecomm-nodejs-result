import { OrderError } from '../../errors/OrderError'
import { IEsRaiseOrderPlacedEventClient } from '../EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'

export interface IPlaceOrderApiService {
  placeOrder: (incomingPlaceOrderRequest: IncomingPlaceOrderRequest) => Promise<ServiceOutput>
}

export interface ServiceOutput {
  orderId: string
}

export class PlaceOrderApiService implements IPlaceOrderApiService {
  //
  //
  //
  constructor(private readonly ddbOrderPlacedEventClient: IEsRaiseOrderPlacedEventClient) {}

  //
  //
  //
  public async placeOrder(incomingPlaceOrderRequest: IncomingPlaceOrderRequest): Promise<ServiceOutput> {
    try {
      console.info('PlaceOrderApiService.placeOrder init:', { incomingPlaceOrderRequest })
      await this.raiseOrderPlacedEvent(incomingPlaceOrderRequest)
      const serviceOutput = this.buildServiceOutput(incomingPlaceOrderRequest)
      console.info('PlaceOrderApiService.placeOrder exit:', { serviceOutput })
      return serviceOutput
    } catch (error) {
      console.error('PlaceOrderApiService.placeOrder error:', { error })
      if (OrderError.hasName(error, OrderError.InvalidEventRaiseOperationError_Redundant)) {
        const response = this.buildServiceOutput(incomingPlaceOrderRequest)
        return response
      }
      throw error
    }
  }

  //
  //
  //
  private async raiseOrderPlacedEvent(incomingPlaceOrderRequest: IncomingPlaceOrderRequest) {
    const orderPlacedEvent = OrderPlacedEvent.validateAndBuild(incomingPlaceOrderRequest)
    await this.ddbOrderPlacedEventClient.raiseOrderPlacedEvent(orderPlacedEvent)
  }

  //
  //
  //
  private buildServiceOutput(incomingPlaceOrderRequest: IncomingPlaceOrderRequest): ServiceOutput {
    return {
      orderId: incomingPlaceOrderRequest.orderId,
    }
  }
}
