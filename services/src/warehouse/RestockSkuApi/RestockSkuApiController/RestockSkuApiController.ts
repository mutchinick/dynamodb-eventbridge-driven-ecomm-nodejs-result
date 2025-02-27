import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { Failure, Result, Success } from '../../errors/Result'
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
    const logContext = 'RestockSkuApiController.restockSku'
    console.info(`${logContext} init:`, { apiEvent })

    const restockSkuResult = await this.restockSkuSafe(apiEvent)
    if (Result.isSuccess(restockSkuResult)) {
      const restockSkuOutput = restockSkuResult.value
      const apiResponse = HttpResponse.Accepted(restockSkuOutput)
      console.info(`${logContext} exit success:`, { apiResponse, apiEvent })
      return apiResponse
    }

    if (Result.isFailureOfKind(restockSkuResult, 'InvalidArgumentsError')) {
      console.error(`${logContext} failure exit:`, { apiEvent })
      return HttpResponse.BadRequestError()
    }

    console.error(`${logContext} failure exit:`, { apiEvent })
    return HttpResponse.InternalServerError()
  }

  //
  //
  //
  private async restockSkuSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<Success<IncomingRestockSkuRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'RestockSkuApiController.restockSkuSafe'
    console.info(`${logContext} init:`, { apiEvent })

    const parseRequestBodyResult = this.parseValidateRequestBody(apiEvent)
    if (Result.isFailure(parseRequestBodyResult)) {
      console.error(`${logContext} failure exit:`, { parseRequestResult: parseRequestBodyResult, apiEvent })
      return parseRequestBodyResult
    }

    const unverifiedRequest = parseRequestBodyResult.value as IncomingRestockSkuRequestInput
    const incomingRestockSkuRequestResult = IncomingRestockSkuRequest.validateAndBuild(unverifiedRequest)
    if (Result.isFailure(incomingRestockSkuRequestResult)) {
      console.error(`${logContext} failure exit:`, { incomingRestockSkuRequestResult, unverifiedRequest })
      return incomingRestockSkuRequestResult
    }

    const incomingRestockSkuRequest = incomingRestockSkuRequestResult.value
    const restockSkuResult = await this.restockSkuApiService.restockSku(incomingRestockSkuRequest)
    Result.isFailure(restockSkuResult)
      ? console.error(`${logContext} exit failure:`, { restockSkuResult, incomingRestockSkuRequest })
      : console.info(`${logContext} exit success:`, { restockSkuResult, incomingRestockSkuRequest })

    return restockSkuResult
  }

  //
  //
  //
  private parseValidateRequestBody(
    apiEvent: APIGatewayProxyEventV2,
  ): Success<unknown> | Failure<'InvalidArgumentsError'> {
    try {
      const unverifiedRequest = JSON.parse(apiEvent.body)
      return Result.makeSuccess<unknown>(unverifiedRequest)
    } catch (error) {
      const logContext = 'RestockSkuApiController.parseValidateRequestBody'
      console.error(`${logContext} error caught:`, { error, apiEvent })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, apiEvent })
      return invalidArgsFailure
    }
  }
}
