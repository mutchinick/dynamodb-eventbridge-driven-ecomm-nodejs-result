import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../errors/Result'
import { IProcessOrderPaymentWorkerService } from '../ProcessOrderPaymentWorkerService/ProcessOrderPaymentWorkerService'
import {
  IncomingOrderStockAllocatedEvent,
  IncomingOrderStockAllocatedEventInput,
} from '../model/IncomingOrderStockAllocatedEvent'

export interface IProcessOrderPaymentWorkerController {
  processOrderPayments: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class ProcessOrderPaymentWorkerController implements IProcessOrderPaymentWorkerController {
  /**
   *
   */
  constructor(private readonly processOrderPaymentWorkerService: IProcessOrderPaymentWorkerService) {
    this.processOrderPayments = this.processOrderPayments.bind(this)
  }

  /**
   *
   */
  public async processOrderPayments(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'ProcessOrderPaymentWorkerController.processOrderPayments'
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
      const processOrderPaymentResult = await this.processOrderPaymentSafe(record)
      if (Result.isFailureTransient(processOrderPaymentResult)) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }

    console.info(`${logContext} exit success:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  /**
   *
   */
  private async processOrderPaymentSafe(
    sqsRecord: SQSRecord,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'PaymentFailedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'ProcessOrderPaymentWorkerController.processOrderPaymentSafe'
    console.info(`${logContext} init:`, { sqsRecord })

    const parseInputEventResult = this.parseInputEvent(sqsRecord)
    if (Result.isFailure(parseInputEventResult)) {
      console.error(`${logContext} exit failure:`, { parseInputEventResult, sqsRecord })
      return parseInputEventResult
    }

    const unverifiedEvent = parseInputEventResult.value as IncomingOrderStockAllocatedEventInput
    const incomingOrderStockAllocatedEventResult = IncomingOrderStockAllocatedEvent.validateAndBuild(unverifiedEvent)
    if (Result.isFailure(incomingOrderStockAllocatedEventResult)) {
      console.error(`${logContext} exit failure:`, { incomingOrderStockAllocatedEventResult, unverifiedEvent })
      return incomingOrderStockAllocatedEventResult
    }

    const incomingOrderStockAllocatedEvent = incomingOrderStockAllocatedEventResult.value
    const processOrderPaymentResult = await this.processOrderPaymentWorkerService.processOrderPayment(
      incomingOrderStockAllocatedEvent,
    )

    Result.isFailure(processOrderPaymentResult)
      ? console.error(`${logContext} exit failure:`, { processOrderPaymentResult, incomingOrderStockAllocatedEvent })
      : console.info(`${logContext} exit success:`, { processOrderPaymentResult })

    return processOrderPaymentResult
  }

  /**
   *
   */
  private parseInputEvent(sqsRecord: SQSRecord): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ProcessOrderPaymentWorkerController.parseInputEvent'

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
