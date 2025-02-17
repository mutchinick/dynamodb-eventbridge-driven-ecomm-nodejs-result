import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { WarehouseError } from '../../errors/WarehouseError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'

export interface IDbAllocateOrderStockClient {
  allocateOrderStock: (
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockAllocationOperationError_Redundant'>
    | Failure<'InvalidStockAllocationOperationError_Depleted'>
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
    | Failure<'InvalidStockAllocationOperationError_Redundant'>
    | Failure<'InvalidStockAllocationOperationError_Depleted'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DbAllocateOrderStockClient.allocateOrderStock'
    console.info(`${logContext} init:`, { allocateOrderStockCommand })

    const ddbUpdateCommandResult = this.buildDdbUpdateCommand(allocateOrderStockCommand)
    if (Result.isFailure(ddbUpdateCommandResult)) {
      console.error(`${logContext} exit failure:`, { ddbUpdateCommandResult, allocateOrderStockCommand })
      return ddbUpdateCommandResult
    }

    const ddbUpdateCommand = ddbUpdateCommandResult.value
    try {
      await this.ddbDocClient.send(ddbUpdateCommand)
      const allocateOrderResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { allocateOrderResult })
      return allocateOrderResult
    } catch (error) {
      console.error(`${logContext} error:`, { error })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Redundancy Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isAllocationRedundantError(error)) {
        const redundantErrorResult = Result.makeFailure('InvalidStockAllocationOperationError_Redundant', error, false)
        console.error(`${logContext} exit failure:`, { redundantErrorResult, ddbUpdateCommand })
        return redundantErrorResult
      }

      if (this.isStockDepletedError(error)) {
        const depletedErrorResult = Result.makeFailure('InvalidStockAllocationOperationError_Depleted', error, false)
        console.error(`${logContext} exit failure:`, { depletedErrorResult, ddbUpdateCommand })
        return depletedErrorResult
      }

      const unrecognizedErrorResult = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedErrorResult, ddbUpdateCommand })
      return unrecognizedErrorResult
    }
  }

  //
  //
  //
  private buildDdbUpdateCommand(
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ): Success<TransactWriteCommand> | Failure<'InvalidArgumentsError'> {
    // Perhaps we can prevent all errors by asserting AllocateOrderStockCommand, but TransactWriteCommand
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
      console.error(`${logContext} error:`, { error })
      const invalidArgsResult = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsResult, allocateOrderStockCommand })
      return invalidArgsResult
    }
  }

  //
  //
  //
  private isAllocationRedundantError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === WarehouseError.ConditionalCheckFailedException
  }

  //
  //
  //
  private isStockDepletedError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 1)
    return errorCode === WarehouseError.ConditionalCheckFailedException
  }
}
