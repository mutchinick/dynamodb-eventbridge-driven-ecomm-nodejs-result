import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { WarehouseError } from '../../errors/WarehouseError'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { IRestockSkuWorkerService } from '../RestockSkuWorkerService/RestockSkuWorkerService'

export interface IRestockSkuWorkerController {
  restockSkus: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

export class RestockSkuWorkerController implements IRestockSkuWorkerController {
  //
  //
  //
  constructor(private readonly restockSkuWorkerService: IRestockSkuWorkerService) {
    this.restockSkus = this.restockSkus.bind(this)
  }

  //
  //
  //
  public async restockSkus(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    console.info('RestockSkuWorkerController.restockSkus init:', { sqsEvent })
    const batchItemFailures: SQSBatchItemFailure[] = []
    for (const record of sqsEvent.Records) {
      try {
        await this.restockSku(record)
      } catch (error) {
        if (WarehouseError.doNotRetry(error)) {
          continue
        }
        batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }
    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures }
    console.info('RestockSkuWorkerController.restockSkus exit:', { sqsBatchResponse })
    return sqsBatchResponse
  }

  //
  //
  //
  private async restockSku(sqsRecord: SQSRecord) {
    try {
      console.info('RestockSkuWorkerController.restockSku init:', { sqsRecord })
      const incomingSkuRestockedEvent = this.parseValidateEvent(sqsRecord.body)
      await this.restockSkuWorkerService.restockSku(incomingSkuRestockedEvent)
      console.info('RestockSkuWorkerController.restockSku exit:', { incomingSkuRestockedEvent })
    } catch (error) {
      console.error('RestockSkuWorkerController.restockSku error:', { error })
      throw error
    }
  }

  //
  //
  //
  private parseValidateEvent(bodyText: string): IncomingSkuRestockedEvent {
    try {
      console.info('RestockSkuWorkerController.parseValidateEvent init:', { bodyText })
      const eventBridgeEvent = JSON.parse(bodyText)
      const incomingSkuRestockedEvent = IncomingSkuRestockedEvent.validateAndBuild(eventBridgeEvent)
      console.info('RestockSkuWorkerController.parseValidateEvent exit:', { incomingSkuRestockedEvent })
      return incomingSkuRestockedEvent
    } catch (error) {
      console.error('RestockSkuWorkerController.parseValidateEvent error:', { error })
      WarehouseError.addName(error, WarehouseError.InvalidArgumentsError)
      WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      throw error
    }
  }
}
