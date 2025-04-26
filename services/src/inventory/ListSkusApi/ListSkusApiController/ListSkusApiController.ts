import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { Failure, Result, Success } from '../../errors/Result'
import { IListSkusApiService, ListSkusApiServiceOutput } from '../ListSkusApiService/ListSkusApiService'
import { IncomingListSkusRequest, IncomingListSkusRequestInput } from '../model/IncomingListSkusRequest'

export interface IListSkusApiController {
  listSkus: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class ListSkusApiController implements IListSkusApiController {
  /**
   *
   */
  constructor(private readonly listSkusApiService: IListSkusApiService) {
    this.listSkus = this.listSkus.bind(this)
  }

  /**
   *
   */
  public async listSkus(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'ListSkusApiController.listSkus'
    console.info(`${logContext} init:`, { apiEvent })

    const listSkusResult = await this.listSkusSafe(apiEvent)
    if (Result.isSuccess(listSkusResult)) {
      const listSkusOutput = listSkusResult.value
      const successResponse = HttpResponse.OK(listSkusOutput)
      console.info(`${logContext} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(listSkusResult, 'InvalidArgumentsError')) {
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
  private async listSkusSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<Success<ListSkusApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'ListSkusApiController.listSkusSafe'
    console.info(`${logContext} init:`, { apiEvent })

    const parseInputRequestResult = this.parseInputRequest(apiEvent)
    if (Result.isFailure(parseInputRequestResult)) {
      console.error(`${logContext} failure exit:`, { parseInputRequestResult, apiEvent })
      return parseInputRequestResult
    }

    const unverifiedRequest = parseInputRequestResult.value as IncomingListSkusRequestInput
    const incomingListSkusRequestResult = IncomingListSkusRequest.validateAndBuild(unverifiedRequest)
    if (Result.isFailure(incomingListSkusRequestResult)) {
      console.error(`${logContext} failure exit:`, { incomingListSkusRequestResult, unverifiedRequest })
      return incomingListSkusRequestResult
    }

    const incomingListSkusRequest = incomingListSkusRequestResult.value
    const listSkusResult = await this.listSkusApiService.listSkus(incomingListSkusRequest)
    Result.isFailure(listSkusResult)
      ? console.error(`${logContext} exit failure:`, { listSkusResult, incomingListSkusRequest })
      : console.info(`${logContext} exit success:`, { listSkusResult, incomingListSkusRequest })

    return listSkusResult
  }

  /**
   *
   */
  private parseInputRequest(apiEvent: APIGatewayProxyEventV2): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListSkusApiController.parseInputRequest'

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
