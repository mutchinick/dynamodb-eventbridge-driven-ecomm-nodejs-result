import { DynamoDBDocumentClient, GetCommand, NativeAttributeValue } from '@aws-sdk/lib-dynamodb'
import { OrderData } from '../../model/OrderData'
import { GetOrderCommand } from '../model/GetOrderCommand'

export interface IDbGetOrderClient {
  getOrder: (getOrderCommand: GetOrderCommand) => Promise<OrderData>
}

export class DbGetOrderClient implements IDbGetOrderClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async getOrder(getOrderCommand: GetOrderCommand): Promise<OrderData> {
    try {
      console.info('DbGetOrderClient.getOrder init:', { getOrderCommand })
      const ddbGetCommand = this.buildDdbGetCommand(getOrderCommand.orderId)
      const result = await this.ddbDocClient.send(ddbGetCommand)
      if (!result.Item) {
        console.info('DbGetOrderClient.getOrder exit:', { orderData: result.Item })
        return null
      }
      const orderData = this.buildOrderData(result.Item)
      console.info('DbGetOrderClient.getOrder exit:', { orderData })
      return orderData
    } catch (error) {
      console.error('DbGetOrderClient.getOrder error:', { error })
      throw error
    }
  }

  //
  //
  //
  private buildDdbGetCommand(orderId: string): GetCommand {
    return new GetCommand({
      TableName: process.env.EVENT_STORE_TABLE_NAME,
      Key: {
        pk: `ORDER_ID#${orderId}`,
        sk: `ORDER_ID#${orderId}`,
      },
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
