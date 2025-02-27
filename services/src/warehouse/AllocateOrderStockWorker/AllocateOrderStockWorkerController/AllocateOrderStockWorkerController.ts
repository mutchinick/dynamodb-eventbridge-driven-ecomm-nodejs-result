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
    const logContext = 'AllocateOrderStockWorkerController.allocateOrdersStock'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }
    for (const record of sqsEvent.Records) {
      // If the failure is transient then we add it to the batch errors to requeue and retry
      // If the failure is non-transient then we ignore it to remove it from the queue
      const allocateOrderStockResult = await this.allocateSingleOrder(record)
      if (Result.isFailureTransient(allocateOrderStockResult)) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }

    console.info(`${logContext} exit success:`, { sqsBatchResponse })
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
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerController.allocateSingleOrder'
    console.info(`${logContext} init:`, { sqsRecord })

    const eventBridgeEventResult = this.parseEventBrideEvent(sqsRecord)
    if (Result.isFailure(eventBridgeEventResult)) {
      console.error(`${logContext} exit failure:`, { eventBridgeEventResult, sqsRecord })
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
  private parseEventBrideEvent(sqsRecord: SQSRecord): Success<unknown> | Failure<'InvalidArgumentsError'> {
    try {
      const eventBridgeEvent = JSON.parse(sqsRecord.body)
      return Result.makeSuccess<unknown>(eventBridgeEvent)
    } catch (error) {
      const logContext = 'AllocateOrderStockWorkerController.parseEventBrideEvent'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, sqsRecord })
      return invalidArgsFailure
    }
  }
}
