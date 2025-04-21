import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { Failure, Result, Success } from '../../errors/Result'
import { ISimulateRawEventApiService } from '../SimulateRawEventApiService/SimulateRawEventApiService'
import {
  IncomingSimulateRawEventRequest,
  IncomingSimulateRawEventRequestInput,
} from '../model/IncomingSimulateRawEventRequest'

export interface ISimulateRawEventApiController {
  simulateRawEvent: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

export class SimulateRawEventApiController implements ISimulateRawEventApiController {
  //
  //
  //
  constructor(private readonly simulateRawEventApiService: ISimulateRawEventApiService) {
    this.simulateRawEvent = this.simulateRawEvent.bind(this)
  }

  //
  //
  //
  public async simulateRawEvent(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'SimulateRawEventApiController.simulateRawEvent'
    console.info(`${logContext} init:`, { apiEvent })

    const simulateRawEventResult = await this.simulateRawEventSafe(apiEvent)
    if (Result.isSuccess(simulateRawEventResult)) {
      const simulateRawEventOutput = simulateRawEventResult.value
      const successResponse = HttpResponse.Accepted(simulateRawEventOutput)
      console.info(`${logContext} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(simulateRawEventResult, 'InvalidArgumentsError')) {
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
  private async simulateRawEventSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<
    Success<IncomingSimulateRawEventRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>
  > {
    const logContext = 'SimulateRawEventApiController.simulateRawEventSafe'
    console.info(`${logContext} init:`, { apiEvent })

    const parseInputRequestResult = this.parseInputRequest(apiEvent)
    if (Result.isFailure(parseInputRequestResult)) {
      console.error(`${logContext} failure exit:`, { parseInputRequestResult, apiEvent })
      return parseInputRequestResult
    }

    const unverifiedRequest = parseInputRequestResult.value as IncomingSimulateRawEventRequestInput
    const incomingSimulateRawEventRequestResult = IncomingSimulateRawEventRequest.validateAndBuild(unverifiedRequest)
    if (Result.isFailure(incomingSimulateRawEventRequestResult)) {
      console.error(`${logContext} failure exit:`, { incomingSimulateRawEventRequestResult, unverifiedRequest })
      return incomingSimulateRawEventRequestResult
    }

    const incomingSimulateRawEventRequest = incomingSimulateRawEventRequestResult.value
    const simulateRawEventResult = await this.simulateRawEventApiService.simulateRawEvent(
      incomingSimulateRawEventRequest,
    )
    Result.isFailure(simulateRawEventResult)
      ? console.error(`${logContext} exit failure:`, { simulateRawEventResult, incomingSimulateRawEventRequest })
      : console.info(`${logContext} exit success:`, { simulateRawEventResult, incomingSimulateRawEventRequest })

    return simulateRawEventResult
  }

  //
  //
  //
  private parseInputRequest(apiEvent: APIGatewayProxyEventV2): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logContext = 'SimulateRawEventApiController.parseInputRequest'

    try {
      const unverifiedRequest = JSON.parse(apiEvent.body)
      return Result.makeSuccess<unknown>(unverifiedRequest)
    } catch (error) {
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, apiEvent })
      return invalidArgsFailure
    }
  }
}
