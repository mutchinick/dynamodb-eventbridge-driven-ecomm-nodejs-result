import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { OrderError } from '../../errors/OrderError'
import { IPlaceOrderApiService } from '../PlaceOrderApiService/PlaceOrderApiService'
import { IncomingPlaceOrderRequest, IncomingPlaceOrderRequestInput } from '../model/IncomingPlaceOrderRequest'

export interface IPlaceOrderApiController {
  placeOrder: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

export class PlaceOrderApiController implements IPlaceOrderApiController {
  //
  //
  //
  constructor(private readonly placeOrderApiService: IPlaceOrderApiService) {
    this.placeOrder = this.placeOrder.bind(this)
  }

  //
  //
  //
  public async placeOrder(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    try {
      console.info('PlaceOrderApiController.placeOrder init:', { apiEvent })
      const incomingPlaceOrderRequest = this.parseValidateRequest(apiEvent.body)
      const placeOrderOutput = await this.placeOrderApiService.placeOrder(incomingPlaceOrderRequest)
      const apiResponse = HttpResponse.Accepted(placeOrderOutput)
      console.info('PlaceOrderApiController.placeOrder exit:', { apiResponse })
      return apiResponse
    } catch (error) {
      console.error('PlaceOrderApiController.placeOrder error:', { error })
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
      console.info('PlaceOrderApiController.parseValidateRequest init:', { bodyText })
      const unverifiedRequest = JSON.parse(bodyText) as IncomingPlaceOrderRequestInput
      const incomingPlaceOrderRequest = IncomingPlaceOrderRequest.validateAndBuild(unverifiedRequest)
      console.info('PlaceOrderApiController.parseValidateRequest exit:', { incomingPlaceOrderRequest })
      return incomingPlaceOrderRequest
    } catch (error) {
      console.error('PlaceOrderApiController.parseValidateRequest error:', { error })
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }
}
