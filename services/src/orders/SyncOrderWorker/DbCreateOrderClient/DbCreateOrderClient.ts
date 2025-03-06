import { DynamoDBDocumentClient, NativeAttributeValue, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { CreateOrderCommand } from '../model/CreateOrderCommand'

export interface IDbCreateOrderClient {
  createOrder: (
    createOrderCommand: CreateOrderCommand,
  ) => Promise<Success<OrderData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export class DbCreateOrderClient implements IDbCreateOrderClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async createOrder(
    createOrderCommand: CreateOrderCommand,
  ): Promise<Success<OrderData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbCreateOrderClient.createOrder'
    console.info(`${logContext} init:`, { createOrderCommand })

    const buildCommandResult = this.buildDdbCommand(createOrderCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, createOrderCommand })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, ddbCommand })
      : console.info(`${logContext} exit success:`, { sendCommandResult, ddbCommand })

    return sendCommandResult
  }

  //
  //
  //
  private buildDdbCommand(createOrderCommand: CreateOrderCommand) {
    try {
      const ddbCommand = new UpdateCommand({
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
          '#units = :units, ' +
          '#price = :price, ' +
          '#userId = :userId, ' +
          '#createdAt = :createdAt, ' +
          '#updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#_tn': '_tn',
          '#orderId': 'orderId',
          '#orderStatus': 'orderStatus',
          '#sku': 'sku',
          '#units': 'units',
          '#price': 'price',
          '#userId': 'userId',
          '#createdAt': 'createdAt',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':_tn': 'ORDERS#ORDER',
          ':orderId': createOrderCommand.orderData.orderId,
          ':orderStatus': createOrderCommand.orderData.orderStatus,
          ':sku': createOrderCommand.orderData.sku,
          ':units': createOrderCommand.orderData.units,
          ':price': createOrderCommand.orderData.price,
          ':userId': createOrderCommand.orderData.userId,
          ':createdAt': createOrderCommand.orderData.createdAt,
          ':updatedAt': createOrderCommand.orderData.updatedAt,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ReturnValues: 'ALL_NEW',
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      const logContext = 'DbCreateOrderClient.buildDdbCommand'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, createOrderCommand })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbCommand(ddbCommand: UpdateCommand) {
    const logContext = 'DbCreateOrderClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const { Attributes } = await this.ddbDocClient.send(ddbCommand)
      const orderData = this.buildOrderData(Attributes)
      const orderDataResult = Result.makeSuccess(orderData)
      console.info(`${logContext} exit success:`, { orderDataResult, ddbCommand })
      return orderDataResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      if (DynamoDbUtils.isConditionalCheckFailedException(error)) {
        // FIXME: Can this unmarshall throw?
        const attributes = unmarshall(error.Item)
        const orderData = this.buildOrderData(attributes)
        const orderDataResult = Result.makeSuccess(orderData)
        console.info(`${logContext} exit success:`, { orderDataResult, ddbCommand, error })
        return orderDataResult
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
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
      units: attributes.units,
      price: attributes.price,
      userId: attributes.userId,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    }
    return orderData
  }
}
