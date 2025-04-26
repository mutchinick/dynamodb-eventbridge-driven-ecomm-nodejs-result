import { Failure, Result, Success } from '../../errors/Result'
import { IEsRaiseRawSimulatedEventClient } from '../EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { IncomingSimulateRawEventRequest } from '../model/IncomingSimulateRawEventRequest'
import { RawSimulatedEvent, RawSimulatedEventInput } from '../model/RawSimulatedEvent'

export interface ISimulateRawEventApiService {
  simulateRawEvent: (
    incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest,
  ) => Promise<
    Success<IncomingSimulateRawEventRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>
  >
}

export type SimulateRawEventApiServiceOutput = IncomingSimulateRawEventRequest

/**
 *
 */
export class SimulateRawEventApiService implements ISimulateRawEventApiService {
  /**
   *
   */
  constructor(private readonly esRaiseRawSimulatedEventClient: IEsRaiseRawSimulatedEventClient) {}

  /**
   *
   */
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
    if (Result.isSuccess(raiseEventResult)) {
      const serviceOutput: SimulateRawEventApiServiceOutput = { ...incomingSimulateRawEventRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logContext} exit success:`, { serviceOutputResult, incomingSimulateRawEventRequest })
      return serviceOutputResult
    }

    if (Result.isFailureOfKind(raiseEventResult, 'DuplicateEventRaisedError')) {
      const serviceOutput: SimulateRawEventApiServiceOutput = { ...incomingSimulateRawEventRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logContext} exit success: from-error:`, {
        raiseEventResult,
        serviceOutputResult,
        incomingSimulateRawEventRequest,
      })
      return serviceOutputResult
    }

    console.error(`${logContext} exit failure:`, { raiseEventResult, incomingSimulateRawEventRequest })
    return raiseEventResult
  }

  /**
   *
   */
  private validateInput(
    incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
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

  /**
   *
   */
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

    const { pk, sk, eventName, eventData, createdAt, updatedAt } = incomingSimulateRawEventRequest
    const rawSimulatedEventInput: RawSimulatedEventInput = { pk, sk, eventName, eventData, createdAt, updatedAt }
    const rawSimulatedEventResult = RawSimulatedEvent.validateAndBuild(rawSimulatedEventInput)
    if (Result.isFailure(rawSimulatedEventResult)) {
      console.error(`${logContext} exit failure:`, { rawSimulatedEventResult, rawSimulatedEventInput })
      return rawSimulatedEventResult
    }

    const rawSimulatedEvent = rawSimulatedEventResult.value
    const raiseEventResult = await this.esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(rawSimulatedEvent)
    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, rawSimulatedEvent })
      : console.info(`${logContext} exit success:`, { raiseEventResult, rawSimulatedEvent })

    return raiseEventResult
  }
}
