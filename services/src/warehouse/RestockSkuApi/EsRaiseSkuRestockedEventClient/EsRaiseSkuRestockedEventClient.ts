import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'

export interface IEsRaiseSkuRestockedEventClient {
  raiseSkuRestockedEvent: (
    skuRestockedEvent: SkuRestockedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  >
}

export class EsRaiseSkuRestockedEventClient implements IEsRaiseSkuRestockedEventClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async raiseSkuRestockedEvent(
    skuRestockedEvent: SkuRestockedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'EsRaiseSkuRestockedEventClient.raiseSkuRestockedEvent'
    console.info(`${logContext} init:`)

    const buildCommandResult = this.buildDdbPutCommand(skuRestockedEvent)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, skuRestockedEvent })
      return buildCommandResult
    }

    const ddbUpdateCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbPutCommand(ddbUpdateCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, skuRestockedEvent })
      : console.info(`${logContext} exit success:`, { sendCommandResult, skuRestockedEvent })

    return sendCommandResult
  }

  //
  //
  //
  private buildDdbPutCommand(
    skuRestockedEvent: SkuRestockedEvent,
  ): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const ddbPutCommand = new PutCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Item: {
          pk: `SKU#${skuRestockedEvent.eventData.sku}`,
          sk: `EVENT#${skuRestockedEvent.eventName}#LOT_ID#${skuRestockedEvent.eventData.lotId}`,
          _tn: '#EVENT',
          ...skuRestockedEvent,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return Result.makeSuccess(ddbPutCommand)
    } catch (error) {
      const logContext = 'EsRaiseSkuRestockedEventClient.buildDdbPutCommand'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { error })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbPutCommand(
    ddbPutCommand: PutCommand,
  ): Promise<Success<void> | Failure<'DuplicateEventRaisedError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'EsRaiseSkuRestockedEventClient.sendDdbPutCommand'
    console.info(`${logContext} init:`)

    try {
      await this.ddbDocClient.send(ddbPutCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult, ddbPutCommand })
      return sendCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Duplication Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (DynamoDbUtils.isConditionalCheckFailedException(error)) {
        const duplicationFailure = Result.makeFailure('DuplicateEventRaisedError', error, false)
        console.error(`${logContext} exit failure:`, { duplicationFailure, ddbPutCommand })
        return duplicationFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbPutCommand })
      return unrecognizedFailure
    }
  }
}
