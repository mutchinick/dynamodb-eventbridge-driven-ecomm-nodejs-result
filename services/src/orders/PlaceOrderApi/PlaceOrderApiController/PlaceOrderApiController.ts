import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { Failure, Result, Success } from '../../errors/Result'
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
    const logContext = 'PlaceOrderApiController.placeOrder'
    console.info(`${logContext} init:`, { apiEvent })

    const placeOrderResult = await this.placeOrderSafe(apiEvent)
    if (Result.isSuccess(placeOrderResult)) {
      const placeOrderOutput = placeOrderResult.value
      const successResponse = HttpResponse.Accepted(placeOrderOutput)
      console.info(`${logContext} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(placeOrderResult, 'InvalidArgumentsError')) {
      const badRequestError = HttpResponse.BadRequestError()
      console.error(`${logContext} failure exit:`, { badRequestError, apiEvent })
      return badRequestError
    }

    const internalServerError = HttpResponse.InternalServerError()
    console.error(`${logContext} failure exit:`, { internalServerError, apiEvent })
    return internalServerError
  }

  //
  //
  //
  private async placeOrderSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<Success<IncomingPlaceOrderRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'PlaceOrderApiController.placeOrderSafe'
    console.info(`${logContext} init:`, { apiEvent })

    const parseRequestBodyResult = this.parseValidateRequestBody(apiEvent)
    if (Result.isFailure(parseRequestBodyResult)) {
      console.error(`${logContext} failure exit:`, { parseRequestResult: parseRequestBodyResult, apiEvent })
      return parseRequestBodyResult
    }

    const unverifiedRequest = parseRequestBodyResult.value as IncomingPlaceOrderRequestInput
    const incomingPlaceOrderRequestResult = IncomingPlaceOrderRequest.validateAndBuild(unverifiedRequest)
    if (Result.isFailure(incomingPlaceOrderRequestResult)) {
      console.error(`${logContext} failure exit:`, { incomingPlaceOrderRequestResult, unverifiedRequest })
      return incomingPlaceOrderRequestResult
    }

    const incomingPlaceOrderRequest = incomingPlaceOrderRequestResult.value
    const placeOrderResult = await this.placeOrderApiService.placeOrder(incomingPlaceOrderRequest)
    Result.isFailure(placeOrderResult)
      ? console.error(`${logContext} exit failure:`, { placeOrderResult, incomingPlaceOrderRequest })
      : console.info(`${logContext} exit success:`, { placeOrderResult, incomingPlaceOrderRequest })

    return placeOrderResult
  }

  //
  //
  //
  private parseValidateRequestBody(
    apiEvent: APIGatewayProxyEventV2,
  ): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logContext = 'PlaceOrderApiController.parseValidateRequestBody'

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
