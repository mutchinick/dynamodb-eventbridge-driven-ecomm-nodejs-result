import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'

export interface IEsRaiseOrderStockDepletedEventClient {
  raiseOrderStockDepletedEvent: (
    orderStockDepletedEvent: OrderStockDepletedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'InvalidArgumentsError'>
    | Failure<'UnrecognizedError'>
  >
}

export class EsRaiseOrderStockDepletedEventClient implements IEsRaiseOrderStockDepletedEventClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async raiseOrderStockDepletedEvent(
    orderStockDepletedEvent: OrderStockDepletedEvent,
  ): Promise<
    | Success<void>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'InvalidArgumentsError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent'
    console.info(`${logContext} init:`, { orderStockDepletedEvent })

    const buildCommandResult = this.buildDdbPutCommand(orderStockDepletedEvent)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, orderStockDepletedEvent })
      return buildCommandResult
    }

    const ddbPutCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbPutCommand(ddbPutCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, orderStockDepletedEvent })
      : console.info(`${logContext} exit success:`, { sendCommandResult, orderStockDepletedEvent })

    return sendCommandResult
  }

  //
  //
  //
  private buildDdbPutCommand(
    orderStockDepletedEvent: OrderStockDepletedEvent,
  ): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const ddbPutCommand = new PutCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Item: {
          pk: `ORDER_ID#${orderStockDepletedEvent.eventData.orderId}`,
          sk: `EVENT#${orderStockDepletedEvent.eventName}`,
          _tn: '#EVENT',
          ...orderStockDepletedEvent,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return Result.makeSuccess(ddbPutCommand)
    } catch (error) {
      const logContext = 'EsRaiseOrderStockDepletedEventClient.buildDdbPutCommand'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderStockDepletedEvent })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbPutCommand(
    ddbPutCommand: PutCommand,
  ): Promise<Success<void> | Failure<'UnrecognizedError'> | Failure<'DuplicateEventRaisedError'>> {
    const logContext = 'EsRaiseOrderStockDepletedEventClient.sendDdbPutCommand'
    console.info(`${logContext} init:`, { ddbPutCommand })

    try {
      await this.ddbDocClient.send(ddbPutCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult })
      return sendCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Duplication Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isDuplicateEventRaisedError(error)) {
        const duplicationFailure = Result.makeFailure('DuplicateEventRaisedError', error, false)
        console.error(`${logContext} exit failure:`, { duplicationFailure, ddbPutCommand })
        return duplicationFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbPutCommand })
      return unrecognizedFailure
    }
  }

  //
  //
  //
  private isDuplicateEventRaisedError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === DynamoDbUtils.CancellationReasons.ConditionalCheckFailed
  }
}
