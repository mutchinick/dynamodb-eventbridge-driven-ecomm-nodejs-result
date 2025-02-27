import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../errors/Result'
import { IncomingSkuRestockedEvent, IncomingSkuRestockedEventInput } from '../model/IncomingSkuRestockedEvent'
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
    const logContext = 'RestockSkuWorkerController.restockSkus'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }
    for (const record of sqsEvent.Records) {
      // If the failure is transient then we add it to the batch errors to requeue and retry
      // If the failure is non-transient then we ignore it to remove it from the queue
      const restockSkuResult = await this.restockSingleSkuSafe(record)
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
  private async restockSingleSkuSafe(
    sqsRecord: SQSRecord,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateRestockOperationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'RestockSkuApiController.restockSingleSkuSafe'
    console.info(`${logContext} init:`, { sqsRecord })

    const parseEventBodyResult = this.parseValidateEventBody(sqsRecord)
    if (Result.isFailure(parseEventBodyResult)) {
      console.error(`${logContext} failure exit:`, { parseEventResult: parseEventBodyResult, sqsRecord })
      return parseEventBodyResult
    }

    const eventBridgeEvent = parseEventBodyResult.value as IncomingSkuRestockedEventInput
    const incomingRestockSkuEventResult = IncomingSkuRestockedEvent.validateAndBuild(eventBridgeEvent)
    if (Result.isFailure(incomingRestockSkuEventResult)) {
      console.error(`${logContext} failure exit:`, { incomingRestockSkuEventResult, unverifiedEvent: eventBridgeEvent })
      return incomingRestockSkuEventResult
    }

    const incomingRestockSkuEvent = incomingRestockSkuEventResult.value
    const restockSkuResult = await this.restockSkuWorkerService.restockSku(incomingRestockSkuEvent)
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
      const logContext = 'RestockSkuApiController.parseValidateEventBody'
      console.error(`${logContext} error caught:`, { error, sqsRecord })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, sqsRecord })
      return invalidArgsFailure
    }
  }
}
