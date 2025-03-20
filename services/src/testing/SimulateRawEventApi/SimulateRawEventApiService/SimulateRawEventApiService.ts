import { Failure, Result, Success } from '../../errors/Result'
import { IEsRaiseRawSimulatedEventClient } from '../EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { IncomingSimulateRawEventRequest } from '../model/IncomingSimulateRawEventRequest'
import { RawSimulatedEvent } from '../model/RawSimulatedEvent'

export interface ISimulateRawEventApiService {
  simulateRawEvent: (
    incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest,
  ) => Promise<
    Success<IncomingSimulateRawEventRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>
  >
}

export type SimulateRawEventApiServiceOutput = IncomingSimulateRawEventRequest

export class SimulateRawEventApiService implements ISimulateRawEventApiService {
  //
  //
  //
  constructor(private readonly esRaiseRawSimulatedEventClient: IEsRaiseRawSimulatedEventClient) {}

  //
  //
  //
  public async simulateRawEvent(
    incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest,
  ): Promise<
    Success<IncomingSimulateRawEventRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>
  > {
    const logContext = 'SimulateRawEventApiService.simulateRawEvent'
    console.info(`${logContext} init:`, { incomingSimulateRawEventRequest })

    const inputValidationResult = this.validateInput(incomingSimulateRawEventRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingSimulateRawEventRequest })
      return inputValidationResult
    }

    const raiseEventResult = await this.raiseRawSimulatedEvent(incomingSimulateRawEventRequest)
    if (Result.isSuccess(raiseEventResult) || Result.isFailureOfKind(raiseEventResult, 'DuplicateEventRaisedError')) {
      const serviceOutput: SimulateRawEventApiServiceOutput = { ...incomingSimulateRawEventRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logContext} exit success:`, { serviceOutputResult, incomingSimulateRawEventRequest })
      return serviceOutputResult
    }

    console.error(`${logContext} exit failure:`, { raiseEventResult, incomingSimulateRawEventRequest })
    return raiseEventResult
  }

  //
  //
  //
  private validateInput(incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest) {
    const logContext = 'SimulateRawEventApiService.validateInput'
    console.info(`${logContext} init:`, { incomingSimulateRawEventRequest })

    if (incomingSimulateRawEventRequest instanceof IncomingSimulateRawEventRequest === false) {
      const errorMessage = `Expected IncomingSimulateRawEventRequest but got ${incomingSimulateRawEventRequest}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingSimulateRawEventRequest })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private async raiseRawSimulatedEvent(
    incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'SimulateRawEventApiService.raiseRawSimulatedEvent'
    console.info(`${logContext} init:`, { incomingSimulateRawEventRequest })

    const rawSimulatedEventResult = RawSimulatedEvent.validateAndBuild(incomingSimulateRawEventRequest)
    if (Result.isFailure(rawSimulatedEventResult)) {
      console.error(`${logContext} exit failure:`, { rawSimulatedEventResult, incomingSimulateRawEventRequest })
      return rawSimulatedEventResult
    }

    const rawSimulatedEvent = rawSimulatedEventResult.value
    const raiseEventResult = await this.esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(rawSimulatedEvent)
    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, incomingSimulateRawEventRequest })
      : console.info(`${logContext} exit success:`, { raiseEventResult, incomingSimulateRawEventRequest })

    return raiseEventResult
  }
}
