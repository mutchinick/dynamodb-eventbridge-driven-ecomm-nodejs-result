import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { WarehouseError } from '../../errors/WarehouseError'
import { IRestockSkuApiService } from '../RestockSkuApiService/RestockSkuApiService'
import { IncomingRestockSkuRequest, IncomingRestockSkuRequestInput } from '../model/IncomingRestockSkuRequest'

export interface IRestockSkuApiController {
  restockSku: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

export class RestockSkuApiController implements IRestockSkuApiController {
  //
  //
  //
  constructor(private readonly restockSkuApiService: IRestockSkuApiService) {
    this.restockSku = this.restockSku.bind(this)
  }

  //
  //
  //
  public async restockSku(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    try {
      console.info('RestockSkuApiController.restockSku init:', { apiEvent })
      const incomingRestockSkuRequest = this.parseValidateRequest(apiEvent.body)
      const restockSkuOutput = await this.restockSkuApiService.restockSku(incomingRestockSkuRequest)
      const apiResponse = HttpResponse.Accepted(restockSkuOutput)
      console.info('RestockSkuApiController.restockSku exit:', { apiResponse })
      return apiResponse
    } catch (error) {
      console.error('RestockSkuApiController.restockSku error:', { error })
      if (WarehouseError.hasName(error, WarehouseError.InvalidArgumentsError)) {
        return HttpResponse.BadRequestError()
      }

      return HttpResponse.InternalServerError()
    }
  }

  //
  //
  //
  private parseValidateRequest(bodyText: string): IncomingRestockSkuRequest {
    try {
      console.info('RestockSkuApiController.parseValidateRequest init:', { bodyText })
      const unverifiedRequest = JSON.parse(bodyText) as IncomingRestockSkuRequestInput
      const incomingRestockSkuRequest = IncomingRestockSkuRequest.validateAndBuild(unverifiedRequest)
      console.info('RestockSkuApiController.parseValidateRequest exit:', { incomingRestockSkuRequest })
      return incomingRestockSkuRequest
    } catch (error) {
      console.error('RestockSkuApiController.parseValidateRequest error:', { error })
      WarehouseError.addName(error, WarehouseError.InvalidArgumentsError)
      WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      throw error
    }
  }
}
