import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { WarehouseError } from '../../errors/WarehouseError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
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

      // When possible multiple transaction errors:
      // Prioritize tagging the "Redundancy Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isRestockRedundantError(error)) {
        WarehouseError.addName(error, WarehouseError.InvalidRestockOperationError_Redundant)
        WarehouseError.addName(error, WarehouseError.DoNotRetryError)
        throw error
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
              _tn: 'WAREHOUSE#LOT',
            },
            ConditionExpression: 'attribute_not_exists(pk)',
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
              `#units = if_not_exists(#units, :zero) + :units, ` +
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
              ':zero': 0,
              ':_tn': 'WAREHOUSE#SKU',
            },
          },
        },
      ],
    })
  }

  //
  //
  //
  private isRestockRedundantError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === WarehouseError.ConditionalCheckFailedException
  }
}
