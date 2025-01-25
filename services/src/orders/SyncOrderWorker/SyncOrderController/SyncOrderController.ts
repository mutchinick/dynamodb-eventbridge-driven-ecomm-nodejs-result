import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { OrderError } from '../../errors/OrderError'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { ISyncOrderService } from '../SyncOrderService/SyncOrderService'

export interface ISyncOrderController {
  syncOrders: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

export class SyncOrderController implements ISyncOrderController {
  //
  //
  //
  constructor(private readonly syncOrderService: ISyncOrderService) {
    this.syncOrders = this.syncOrders.bind(this)
  }

  //
  //
  //
  public async syncOrders(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    console.info('SyncOrderController.syncOrders init:', { sqsEvent })
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
    console.info('SyncOrderController.syncOrders exit:', { sqsBatchResponse })
    return sqsBatchResponse
  }

  //
  //
  //
  private async syncOrder(sqsRecord: SQSRecord) {
    try {
      console.info('SyncOrderController.syncOrder init:', { sqsRecord })
      const incomingOrderEvent = this.parseValidateEvent(sqsRecord.body)
      await this.syncOrderService.syncOrder(incomingOrderEvent)
      console.info('SyncOrderController.syncOrder exit:', { incomingOrderEvent })
    } catch (error) {
      console.error('SyncOrderController.syncOrder error:', { error })
      throw error
    }
  }

  //
  //
  //
  private parseValidateEvent(bodyText: string): IncomingOrderEvent {
    try {
      console.info('SyncOrderController.parseValidateEvent init:', { bodyText })
      const eventBridgeEvent = JSON.parse(bodyText)
      const incomingOrderEvent = IncomingOrderEvent.validateAndBuild(eventBridgeEvent)
      console.info('SyncOrderController.parseValidateEvent exit:', { incomingOrderEvent })
      return incomingOrderEvent
    } catch (error) {
      console.error('SyncOrderController.parseValidateEvent error:', { error })
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }
}
