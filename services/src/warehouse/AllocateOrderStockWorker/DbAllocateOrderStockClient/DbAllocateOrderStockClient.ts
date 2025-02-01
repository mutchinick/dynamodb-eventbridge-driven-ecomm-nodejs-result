import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { WarehouseError } from '../../errors/WarehouseError'
import { getDdbTransactionCancellationCode } from '../../shared/getDdbTransactionCancellationCode'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'

export interface IDbAllocateOrderStockClient {
  allocateOrderStock: (allocateOrderStockCommand: AllocateOrderStockCommand) => Promise<void>
}

export class DbAllocateOrderStockClient implements IDbAllocateOrderStockClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async allocateOrderStock(allocateOrderStockCommand: AllocateOrderStockCommand): Promise<void> {
    try {
      console.info('DbAllocateOrderStockClient.allocateOrderStock init:', { allocateOrderStockCommand })
      const ddbUpdateCommand = this.buildDdbUpdateCommand(allocateOrderStockCommand)
      await this.ddbDocClient.send(ddbUpdateCommand)
      console.info('DbAllocateOrderStockClient.allocateOrderStock exit:')
    } catch (error) {
      console.error('DbAllocateOrderStockClient.updateWarehouse error:', { error })

      if (WarehouseError.hasName(error, WarehouseError.TransactionCanceledException)) {
        WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      }

      // When possible multiple transaction errors:
      // Prioritize tagging the "Redundancy Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isAllocationRedundantError(error)) {
        WarehouseError.addName(error, WarehouseError.InvalidStockAllocationOperationError_Redundant)
      } else if (this.isStockDepletedError(error)) {
        WarehouseError.addName(error, WarehouseError.InvalidStockAllocationOperationError_Depleted)
      }

      throw error
    }
  }

  //
  //
  //
  private buildDdbUpdateCommand(allocateOrderStockCommand: AllocateOrderStockCommand): TransactWriteCommand {
    const tableName = process.env.WAREHOUSE_TABLE_NAME
    const { sku, units, orderId, createdAt, updatedAt } = allocateOrderStockCommand.allocateOrderStockData
    const status = 'ALLOCATED'
    return new TransactWriteCommand({
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
  }

  //
  //
  //
  private isAllocationRedundantError(error: unknown): boolean {
    const errorCode = getDdbTransactionCancellationCode(error, 0)
    return errorCode === WarehouseError.ConditionalCheckFailedException
  }

  //
  //
  //
  private isStockDepletedError(error: unknown): boolean {
    const errorCode = getDdbTransactionCancellationCode(error, 1)
    return errorCode === WarehouseError.ConditionalCheckFailedException
  }
}
