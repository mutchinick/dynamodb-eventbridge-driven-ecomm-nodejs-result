import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
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

    const inputValidationResult = this.validateInput(skuRestockedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, skuRestockedEvent })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbPutCommand(skuRestockedEvent)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, skuRestockedEvent })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbPutCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, skuRestockedEvent })
      : console.info(`${logContext} exit success:`, { sendCommandResult, skuRestockedEvent })

    return sendCommandResult
  }

  //
  //
  //
  private validateInput(skuRestockedEvent: SkuRestockedEvent): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EsRaiseSkuRestockedEventClient.validateInput'

    if (skuRestockedEvent instanceof SkuRestockedEvent === false) {
      const errorMessage = `Expected SkuRestockedEvent but got ${skuRestockedEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, skuRestockedEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private buildDdbPutCommand(
    skuRestockedEvent: SkuRestockedEvent,
  ): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EsRaiseSkuRestockedEventClient.buildDdbPutCommand'

    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const ddbCommand = new PutCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Item: {
          pk: `SKU#${skuRestockedEvent.eventData.sku}`,
          sk: `EVENT#${skuRestockedEvent.eventName}#LOT_ID#${skuRestockedEvent.eventData.lotId}`,
          _tn: '#EVENT',
          ...skuRestockedEvent,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, skuRestockedEvent })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, skuRestockedEvent })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbPutCommand(
    ddbCommand: PutCommand,
  ): Promise<Success<void> | Failure<'DuplicateEventRaisedError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'EsRaiseSkuRestockedEventClient.sendDdbPutCommand'
    console.info(`${logContext} init:`)

    try {
      await this.ddbDocClient.send(ddbCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult, ddbCommand })
      return sendCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, ddbCommand })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Duplication Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (error instanceof ConditionalCheckFailedException) {
        const duplicationFailure = Result.makeFailure('DuplicateEventRaisedError', error, false)
        console.error(`${logContext} exit failure:`, { duplicationFailure, ddbCommand })
        return duplicationFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
    }
  }
}
