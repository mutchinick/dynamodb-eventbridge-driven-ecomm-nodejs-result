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

    const buildCommandResult = this.buildDdbCommand(skuRestockedEvent)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, skuRestockedEvent })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
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
  private buildDdbCommand(
    skuRestockedEvent: SkuRestockedEvent,
  ): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EsRaiseSkuRestockedEventClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const { eventName, eventData, createdAt, updatedAt } = skuRestockedEvent
      const { sku, units, lotId } = eventData

      const eventPk = `EVENTS#SKU#${sku}`
      const eventSk = `EVENT#${eventName}#LOT_ID#${lotId}`
      const eventTn = `EVENTS#EVENT`
      const eventSn = `EVENTS`
      const eventGsi1pk = `EVENTS#EVENT`
      const eventGsi1sk = `CREATED_AT#${createdAt}`

      const ddbCommand = new PutCommand({
        TableName: tableName,
        Item: {
          pk: eventPk,
          sk: eventSk,
          eventName,
          eventData: {
            sku,
            units,
            lotId,
          },
          createdAt,
          updatedAt,
          _tn: eventTn,
          _sn: eventSn,
          gsi1pk: eventGsi1pk,
          gsi1sk: eventGsi1sk,
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
  private async sendDdbCommand(
    ddbCommand: PutCommand,
  ): Promise<Success<void> | Failure<'DuplicateEventRaisedError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'EsRaiseSkuRestockedEventClient.sendDdbCommand'
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
