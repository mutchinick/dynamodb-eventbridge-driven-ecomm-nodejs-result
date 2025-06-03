import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../errors/Result'
import { ICompleteOrderPaymentAcceptedWorkerService } from '../CompleteOrderPaymentAcceptedWorkerService/CompleteOrderPaymentAcceptedWorkerService'
import {
  IncomingOrderPaymentAcceptedEvent,
  IncomingOrderPaymentAcceptedEventInput,
} from '../model/IncomingOrderPaymentAcceptedEvent'

export interface ICompleteOrderPaymentAcceptedWorkerController {
  completeOrders: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class CompleteOrderPaymentAcceptedWorkerController implements ICompleteOrderPaymentAcceptedWorkerController {
  /**
   *
   */
  constructor(private readonly completeOrderPaymentAcceptedWorkerService: ICompleteOrderPaymentAcceptedWorkerService) {
    this.completeOrders = this.completeOrders.bind(this)
  }

  /**
   *
   */
  public async completeOrders(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerController.completeOrders'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }

    if (!sqsEvent || !sqsEvent.Records) {
      const error = new Error(`Expected SQSEvent but got ${sqsEvent}`)
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, sqsEvent })
      return sqsBatchResponse
    }

    for (const record of sqsEvent.Records) {
      // If the failure is transient then we add it to the batch errors to requeue and retry
      // If the failure is non-transient then we ignore it to remove it from the queue
      const completeOrderPaymentAcceptedResult = await this.completeOrderSafe(record)
      if (Result.isFailureTransient(completeOrderPaymentAcceptedResult)) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }

    console.info(`${logContext} exit success:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  /**
   *
   */
  private async completeOrderSafe(
    sqsRecord: SQSRecord,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockCompletionError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerController.completeOrderSafe'
    console.info(`${logContext} init:`, { sqsRecord })

    const parseInputEventResult = this.parseInputEvent(sqsRecord)
    if (Result.isFailure(parseInputEventResult)) {
      console.error(`${logContext} exit failure:`, { parseInputEventResult, sqsRecord })
      return parseInputEventResult
    }

    const unverifiedEvent = parseInputEventResult.value as IncomingOrderPaymentAcceptedEventInput
    const incomingOrderPaymentAcceptedEventResult = IncomingOrderPaymentAcceptedEvent.validateAndBuild(unverifiedEvent)
    if (Result.isFailure(incomingOrderPaymentAcceptedEventResult)) {
      console.error(`${logContext} exit failure:`, { incomingOrderPaymentAcceptedEventResult, unverifiedEvent })
      return incomingOrderPaymentAcceptedEventResult
    }

    const incomingOrderPaymentAcceptedEvent = incomingOrderPaymentAcceptedEventResult.value
    const completeOrderPaymentAcceptedResult = await this.completeOrderPaymentAcceptedWorkerService.completeOrder(
      incomingOrderPaymentAcceptedEvent,
    )

    Result.isFailure(completeOrderPaymentAcceptedResult)
      ? console.error(`${logContext} exit failure:`, {
          completeOrderPaymentAcceptedResult,
          incomingOrderPaymentAcceptedEvent,
        })
      : console.info(`${logContext} exit success:`, { completeOrderPaymentAcceptedResult })

    return completeOrderPaymentAcceptedResult
  }

  /**
   *
   */
  private parseInputEvent(sqsRecord: SQSRecord): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerController.parseInputEvent'

    try {
      const unverifiedEvent = JSON.parse(sqsRecord.body)
      return Result.makeSuccess<unknown>(unverifiedEvent)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, sqsRecord })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, sqsRecord })
      return invalidArgsFailure
    }
  }
}
