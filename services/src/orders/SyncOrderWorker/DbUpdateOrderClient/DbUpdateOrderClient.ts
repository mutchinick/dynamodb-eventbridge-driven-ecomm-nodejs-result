import { DynamoDBDocumentClient, NativeAttributeValue, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { UpdateOrderCommand } from '../model/UpdateOrderCommand'

export interface IDbUpdateOrderClient {
  updateOrder: (
    updateOrderCommand: UpdateOrderCommand,
  ) => Promise<Success<OrderData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export class DbUpdateOrderClient implements IDbUpdateOrderClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async updateOrder(
    updateOrderCommand: UpdateOrderCommand,
  ): Promise<Success<OrderData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbUpdateOrderClient.updateOrder'
    console.info(`${logContext} init:`, { updateOrderCommand })

    const buildCommandResult = this.buildDdbCommand(updateOrderCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, updateOrderCommand })
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
  private buildDdbCommand(updateOrderCommand: UpdateOrderCommand) {
    try {
      const ddbCommand = new UpdateCommand({
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
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      const logContext = 'DbUpdateOrderClient.buildDdbCommand'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, updateOrderCommand })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbCommand(ddbCommand: UpdateCommand) {
    const logContext = 'DbUpdateOrderClient.sendDdbCommand'
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
      console.error(`${logContext} exit failure:`, { error })
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
