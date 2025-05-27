import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../errors/Result'
import { IDeallocateOrderPaymentRejectedWorkerService } from '../DeallocateOrderPaymentRejectedWorkerService/DeallocateOrderPaymentRejectedWorkerService'
import {
  IncomingOrderPaymentRejectedEvent,
  IncomingOrderPaymentRejectedEventInput,
} from '../model/IncomingOrderPaymentRejectedEvent'

export interface IDeallocateOrderPaymentRejectedWorkerController {
  deallocateOrderStock: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class DeallocateOrderPaymentRejectedWorkerController implements IDeallocateOrderPaymentRejectedWorkerController {
  /**
   *
   */
  constructor(
    private readonly deallocateOrderPaymentRejectedWorkerService: IDeallocateOrderPaymentRejectedWorkerService,
  ) {
    this.deallocateOrderStock = this.deallocateOrderStock.bind(this)
  }

  /**
   *
   */
  public async deallocateOrderStock(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerController.deallocateOrderStock'
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
      const deallocateOrderPaymentRejectedResult = await this.deallocateOrderSafe(record)
      if (Result.isFailureTransient(deallocateOrderPaymentRejectedResult)) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }

    console.info(`${logContext} exit success:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  /**
   *
   */
  private async deallocateOrderSafe(
    sqsRecord: SQSRecord,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockDeallocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerController.deallocateOrderSafe'
    console.info(`${logContext} init:`, { sqsRecord })

    const parseInputEventResult = this.parseInputEvent(sqsRecord)
    if (Result.isFailure(parseInputEventResult)) {
      console.error(`${logContext} exit failure:`, { parseInputEventResult, sqsRecord })
      return parseInputEventResult
    }

    const unverifiedEvent = parseInputEventResult.value as IncomingOrderPaymentRejectedEventInput
    const incomingOrderPaymentRejectedEventResult = IncomingOrderPaymentRejectedEvent.validateAndBuild(unverifiedEvent)
    if (Result.isFailure(incomingOrderPaymentRejectedEventResult)) {
      console.error(`${logContext} exit failure:`, { incomingOrderPaymentRejectedEventResult, unverifiedEvent })
      return incomingOrderPaymentRejectedEventResult
    }

    const incomingOrderPaymentRejectedEvent = incomingOrderPaymentRejectedEventResult.value
    const deallocateOrderPaymentRejectedResult =
      await this.deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(incomingOrderPaymentRejectedEvent)

    Result.isFailure(deallocateOrderPaymentRejectedResult)
      ? console.error(`${logContext} exit failure:`, {
          deallocateOrderPaymentRejectedResult,
          incomingOrderPaymentRejectedEvent,
        })
      : console.info(`${logContext} exit success:`, { deallocateOrderPaymentRejectedResult })

    return deallocateOrderPaymentRejectedResult
  }

  /**
   *
   */
  private parseInputEvent(sqsRecord: SQSRecord): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerController.parseInputEvent'

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
