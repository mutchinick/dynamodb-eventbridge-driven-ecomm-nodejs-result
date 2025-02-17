import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'

export interface IEsRaiseOrderStockDepletedEventClient {
  raiseOrderStockDepletedEvent: (
    orderStockDepletedEvent: OrderStockDepletedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidEventRaiseOperationError_Redundant'>
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
    | Failure<'InvalidEventRaiseOperationError_Redundant'>
    | Failure<'InvalidArgumentsError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent'
    console.info(`${logContext} init:`, { orderStockDepletedEvent })

    const ddbPutCommandResult = this.buildDdbPutCommandSafe(orderStockDepletedEvent)
    if (Result.isFailure(ddbPutCommandResult)) {
      console.error(`${logContext} exit failure:`, { ddbPutCommandResult, orderStockDepletedEvent })
      return ddbPutCommandResult
    }

    const ddbPutCommand = ddbPutCommandResult.value
    try {
      await this.ddbDocClient.send(ddbPutCommand)
      const raiseEventResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { raiseEventResult })
      return raiseEventResult
    } catch (error) {
      console.error(`${logContext} error:`, { error })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Redundancy Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isEventRedundantError(error)) {
        const redundantErrorResult = Result.makeFailure('InvalidEventRaiseOperationError_Redundant', error, false)
        console.error(`${logContext} exit failure:`, { redundantErrorResult, ddbPutCommand })
        return redundantErrorResult
      }

      const unrecognizedErrorResult = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedErrorResult, ddbPutCommand })
      return unrecognizedErrorResult
    }
  }

  //
  //
  //
  private buildDdbPutCommandSafe(
    orderStockDepletedEvent: OrderStockDepletedEvent,
  ): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    // Perhaps we can prevent all errors by asserting OrderStockDepletedEvent, but PutCommand
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
      console.error(`${logContext} error:`, { error })
      const invalidArgsResult = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsResult, orderStockDepletedEvent })
      return invalidArgsResult
    }
  }

  //
  //
  //
  private isEventRedundantError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === 'ConditionalCheckFailedException'
  }
}
