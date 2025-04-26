import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { Failure, Result, Success } from '../../errors/Result'
import { IRestockSkuApiService } from '../RestockSkuApiService/RestockSkuApiService'
import { IncomingRestockSkuRequest, IncomingRestockSkuRequestInput } from '../model/IncomingRestockSkuRequest'

export interface IRestockSkuApiController {
  restockSku: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class RestockSkuApiController implements IRestockSkuApiController {
  /**
   *
   */
  constructor(private readonly restockSkuApiService: IRestockSkuApiService) {
    this.restockSku = this.restockSku.bind(this)
  }

  /**
   *
   */
  public async restockSku(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'RestockSkuApiController.restockSku'
    console.info(`${logContext} init:`, { apiEvent })

    const restockSkuResult = await this.restockSkuSafe(apiEvent)
    if (Result.isSuccess(restockSkuResult)) {
      const restockSkuOutput = restockSkuResult.value
      const successResponse = HttpResponse.Accepted(restockSkuOutput)
      console.info(`${logContext} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(restockSkuResult, 'InvalidArgumentsError')) {
      const badRequestError = HttpResponse.BadRequestError()
      console.error(`${logContext} failure exit:`, { badRequestError, apiEvent })
      return badRequestError
    }

    const internalServerError = HttpResponse.InternalServerError()
    console.error(`${logContext} failure exit:`, { internalServerError, apiEvent })
    return internalServerError
  }

  /**
   *
   */
  private async restockSkuSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<Success<IncomingRestockSkuRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'RestockSkuApiController.restockSkuSafe'
    console.info(`${logContext} init:`, { apiEvent })

    const parseInputRequestResult = this.parseInputRequest(apiEvent)
    if (Result.isFailure(parseInputRequestResult)) {
      console.error(`${logContext} failure exit:`, { parseInputRequestResult, apiEvent })
      return parseInputRequestResult
    }

    const unverifiedRequest = parseInputRequestResult.value as IncomingRestockSkuRequestInput
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

  /**
   *
   */
  private parseInputRequest(apiEvent: APIGatewayProxyEventV2): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logContext = 'RestockSkuApiController.parseInputRequest'

    try {
      const unverifiedRequest = JSON.parse(apiEvent.body)
      return Result.makeSuccess<unknown>(unverifiedRequest)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, apiEvent })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, apiEvent })
      return invalidArgsFailure
    }
  }
}
