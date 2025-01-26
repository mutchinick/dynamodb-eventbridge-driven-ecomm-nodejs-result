import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { OrderError } from '../../errors/OrderError'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { ISyncOrderWorkerService } from '../SyncOrderWorkerService/SyncOrderWorkerService'

export interface ISyncOrderWorkerController {
  syncOrders: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

export class SyncOrderWorkerController implements ISyncOrderWorkerController {
  //
  //
  //
  constructor(private readonly syncOrderWorkerService: ISyncOrderWorkerService) {
    this.syncOrders = this.syncOrders.bind(this)
  }

  //
  //
  //
  public async syncOrders(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    console.info('SyncOrderWorkerController.syncOrders init:', { sqsEvent })
    const batchItemFailures: SQSBatchItemFailure[] = []
    for (const record of sqsEvent.Records) {
      try {
        await this.syncOrder(record)
      } catch (error) {
        if (OrderError.doNotRetry(error)) {
          continue
        }
        batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }
    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures }
    console.info('SyncOrderWorkerController.syncOrders exit:', { sqsBatchResponse })
    return sqsBatchResponse
  }

  //
  //
  //
  private async syncOrder(sqsRecord: SQSRecord) {
    try {
      console.info('SyncOrderWorkerController.syncOrder init:', { sqsRecord })
      const incomingOrderEvent = this.parseValidateEvent(sqsRecord.body)
      await this.syncOrderWorkerService.syncOrder(incomingOrderEvent)
      console.info('SyncOrderWorkerController.syncOrder exit:', { incomingOrderEvent })
    } catch (error) {
      console.error('SyncOrderWorkerController.syncOrder error:', { error })
      throw error
    }
  }

  //
  //
  //
  private parseValidateEvent(bodyText: string): IncomingOrderEvent {
    try {
      console.info('SyncOrderWorkerController.parseValidateEvent init:', { bodyText })
      const eventBridgeEvent = JSON.parse(bodyText)
      const incomingOrderEvent = IncomingOrderEvent.validateAndBuild(eventBridgeEvent)
      console.info('SyncOrderWorkerController.parseValidateEvent exit:', { incomingOrderEvent })
      return incomingOrderEvent
    } catch (error) {
      console.error('SyncOrderWorkerController.parseValidateEvent error:', { error })
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }
}
