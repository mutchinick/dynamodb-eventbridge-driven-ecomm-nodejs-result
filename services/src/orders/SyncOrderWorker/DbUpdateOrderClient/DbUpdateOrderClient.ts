import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, NativeAttributeValue, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { OrderError } from '../../errors/OrderError'
import { OrderData } from '../../model/OrderData'
import { UpdateOrderCommand } from '../model/UpdateOrderCommand'

export interface IDbUpdateOrderClient {
  updateOrder: (updateOrderCommand: UpdateOrderCommand) => Promise<OrderData>
}

export class DbUpdateOrderClient implements IDbUpdateOrderClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async updateOrder(updateOrderCommand: UpdateOrderCommand): Promise<OrderData> {
    try {
      console.info('DbUpdateOrderClient.updateOrder init:', { updateOrderCommand })
      const ddbUpdateCommand = this.buildDdbUpdateCommand(updateOrderCommand)
      const { Attributes } = await this.ddbDocClient.send(ddbUpdateCommand)
      const orderData = this.buildOrderData(Attributes)
      console.info('DbUpdateOrderClient.updateOrder exit:', { orderData })
      return orderData
    } catch (error) {
      console.error('DbUpdateOrderClient.updateOrder error:', { error })
      if (OrderError.hasName(error, OrderError.ConditionalCheckFailedException)) {
        const attributes = unmarshall((error as ConditionalCheckFailedException).Item)
        const orderData = this.buildOrderData(attributes)
        console.info('DbUpdateOrderClient.updateOrder exit: Order status update redundant', { orderData })
        return orderData
      }
      throw error
    }
  }

  //
  //
  //
  private buildDdbUpdateCommand(updateOrderCommand: UpdateOrderCommand): UpdateCommand {
    return new UpdateCommand({
      TableName: process.env.ORDER_TABLE_NAME,
      Key: {
        pk: `ORDER_ID#${updateOrderCommand.orderData.orderId}`,
        sk: `ORDER_ID#${updateOrderCommand.orderData.orderId}`,
      },
      UpdateExpression: 'SET #orderStatus = :orderStatus, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#orderStatus': 'orderStatus',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':orderStatus': updateOrderCommand.orderData.orderStatus,
        ':updatedAt': updateOrderCommand.orderData.updatedAt,
      },
      ConditionExpression: '#orderStatus <> :orderStatus',
      ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      ReturnValues: 'ALL_NEW',
    })
  }

  //
  //
  //
  private buildOrderData(attributes: Record<string, NativeAttributeValue>) {
    const orderData: OrderData = {
      orderId: attributes.orderId,
      orderStatus: attributes.orderStatus,
      sku: attributes.sku,
      units: attributes.units,
      price: attributes.price,
      userId: attributes.userId,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    }
    return orderData
  }
}
