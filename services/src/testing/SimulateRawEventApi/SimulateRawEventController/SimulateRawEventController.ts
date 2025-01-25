import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { TestingError } from '../../errors/TestingError'
import { ISimulateRawEventService } from '../SimulateRawEventService/SimulateRawEventService'
import {
  IncomingSimulateRawEventRequest,
  IncomingSimulateRawEventRequestInput,
} from '../model/IncomingSimulateRawEventRequest'

export interface ISimulateRawEventController {
  simulateRawEvent: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

export class SimulateRawEventController implements ISimulateRawEventController {
  //
  //
  //
  constructor(private readonly simulateRawEventService: ISimulateRawEventService) {
    this.simulateRawEvent = this.simulateRawEvent.bind(this)
  }

  //
  //
  //
  public async simulateRawEvent(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    try {
      console.info('SimulateRawEventController.simulateRawEvent init:', { apiEvent })
      const incomingSimulateRawEventRequest = this.parseValidateRequest(apiEvent.body)
      const simulateRawEventOutput = await this.simulateRawEventService.simulateRawEvent(
        incomingSimulateRawEventRequest,
      )
      const apiResponse = HttpResponse.Accepted(simulateRawEventOutput)
      console.info('SimulateRawEventController.simulateRawEvent exit:', { apiResponse })
      return apiResponse
    } catch (error) {
      console.error('SimulateRawEventController.simulateRawEvent error:', { error })
      if (TestingError.hasName(error, TestingError.InvalidArgumentsError)) {
        return HttpResponse.BadRequestError()
      }

      return HttpResponse.InternalServerError()
    }
  }

  //
  //
  //
  private parseValidateRequest(bodyText: string): IncomingSimulateRawEventRequest {
    try {
      console.info('SimulateRawEventController.parseValidateRequest init:', { bodyText })
      const unverifiedRequest = JSON.parse(bodyText) as IncomingSimulateRawEventRequestInput
      const incomingSimulateRawEventRequest = IncomingSimulateRawEventRequest.validateAndBuild(unverifiedRequest)
      console.info('SimulateRawEventController.parseValidateRequest exit:', {
        incomingSimulateRawEventRequest,
      })
      return incomingSimulateRawEventRequest
    } catch (error) {
      console.error('SimulateRawEventController.parseValidateRequest error:', { error })
      TestingError.addName(error, TestingError.InvalidArgumentsError)
      TestingError.addName(error, TestingError.DoNotRetryError)
      throw error
    }
  }
}
