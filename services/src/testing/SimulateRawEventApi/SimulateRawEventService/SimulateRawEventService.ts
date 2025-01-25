import { TestingError } from '../../errors/TestingError'
import { IEsRaiseRawSimulatedEventClient } from '../EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { IncomingSimulateRawEventRequest } from '../model/IncomingSimulateRawEventRequest'
import { RawSimulatedEvent } from '../model/RawSimulatedEvent'

export interface ISimulateRawEventService {
  simulateRawEvent: (incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest) => Promise<object>
}

export class SimulateRawEventService implements ISimulateRawEventService {
  //
  //
  //
  constructor(private readonly ddbRawSimulatedEventClient: IEsRaiseRawSimulatedEventClient) {}

  //
  //
  //
  public async simulateRawEvent(incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest): Promise<object> {
    try {
      console.info('SimulateRawEventService.simulateRawEvent init:', { incomingSimulateRawEventRequest })
      await this.raiseRawSimulatedEvent(incomingSimulateRawEventRequest)
      console.info('SimulateRawEventService.simulateRawEvent exit:', { incomingSimulateRawEventRequest })
      return incomingSimulateRawEventRequest
    } catch (error) {
      console.error('SimulateRawEventService.simulateRawEvent error:', { error })
      if (TestingError.hasName(error, TestingError.InvalidEventRaiseOperationError_Redundant)) {
        return incomingSimulateRawEventRequest
      }
      throw error
    }
  }

  //
  //
  //
  private async raiseRawSimulatedEvent(incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest) {
    const rawSimulatedEvent = RawSimulatedEvent.validateAndBuild(incomingSimulateRawEventRequest)
    await this.ddbRawSimulatedEventClient.raiseRawSimulatedEvent(rawSimulatedEvent)
  }
}
