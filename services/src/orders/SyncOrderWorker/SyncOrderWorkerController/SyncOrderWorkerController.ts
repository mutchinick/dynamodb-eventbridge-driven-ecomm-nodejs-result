import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../errors/Result'
import { IncomingOrderEvent, IncomingOrderEventInput } from '../model/IncomingOrderEvent'
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
    const logContext = 'SyncOrderWorkerController.syncOrders'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }
    for (const record of sqsEvent.Records) {
      // If the failure is transient then we add it to the batch errors to requeue and retry
      // If the failure is non-transient then we ignore it to remove it from the queue
      const restockSkuResult = await this.syncSingleOrderSafe(record)
      if (Result.isFailureTransient(restockSkuResult)) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }

    console.info(`${logContext} exit success:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  //
  //
  //
  private async syncSingleOrderSafe(sqsRecord: SQSRecord) {
    const logContext = 'SyncOrderWorkerController.syncSingleOrderSafe'
    console.info(`${logContext} init:`, { sqsRecord })

    const parseEventBodyResult = this.parseValidateEventBody(sqsRecord)
    if (Result.isFailure(parseEventBodyResult)) {
      console.error(`${logContext} failure exit:`, { parseEventBodyResult, sqsRecord })
      return parseEventBodyResult
    }

    const eventBridgeEvent = parseEventBodyResult.value as IncomingOrderEventInput
    const incomingRestockSkuEventResult = IncomingOrderEvent.validateAndBuild(eventBridgeEvent)
    if (Result.isFailure(incomingRestockSkuEventResult)) {
      console.error(`${logContext} failure exit:`, { incomingRestockSkuEventResult, eventBridgeEvent })
      return incomingRestockSkuEventResult
    }

    const incomingRestockSkuEvent = incomingRestockSkuEventResult.value
    const restockSkuResult = await this.syncOrderWorkerService.syncOrder(incomingRestockSkuEvent)
    Result.isFailure(restockSkuResult)
      ? console.error(`${logContext} exit failure:`, { restockSkuResult, incomingRestockSkuEvent })
      : console.info(`${logContext} exit success:`, { restockSkuResult, incomingRestockSkuEvent })

    return restockSkuResult
  }

  //
  //
  //
  private parseValidateEventBody(sqsRecord: SQSRecord): Success<unknown> | Failure<'InvalidArgumentsError'> {
    try {
      const eventBridgeEvent = JSON.parse(sqsRecord.body)
      return Result.makeSuccess<unknown>(eventBridgeEvent)
    } catch (error) {
      const logContext = 'SyncOrderWorkerController.parseValidateEventBody'
      console.error(`${logContext} error caught:`, { error, sqsRecord })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, sqsRecord })
      return invalidArgsFailure
    }
  }
}
