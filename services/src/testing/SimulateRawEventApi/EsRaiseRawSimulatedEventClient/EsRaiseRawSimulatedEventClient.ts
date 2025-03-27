import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { RawSimulatedEvent } from '../model/RawSimulatedEvent'

export interface IEsRaiseRawSimulatedEventClient {
  raiseRawSimulatedEvent: (
    rawSimulatedEvent: RawSimulatedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  >
}

export class EsRaiseRawSimulatedEventClient implements IEsRaiseRawSimulatedEventClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async raiseRawSimulatedEvent(
    rawSimulatedEvent: RawSimulatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'EsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent'
    console.info(`${logContext} init:`, { rawSimulatedEvent })

    const inputValidationResult = this.validateInput(rawSimulatedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, rawSimulatedEvent })
      return inputValidationResult
    }

    const ddbCommandResult = this.buildDdbCommand(rawSimulatedEvent)
    if (Result.isFailure(ddbCommandResult)) {
      console.error(`${logContext} exit error:`, { ddbCommandResult, rawSimulatedEvent })
      return ddbCommandResult
    }

    const ddbCommand = ddbCommandResult.value
    const sendDdbCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendDdbCommandResult)
      ? console.error(`${logContext} exit error:`, { sendDdbCommandResult, ddbCommand, rawSimulatedEvent })
      : console.info(`${logContext} exit success:`, { sendDdbCommandResult, ddbCommand, rawSimulatedEvent })

    return sendDdbCommandResult
  }

  //
  //
  //
  private validateInput(rawSimulatedEvent: RawSimulatedEvent): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EsRaiseRawSimulatedEventClient.validateInput'

    if (rawSimulatedEvent instanceof RawSimulatedEvent === false) {
      const errorMessage = `Expected RawSimulatedEvent but got ${rawSimulatedEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, rawSimulatedEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private buildDdbCommand(
    rawSimulatedEvent: RawSimulatedEvent,
  ): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EsRaiseRawSimulatedEventClient.buildDdbCommand'

    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const eventPk = rawSimulatedEvent.pk
      const eventSk = rawSimulatedEvent.sk
      const eventTn = `EVENTS#EVENT`
      const eventSn = `EVENTS`
      const eventGsi1pk = `EVENTS#EVENT`
      const eventGsi1sk = `CREATED_AT#${rawSimulatedEvent.createdAt}`

      const ddbCommand = new PutCommand({
        TableName: tableName,
        Item: {
          pk: eventPk,
          sk: eventSk,
          ...rawSimulatedEvent,
          _tn: eventTn,
          _sn: eventSn,
          gsi1pk: eventGsi1pk,
          gsi1sk: eventGsi1sk,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, rawSimulatedEvent })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit error:`, { invalidArgsFailure, rawSimulatedEvent })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbCommand(
    ddbCommand: PutCommand,
  ): Promise<Success<void> | Failure<'DuplicateEventRaisedError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'EsRaiseRawSimulatedEventClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      const sendDdbCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendDdbCommandResult, ddbCommand })
      return sendDdbCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, ddbCommand })

      // If the error is a ConditionalCheckFailedException, then we already performed this operation
      // successfully so we return a non-transient DuplicateEventRaisedError. No sense in retrying.
      if (error instanceof ConditionalCheckFailedException) {
        const duplicationFailure = Result.makeFailure('DuplicateEventRaisedError', error, false)
        console.error(`${logContext} exit error:`, { duplicationFailure, ddbCommand })
        return duplicationFailure
      }

      // If the error is not recognizable, we return a transient UnrecognizedError, because most likely
      // there was a failure with the request and we want to retry.
      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit error:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
    }
  }
}
