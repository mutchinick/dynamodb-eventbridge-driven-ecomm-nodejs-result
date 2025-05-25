import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { Failure, Result, Success } from '../../errors/Result'
import {
  IListOrderPaymentsApiService,
  ListOrderPaymentsApiServiceOutput,
} from '../ListOrderPaymentsApiService/ListOrderPaymentsApiService'
import {
  IncomingListOrderPaymentsRequest,
  IncomingListOrderPaymentsRequestInput,
} from '../model/IncomingListOrderPaymentsRequest'

export interface IListOrderPaymentsApiController {
  listOrderPayments: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class ListOrderPaymentsApiController implements IListOrderPaymentsApiController {
  /**
   *
   */
  constructor(private readonly listOrderPaymentsApiService: IListOrderPaymentsApiService) {
    this.listOrderPayments = this.listOrderPayments.bind(this)
  }

  /**
   *
   */
  public async listOrderPayments(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'ListOrderPaymentsApiController.listOrderPayments'
    console.info(`${logContext} init:`, { apiEvent })

    const listOrderPaymentsResult = await this.listOrderPaymentsSafe(apiEvent)
    if (Result.isSuccess(listOrderPaymentsResult)) {
      const listOrderPaymentsOutput = listOrderPaymentsResult.value
      const successResponse = HttpResponse.OK(listOrderPaymentsOutput)
      console.info(`${logContext} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(listOrderPaymentsResult, 'InvalidArgumentsError')) {
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
  private async listOrderPaymentsSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<
    Success<ListOrderPaymentsApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>
  > {
    const logContext = 'ListOrderPaymentsApiController.listOrderPaymentsSafe'
    console.info(`${logContext} init:`, { apiEvent })

    const parseInputRequestResult = this.parseInputRequest(apiEvent)
    if (Result.isFailure(parseInputRequestResult)) {
      console.error(`${logContext} failure exit:`, { parseInputRequestResult, apiEvent })
      return parseInputRequestResult
    }

    const unverifiedRequest = parseInputRequestResult.value as IncomingListOrderPaymentsRequestInput
    const incomingListOrderPaymentsRequestResult = IncomingListOrderPaymentsRequest.validateAndBuild(unverifiedRequest)
    if (Result.isFailure(incomingListOrderPaymentsRequestResult)) {
      console.error(`${logContext} failure exit:`, { incomingListOrderPaymentsRequestResult, unverifiedRequest })
      return incomingListOrderPaymentsRequestResult
    }

    const incomingListOrderPaymentsRequest = incomingListOrderPaymentsRequestResult.value
    const listOrderPaymentsResult = await this.listOrderPaymentsApiService.listOrderPayments(
      incomingListOrderPaymentsRequest,
    )
    Result.isFailure(listOrderPaymentsResult)
      ? console.error(`${logContext} exit failure:`, { listOrderPaymentsResult, incomingListOrderPaymentsRequest })
      : console.info(`${logContext} exit success:`, { listOrderPaymentsResult, incomingListOrderPaymentsRequest })

    return listOrderPaymentsResult
  }

  /**
   *
   */
  private parseInputRequest(apiEvent: APIGatewayProxyEventV2): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListOrderPaymentsApiController.parseInputRequest'

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
