import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../errors/Result'
import { IDeallocateOrderPaymentRejectedWorkerService } from '../DeallocateOrderPaymentRejectedWorkerService/DeallocateOrderPaymentRejectedWorkerService'
import {
  IncomingOrderPaymentRejectedEvent,
  IncomingOrderPaymentRejectedEventInput,
} from '../model/IncomingOrderPaymentRejectedEvent'

export interface IDeallocateOrderPaymentRejectedWorkerController {
  deallocateOrdersStock: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

//
//
//
export class DeallocateOrderPaymentRejectedWorkerController implements IDeallocateOrderPaymentRejectedWorkerController {
  //
  //
  //
  constructor(
    private readonly deallocateOrderPaymentRejectedWorkerService: IDeallocateOrderPaymentRejectedWorkerService,
  ) {
    this.deallocateOrdersStock = this.deallocateOrdersStock.bind(this)
  }

  //
  //
  //
  public async deallocateOrdersStock(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock'
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
      const deallocateOrderPaymentRejectedResult = await this.deallocateOrderSingle(record)
      if (Result.isFailureTransient(deallocateOrderPaymentRejectedResult)) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }

    console.info(`${logContext} exit success:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  //
  //
  //
  private async deallocateOrderSingle(
    sqsRecord: SQSRecord,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockDeallocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerController.deallocateOrderSingle'
    console.info(`${logContext} init:`, { sqsRecord })

    const unverifiedInputResult = this.parseInputSqsRecord(sqsRecord)
    if (Result.isFailure(unverifiedInputResult)) {
      console.error(`${logContext} exit failure:`, { unverifiedInputResult, sqsRecord })
      return unverifiedInputResult
    }

    const unverifiedInput = unverifiedInputResult.value
    const incomingOrderPaymentRejectedEventResult = IncomingOrderPaymentRejectedEvent.validateAndBuild(
      unverifiedInput as never,
    )
    if (Result.isFailure(incomingOrderPaymentRejectedEventResult)) {
      console.error(`${logContext} exit failure:`, { incomingOrderPaymentRejectedEventResult, unverifiedInput })
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

  //
  //
  //
  private parseInputSqsRecord(
    sqsRecord: SQSRecord,
  ): Success<IncomingOrderPaymentRejectedEventInput> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerController.parseInputSqsRecord'

    try {
      const unverifiedInput = JSON.parse(sqsRecord.body) as IncomingOrderPaymentRejectedEventInput
      return Result.makeSuccess(unverifiedInput)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, sqsRecord })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, sqsRecord })
      return invalidArgsFailure
    }
  }
}
