import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'

export interface IEsRaiseOrderStockAllocatedEventClient {
  raiseOrderStockAllocatedEvent: (
    orderStockAllocatedEvent: OrderStockAllocatedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'InvalidArgumentsError'>
    | Failure<'UnrecognizedError'>
  >
}

export class EsRaiseOrderStockAllocatedEventClient implements IEsRaiseOrderStockAllocatedEventClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async raiseOrderStockAllocatedEvent(
    orderStockAllocatedEvent: OrderStockAllocatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'InvalidArgumentsError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent'
    console.info(`${logContext} init:`, { orderStockAllocatedEvent })

    const buildCommandResult = this.buildDdbPutCommand(orderStockAllocatedEvent)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, orderStockAllocatedEvent })
      return buildCommandResult
    }

    const ddbPutCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbPutCommand(ddbPutCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, orderStockAllocatedEvent })
      : console.info(`${logContext} exit success:`, { sendCommandResult, orderStockAllocatedEvent })

    return sendCommandResult
  }

  //
  //
  //
  private buildDdbPutCommand(
    orderStockAllocatedEvent: OrderStockAllocatedEvent,
  ): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const ddbPutCommand = new PutCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Item: {
          pk: `ORDER_ID#${orderStockAllocatedEvent.eventData.orderId}`,
          sk: `EVENT#${orderStockAllocatedEvent.eventName}`,
          _tn: '#EVENT',
          ...orderStockAllocatedEvent,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return Result.makeSuccess(ddbPutCommand)
    } catch (error) {
      const logContext = 'EsRaiseOrderStockAllocatedEventClient.buildDdbPutCommand'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderStockAllocatedEvent })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbPutCommand(
    ddbPutCommand: PutCommand,
  ): Promise<Success<void> | Failure<'UnrecognizedError'> | Failure<'DuplicateEventRaisedError'>> {
    const logContext = 'EsRaiseOrderStockAllocatedEventClient.sendDdbPutCommand'
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
