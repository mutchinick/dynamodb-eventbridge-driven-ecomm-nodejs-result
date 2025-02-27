import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'

export interface IDbAllocateOrderStockClient {
  allocateOrderStock: (
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateStockAllocationError'>
    | Failure<'DepletedStockAllocationError'>
    | Failure<'UnrecognizedError'>
  >
}

export class DbAllocateOrderStockClient implements IDbAllocateOrderStockClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async allocateOrderStock(
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateStockAllocationError'>
    | Failure<'DepletedStockAllocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DbAllocateOrderStockClient.allocateOrderStock'
    console.info(`${logContext} init:`, { allocateOrderStockCommand })

    const buildCommandResult = this.buildDdbUpdateCommand(allocateOrderStockCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, allocateOrderStockCommand })
      return buildCommandResult
    }

    const ddbUpdateCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbUpdateCommand(ddbUpdateCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, allocateOrderStockCommand })
      : console.info(`${logContext} exit success:`, { sendCommandResult, allocateOrderStockCommand })

    return sendCommandResult
  }

  //
  //
  //
  private buildDdbUpdateCommand(
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ): Success<TransactWriteCommand> | Failure<'InvalidArgumentsError'> {
    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.WAREHOUSE_TABLE_NAME
      const { sku, units, orderId, createdAt, updatedAt } = allocateOrderStockCommand.allocateOrderStockData
      const status = 'ALLOCATED'
      const ddbTransactWriteCommand = new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: {
                pk: `SKU_ID#${sku}#ORDER_ID#${orderId}#STOCK_ALLOCATION`,
                sk: `SKU_ID#${sku}#ORDER_ID#${orderId}#STOCK_ALLOCATION`,
                sku,
                units,
                orderId,
                status,
                createdAt,
                updatedAt,
                _tn: 'WAREHOUSE#STOCK_ALLOCATION',
              },
              ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
            },
          },
          {
            Update: {
              TableName: tableName,
              Key: {
                pk: `SKU#${sku}`,
                sk: `SKU#${sku}`,
              },
              UpdateExpression:
                `SET ` +
                `#sku = :sku, ` +
                `#units = #units - :units, ` +
                `#createdAt = if_not_exists(#createdAt, :createdAt), ` +
                `#updatedAt = :updatedAt, ` +
                `#_tn = :_tn`,
              ExpressionAttributeNames: {
                '#sku': 'sku',
                '#units': 'units',
                '#createdAt': 'createdAt',
                '#updatedAt': 'updatedAt',
                '#_tn': '_tn',
              },
              ExpressionAttributeValues: {
                ':sku': sku,
                ':units': units,
                ':createdAt': createdAt,
                ':updatedAt': updatedAt,
                ':_tn': 'WAREHOUSE#SKU',
              },
              ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk) and #units >= :units',
            },
          },
        ],
      })
      return Result.makeSuccess(ddbTransactWriteCommand)
    } catch (error) {
      const logContext = 'DbAllocateOrderStockClient.buildDdbUpdateCommand'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, allocateOrderStockCommand })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbUpdateCommand(
    ddbUpdateCommand: TransactWriteCommand,
  ): Promise<
    | Success<void>
    | Failure<'DuplicateStockAllocationError'>
    | Failure<'DepletedStockAllocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DbAllocateOrderStockClient.sendDdbUpdateCommand'
    console.info(`${logContext} init:`, { ddbUpdateCommand })

    try {
      await this.ddbDocClient.send(ddbUpdateCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult })
      return sendCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Duplication Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.DuplicateStockAllocationError(error)) {
        const duplicationFailure = Result.makeFailure('DuplicateStockAllocationError', error, false)
        console.error(`${logContext} exit failure:`, { duplicationFailure, ddbUpdateCommand })
        return duplicationFailure
      }

      if (this.isDepletedStockAllocationError(error)) {
        const depletionFailure = Result.makeFailure('DepletedStockAllocationError', error, false)
        console.error(`${logContext} exit failure:`, { depletionFailure, ddbUpdateCommand })
        return depletionFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbUpdateCommand })
      return unrecognizedFailure
    }
  }

  //
  //
  //
  private DuplicateStockAllocationError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === DynamoDbUtils.CancellationReasons.ConditionalCheckFailed
  }

  //
  //
  //
  private isDepletedStockAllocationError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 1)
    return errorCode === DynamoDbUtils.CancellationReasons.ConditionalCheckFailed
  }
}
