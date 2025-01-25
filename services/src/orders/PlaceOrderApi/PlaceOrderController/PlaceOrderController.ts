import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { OrderError } from '../../errors/OrderError'
import { IPlaceOrderService } from '../PlaceOrderService/PlaceOrderService'
import { IncomingPlaceOrderRequest, IncomingPlaceOrderRequestInput } from '../model/IncomingPlaceOrderRequest'

export interface IPlaceOrderController {
  placeOrder: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

export class PlaceOrderController implements IPlaceOrderController {
  //
  //
  //
  constructor(private readonly placeOrderService: IPlaceOrderService) {
    this.placeOrder = this.placeOrder.bind(this)
  }

  //
  //
  //
  public async placeOrder(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    try {
      console.info('PlaceOrderController.placeOrder init:', { apiEvent })
      const incomingPlaceOrderRequest = this.parseValidateRequest(apiEvent.body)
      const placeOrderOutput = await this.placeOrderService.placeOrder(incomingPlaceOrderRequest)
      const apiResponse = HttpResponse.Accepted(placeOrderOutput)
      console.info('PlaceOrderController.placeOrder exit:', { apiResponse })
      return apiResponse
    } catch (error) {
      console.error('PlaceOrderController.placeOrder error:', { error })
      if (OrderError.hasName(error, OrderError.InvalidArgumentsError)) {
        return HttpResponse.BadRequestError()
      }

      return HttpResponse.InternalServerError()
    }
  }

  //
  //
  //
  private parseValidateRequest(bodyText: string): IncomingPlaceOrderRequest {
    try {
      console.info('PlaceOrderController.parseValidateRequest init:', { bodyText })
      const unverifiedRequest = JSON.parse(bodyText) as IncomingPlaceOrderRequestInput
      const incomingPlaceOrderRequest = IncomingPlaceOrderRequest.validateAndBuild(unverifiedRequest)
      console.info('PlaceOrderController.parseValidateRequest exit:', { incomingPlaceOrderRequest })
      return incomingPlaceOrderRequest
    } catch (error) {
      console.error('PlaceOrderController.parseValidateRequest error:', { error })
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }
}
