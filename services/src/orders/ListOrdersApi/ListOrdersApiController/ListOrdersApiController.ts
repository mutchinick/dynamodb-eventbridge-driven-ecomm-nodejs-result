import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { Failure, Result, Success } from '../../errors/Result'
import { IListOrdersApiService, ListOrdersApiServiceOutput } from '../ListOrdersApiService/ListOrdersApiService'
import { IncomingListOrdersRequest, IncomingListOrdersRequestInput } from '../model/IncomingListOrdersRequest'

export interface IListOrdersApiController {
  listOrders: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

export class ListOrdersApiController implements IListOrdersApiController {
  //
  //
  //
  constructor(private readonly listOrdersApiService: IListOrdersApiService) {
    this.listOrders = this.listOrders.bind(this)
  }

  //
  //
  //
  public async listOrders(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'ListOrdersApiController.listOrders'
    console.info(`${logContext} init:`, { apiEvent })

    const listOrdersResult = await this.listOrdersSafe(apiEvent)
    if (Result.isSuccess(listOrdersResult)) {
      const listOrdersOutput = listOrdersResult.value
      const successResponse = HttpResponse.OK(listOrdersOutput)
      console.info(`${logContext} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(listOrdersResult, 'InvalidArgumentsError')) {
      console.error(`${logContext} failure exit:`, { apiEvent })
      return HttpResponse.BadRequestError()
    }

    console.error(`${logContext} failure exit:`, { apiEvent })
    return HttpResponse.InternalServerError()
  }

  //
  //
  //
  private async listOrdersSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<Success<ListOrdersApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'ListOrdersApiController.listOrdersSafe'
    console.info(`${logContext} init:`, { apiEvent })

    const parseRequestBodyResult = this.parseValidateRequestBody(apiEvent)
    if (Result.isFailure(parseRequestBodyResult)) {
      console.error(`${logContext} failure exit:`, { parseRequestResult: parseRequestBodyResult, apiEvent })
      return parseRequestBodyResult
    }

    const unverifiedRequest = parseRequestBodyResult.value as IncomingListOrdersRequestInput
    const incomingListOrdersRequestResult = IncomingListOrdersRequest.validateAndBuild(unverifiedRequest)
    if (Result.isFailure(incomingListOrdersRequestResult)) {
      console.error(`${logContext} failure exit:`, { incomingListOrdersRequestResult, unverifiedRequest })
      return incomingListOrdersRequestResult
    }

    const incomingListOrdersRequest = incomingListOrdersRequestResult.value
    const listOrdersResult = await this.listOrdersApiService.listOrders(incomingListOrdersRequest)
    Result.isFailure(listOrdersResult)
      ? console.error(`${logContext} exit failure:`, { listOrdersResult, incomingListOrdersRequest })
      : console.info(`${logContext} exit success:`, { listOrdersResult, incomingListOrdersRequest })

    return listOrdersResult
  }

  //
  //
  //
  private parseValidateRequestBody(
    apiEvent: APIGatewayProxyEventV2,
  ): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListOrdersApiController.parseValidateRequestBody'

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
