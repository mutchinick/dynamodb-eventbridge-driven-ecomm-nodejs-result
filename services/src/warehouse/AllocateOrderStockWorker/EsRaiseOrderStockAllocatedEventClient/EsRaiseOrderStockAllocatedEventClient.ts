import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { WarehouseError } from '../../errors/WarehouseError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'

export interface IEsRaiseOrderStockAllocatedEventClient {
  raiseOrderStockAllocatedEvent: (
    orderStockAllocatedEvent: OrderStockAllocatedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidEventRaiseOperationError_Redundant'>
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
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidEventRaiseOperationError_Redundant'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent'
    console.info(`${logContext} init:`, { orderStockAllocatedEvent })

    const ddbPutCommandResult = this.buildDdbPutCommandSafe(orderStockAllocatedEvent)
    if (Result.isFailure(ddbPutCommandResult)) {
      console.error(`${logContext} exit failure:`, { ddbPutCommandResult, orderStockAllocatedEvent })
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
    orderStockAllocatedEvent: OrderStockAllocatedEvent,
  ): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    // Perhaps we can prevent all errors by asserting OrderStockAllocatedEvent, but PutCommand
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
      console.error(`${logContext} error:`, { error })
      const invalidArgsResult = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsResult, orderStockAllocatedEvent })
      return invalidArgsResult
    }
  }

  //
  //
  //
  private isEventRedundantError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === WarehouseError.ConditionalCheckFailedException
  }
}
