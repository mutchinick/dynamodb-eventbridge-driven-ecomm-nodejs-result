import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../errors/Result'
import { IncomingSkuRestockedEvent, IncomingSkuRestockedEventInput } from '../model/IncomingSkuRestockedEvent'
import { IRestockSkuWorkerService } from '../RestockSkuWorkerService/RestockSkuWorkerService'

export interface IRestockSkuWorkerController {
  restockSkus: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class RestockSkuWorkerController implements IRestockSkuWorkerController {
  /**
   *
   */
  constructor(private readonly restockSkuWorkerService: IRestockSkuWorkerService) {
    this.restockSkus = this.restockSkus.bind(this)
  }

  /**
   *
   */
  public async restockSkus(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'RestockSkuWorkerController.restockSkus'
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
      const restockSkuResult = await this.restockSkuSafe(record)
      if (Result.isFailureTransient(restockSkuResult)) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }

    console.info(`${logContext} exit success:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  /**
   *
   */
  private async restockSkuSafe(
    sqsRecord: SQSRecord,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateRestockOperationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'RestockSkuWorkerController.restockSkuSafe'
    console.info(`${logContext} init:`, { sqsRecord })

    const parseInputEventResult = this.parseInputEvent(sqsRecord)
    if (Result.isFailure(parseInputEventResult)) {
      console.error(`${logContext} failure exit:`, { parseInputEventResult, sqsRecord })
      return parseInputEventResult
    }

    const unverifiedEvent = parseInputEventResult.value as IncomingSkuRestockedEventInput
    const incomingRestockSkuEventResult = IncomingSkuRestockedEvent.validateAndBuild(unverifiedEvent)
    if (Result.isFailure(incomingRestockSkuEventResult)) {
      console.error(`${logContext} failure exit:`, { incomingRestockSkuEventResult, unverifiedEvent })
      return incomingRestockSkuEventResult
    }

    const incomingRestockSkuEvent = incomingRestockSkuEventResult.value
    const restockSkuResult = await this.restockSkuWorkerService.restockSku(incomingRestockSkuEvent)
    Result.isFailure(restockSkuResult)
      ? console.error(`${logContext} exit failure:`, { restockSkuResult, incomingRestockSkuEvent })
      : console.info(`${logContext} exit success:`, { restockSkuResult, incomingRestockSkuEvent })

    return restockSkuResult
  }

  /**
   *
   */
  private parseInputEvent(sqsRecord: SQSRecord): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logContext = 'RestockSkuWorkerController.parseInputEvent'

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
