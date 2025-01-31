import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { WarehouseError } from '../../errors/WarehouseError'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { IAllocateOrderStockWorkerService } from '../AllocateOrderStockWorkerService/AllocateOrderStockWorkerService'

export interface IAllocateOrderStockWorkerController {
  allocateOrdersStock: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

export class AllocateOrderStockWorkerController implements IAllocateOrderStockWorkerController {
  //
  //
  //
  constructor(private readonly allocateOrderStockWorkerService: IAllocateOrderStockWorkerService) {
    this.allocateOrdersStock = this.allocateOrdersStock.bind(this)
  }

  //
  //
  //
  public async allocateOrdersStock(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    console.info('AllocateOrderStockWorkerController.allocateOrderStock init:', { sqsEvent })
    const batchItemFailures: SQSBatchItemFailure[] = []
    for (const record of sqsEvent.Records) {
      try {
        await this.allocateOrderStock(record)
      } catch (error) {
        if (WarehouseError.doNotRetry(error)) {
          continue
        }
        batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }
    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures }
    console.info('AllocateOrderStockWorkerController.allocateOrderStock exit:', { sqsBatchResponse })
    return sqsBatchResponse
  }

  //
  //
  //
  private async allocateOrderStock(sqsRecord: SQSRecord) {
    try {
      console.info('AllocateOrderStockWorkerController.allocateOrderStock init:', { sqsRecord })
      const incomingOrderCreatedEvent = this.parseValidateEvent(sqsRecord.body)
      await this.allocateOrderStockWorkerService.allocateOrderStock(incomingOrderCreatedEvent)
      console.info('AllocateOrderStockWorkerController.allocateOrderStock exit:', { incomingOrderCreatedEvent })
    } catch (error) {
      console.error('AllocateOrderStockWorkerController.allocateOrderStock error:', { error })
      throw error
    }
  }

  //
  //
  //
  private parseValidateEvent(bodyText: string): IncomingOrderCreatedEvent {
    try {
      console.info('AllocateOrderStockWorkerController.parseValidateEvent init:', { bodyText })
      const eventBridgeEvent = JSON.parse(bodyText)
      const incomingOrderCreatedEvent = IncomingOrderCreatedEvent.validateAndBuild(eventBridgeEvent)
      console.info('AllocateOrderStockWorkerController.parseValidateEvent exit:', { incomingOrderCreatedEvent })
      return incomingOrderCreatedEvent
    } catch (error) {
      console.error('AllocateOrderStockWorkerController.parseValidateEvent error:', { error })
      WarehouseError.addName(error, WarehouseError.InvalidArgumentsError)
      WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      throw error
    }
  }
}
