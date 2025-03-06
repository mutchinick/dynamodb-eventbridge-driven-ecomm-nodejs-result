import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { OrderCreatedEvent } from '../model/OrderCreatedEvent'

export interface IEsRaiseOrderCreatedEventClient {
  raiseOrderCreatedEvent: (
    orderCreatedEvent: OrderCreatedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  >
}

export class EsRaiseOrderCreatedEventClient implements IEsRaiseOrderCreatedEventClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async raiseOrderCreatedEvent(
    orderCreatedEvent: OrderCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent'
    console.info(`${logContext} init:`, { orderCreatedEvent })

    const buildCommandResult = this.buildDdbCommand(orderCreatedEvent)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, orderCreatedEvent })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { buildCommandResult, ddbCommand })
      : console.info(`${logContext} exit success:`, { buildCommandResult, ddbCommand })

    return sendCommandResult
  }

  //
  //
  //
  private buildDdbCommand(
    orderCreatedEvent: OrderCreatedEvent,
  ): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const ddbCommand = new PutCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Item: {
          pk: `ORDER_ID#${orderCreatedEvent.eventData.orderId}`,
          sk: `EVENT#${orderCreatedEvent.eventName}`,
          _tn: '#EVENT',
          ...orderCreatedEvent,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      const logContext = 'EsRaiseOrderCreatedEventClient.buildDdbCommand'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, orderCreatedEvent })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbCommand(
    ddbCommand: PutCommand,
  ): Promise<Success<void> | Failure<'DuplicateEventRaisedError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'EsRaiseOrderCreatedEventClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult, ddbCommand })
      return sendCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Duplication Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (DynamoDbUtils.isConditionalCheckFailedException(error)) {
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
