import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, NativeAttributeValue, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { OrderError } from '../../errors/OrderError'
import { OrderData } from '../../model/OrderData'
import { CreateOrderCommand } from '../model/CreateOrderCommand'

export interface IDbCreateOrderClient {
  createOrder: (createOrderCommand: CreateOrderCommand) => Promise<OrderData>
}

export class DbCreateOrderClient implements IDbCreateOrderClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async createOrder(createOrderCommand: CreateOrderCommand): Promise<OrderData> {
    try {
      console.info('DbCreateOrderClient.createOrder init:', { createOrderCommand })
      const ddbUpdateCommand = this.buildDdbUpdateCommand(createOrderCommand)
      const { Attributes } = await this.ddbDocClient.send(ddbUpdateCommand)
      const orderData = this.buildOrderData(Attributes)
      console.info('DbCreateOrderClient.createOrder exit:', { orderData })
      return orderData
    } catch (error) {
      console.error('DbCreateOrderClient.createOrder error:', { error })
      if (OrderError.hasName(error, OrderError.ConditionalCheckFailedException)) {
        const attributes = unmarshall((error as ConditionalCheckFailedException).Item)
        const orderData = this.buildOrderData(attributes)
        console.info('DbCreateOrderClient.createOrder exit: Order exists', { orderData })
        return orderData
      }
      throw error
    }
  }

  //
  //
  //
  private buildOrderData(attributes: Record<string, NativeAttributeValue>) {
    const orderData: OrderData = {
      orderId: attributes.orderId,
      orderStatus: attributes.orderStatus,
      sku: attributes.sku,
      quantity: attributes.quantity,
      price: attributes.price,
      userId: attributes.userId,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    }
    return orderData
  }

  //
  //
  //
  private buildDdbUpdateCommand(createOrderCommand: CreateOrderCommand): UpdateCommand {
    return new UpdateCommand({
      TableName: process.env.ORDER_TABLE_NAME,
      Key: {
        pk: `ORDER_ID#${createOrderCommand.orderData.orderId}`,
        sk: `ORDER_ID#${createOrderCommand.orderData.orderId}`,
      },
      UpdateExpression:
        'SET ' +
        '#_tn = :_tn, ' +
        '#orderId = :orderId, ' +
        '#orderStatus = :orderStatus, ' +
        '#sku = :sku, ' +
        '#quantity = :quantity, ' +
        '#price = :price, ' +
        '#userId = :userId, ' +
        '#createdAt = :createdAt, ' +
        '#updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#_tn': '_tn',
        '#orderId': 'orderId',
        '#orderStatus': 'orderStatus',
        '#sku': 'sku',
        '#quantity': 'quantity',
        '#price': 'price',
        '#userId': 'userId',
        '#createdAt': 'createdAt',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':_tn': 'ORDER',
        ':orderId': createOrderCommand.orderData.orderId,
        ':orderStatus': createOrderCommand.orderData.orderStatus,
        ':sku': createOrderCommand.orderData.sku,
        ':quantity': createOrderCommand.orderData.quantity,
        ':price': createOrderCommand.orderData.price,
        ':userId': createOrderCommand.orderData.userId,
        ':createdAt': createOrderCommand.orderData.createdAt,
        ':updatedAt': createOrderCommand.orderData.updatedAt,
      },
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      ReturnValues: 'ALL_NEW',
    })
  }
}
