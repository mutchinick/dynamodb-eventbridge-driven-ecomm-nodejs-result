import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../errors/Result'
import { IAllocateOrderStockWorkerService } from '../AllocateOrderStockWorkerService/AllocateOrderStockWorkerService'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'

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
    const logContext = 'AllocateOrderStockWorkerController.allocateSingleOrder'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }
    for (const record of sqsEvent.Records) {
      const allocateOrderStockResult = await this.allocateSingleOrder(record)
      // If the failure is transient then we add it to the batch errors to re-queue and retry
      // If the failure is not transient then we ignore it to remove it from the queue
      if (Result.isFailure(allocateOrderStockResult) && allocateOrderStockResult.transient) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }
    console.info(`${logContext} exit:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  //
  //
  //
  private async allocateSingleOrder(
    sqsRecord: SQSRecord,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidEventRaiseOperationError_Redundant'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerController.allocateSingleOrder'
    console.info(`${logContext} init:`, { sqsRecord })

    const sqsRecordBody = sqsRecord.body
    const eventBridgeEventResult = this.parseEventBrideEventSafe(sqsRecordBody)
    if (Result.isFailure(eventBridgeEventResult)) {
      console.error(`${logContext} exit failure:`, { eventBridgeEventResult, sqsRecordBody })
      return eventBridgeEventResult
    }

    const eventBridgeEvent = eventBridgeEventResult.value
    const incomingOrderCreatedEventResult = IncomingOrderCreatedEvent.validateAndBuild(eventBridgeEvent as never)
    if (Result.isFailure(incomingOrderCreatedEventResult)) {
      console.error(`${logContext} exit failure:`, { incomingOrderCreatedEventResult, eventBridgeEvent })
      return incomingOrderCreatedEventResult
    }

    const incomingOrderCreatedEvent = incomingOrderCreatedEventResult.value
    const allocateOrderStockResult =
      await this.allocateOrderStockWorkerService.allocateOrderStock(incomingOrderCreatedEvent)

    Result.isSuccess(allocateOrderStockResult)
      ? console.info(`${logContext} exit success:`, { allocateOrderStockResult })
      : console.error(`${logContext} exit failure:`, { allocateOrderStockResult, incomingOrderCreatedEvent })

    return allocateOrderStockResult
  }

  //
  //
  //
  private parseEventBrideEventSafe(eventBodyText: string): Success<unknown> | Failure<'InvalidArgumentsError'> {
    try {
      const eventBridgeEvent = JSON.parse(eventBodyText)
      return Result.makeSuccess(eventBridgeEvent) as Success<unknown>
    } catch (error) {
      const logContext = 'AllocateOrderStockWorkerController.parseEventBrideEventSafe'
      console.error(`${logContext} error:`, { error })
      const invalidArgsResult = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsResult, eventBodyText })
      return invalidArgsResult
    }
  }
}
