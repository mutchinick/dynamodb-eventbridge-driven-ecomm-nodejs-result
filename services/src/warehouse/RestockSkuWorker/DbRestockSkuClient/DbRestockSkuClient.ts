import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { WarehouseError } from '../../errors/WarehouseError'
import { getDdbTransactionCancellationCode } from '../../shared/getDdbTransactionCancellationCode'
import { RestockSkuCommand } from '../model/RestockSkuCommand'

export interface IDbRestockSkuClient {
  restockSku: (restockSkuCommand: RestockSkuCommand) => Promise<void>
}

export class DbRestockSkuClient implements IDbRestockSkuClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async restockSku(restockSkuCommand: RestockSkuCommand): Promise<void> {
    try {
      console.info('DbRestockSkuClient.restockSku init:', { restockSkuCommand })
      const ddbUpdateCommand = this.buildDdbUpdateCommand(restockSkuCommand)
      await this.ddbDocClient.send(ddbUpdateCommand)
      console.info('DbRestockSkuClient.restockSku exit:')
    } catch (error) {
      console.error('DbRestockSkuClient.updateWarehouse error:', { error })

      if (WarehouseError.hasName(error, WarehouseError.TransactionCanceledException)) {
        WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      }

      if (this.isRestockRedundantError(error)) {
        WarehouseError.addName(error, WarehouseError.InvalidRestockOperationError_Redundant)
      }

      throw error
    }
  }

  //
  //
  //
  private buildDdbUpdateCommand(restockSkuCommand: RestockSkuCommand): TransactWriteCommand {
    const tableName = process.env.WAREHOUSE_TABLE_NAME
    const { sku, units, lotId, createdAt, updatedAt } = restockSkuCommand.restockSkuData
    return new TransactWriteCommand({
      TransactItems: [
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
              `#units = if_not_exists(#units, :zero) + :units, ` +
              `#lotId = :lotId, ` +
              `#createdAt = if_not_exists(#createdAt, :createdAt), ` +
              `#updatedAt = :updatedAt, ` +
              `#_tn = :_tn`,
            ExpressionAttributeNames: {
              '#sku': 'sku',
              '#units': 'units',
              '#lotId': 'lotId',
              '#createdAt': 'createdAt',
              '#updatedAt': 'updatedAt',
              '#_tn': '_tn',
            },
            ExpressionAttributeValues: {
              ':sku': sku,
              ':units': units,
              ':lotId': lotId,
              ':createdAt': createdAt,
              ':updatedAt': updatedAt,
              ':zero': 0,
              ':_tn': 'STOCK',
            },
          },
        },
        {
          Put: {
            TableName: tableName,
            Item: {
              pk: `LOT_ID#${lotId}`,
              sk: `LOT_ID#${lotId}`,
              sku,
              units,
              lotId,
              createdAt,
              updatedAt,
              _tn: 'RESTOCK',
            },
            ConditionExpression: 'attribute_not_exists(pk)',
          },
        },
      ],
    })
  }

  //
  //
  //
  private isRestockRedundantError(error: unknown): boolean {
    const errorCode = getDdbTransactionCancellationCode(error, 1)
    return errorCode === WarehouseError.ConditionalCheckFailedException
  }
}
