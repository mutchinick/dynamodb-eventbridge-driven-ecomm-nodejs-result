import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, NativeAttributeValue, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
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

    const inputValidationResult = this.validateInput(createOrderCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, createOrderCommand })
      return inputValidationResult
    }

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
  private validateInput(createOrderCommand: CreateOrderCommand): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbCreateOrderClient.validateInput'

    if (createOrderCommand instanceof CreateOrderCommand === false) {
      const errorMessage = `Expected CreateOrderCommand but got ${createOrderCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, createOrderCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private buildDdbCommand(createOrderCommand: CreateOrderCommand) {
    const logContext = 'DbCreateOrderClient.buildDdbCommand'

    try {
      const tableName = process.env.ORDERS_TABLE_NAME

      const { commandData } = createOrderCommand
      const { orderId, orderStatus, sku, units, price, userId, createdAt, updatedAt } = commandData

      const orderItemPk = `ORDERS#ORDER_ID#${orderId}`
      const orderItemSk = `ORDER_ID#${orderId}`
      const orderItemTn = `ORDERS#ORDER`
      const orderItemSn = `ORDERS`
      const orderItemGsi1Pk = `ORDERS#ORDER`
      const orderItemGsi1Sk = `CREATED_AT#${createdAt}`

      const ddbCommand = new UpdateCommand({
        TableName: tableName,
        Key: {
          pk: orderItemPk,
          sk: orderItemSk,
        },
        UpdateExpression:
          'SET ' +
          '#orderId = :orderId, ' +
          '#orderStatus = :orderStatus, ' +
          '#sku = :sku, ' +
          '#units = :units, ' +
          '#price = :price, ' +
          '#userId = :userId, ' +
          '#createdAt = :createdAt, ' +
          '#updatedAt = :updatedAt, ' +
          '#_tn = :_tn, ' +
          '#_sn = :_sn, ' +
          '#gsi1pk = :gsi1pk, ' +
          '#gsi1sk = :gsi1sk',
        ExpressionAttributeNames: {
          '#orderId': 'orderId',
          '#orderStatus': 'orderStatus',
          '#sku': 'sku',
          '#units': 'units',
          '#price': 'price',
          '#userId': 'userId',
          '#createdAt': 'createdAt',
          '#updatedAt': 'updatedAt',
          '#_tn': '_tn',
          '#_sn': '_sn',
          '#gsi1pk': 'gsi1pk',
          '#gsi1sk': 'gsi1sk',
        },
        ExpressionAttributeValues: {
          ':orderId': orderId,
          ':orderStatus': orderStatus,
          ':sku': sku,
          ':units': units,
          ':price': price,
          ':userId': userId,
          ':createdAt': createdAt,
          ':updatedAt': updatedAt,
          ':_tn': orderItemTn,
          ':_sn': orderItemSn,
          ':gsi1pk': orderItemGsi1Pk,
          ':gsi1sk': orderItemGsi1Sk,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ReturnValues: 'ALL_NEW',
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, createOrderCommand })
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
      console.error(`${logContext} error caught:`, { error, ddbCommand })

      if (error instanceof ConditionalCheckFailedException) {
        // COMBAK: Can this unmarshall throw?
        const attributes = unmarshall(error.Item)
        const orderData = this.buildOrderData(attributes)
        const orderDataResult = Result.makeSuccess(orderData)
        console.info(`${logContext} exit success: from-error:`, { orderDataResult, ddbCommand, error })
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
