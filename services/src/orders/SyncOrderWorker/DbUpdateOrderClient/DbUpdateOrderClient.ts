import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, NativeAttributeValue, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
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

    const inputValidationResult = this.validateInput(updateOrderCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, updateOrderCommand })
      return inputValidationResult
    }

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
  private validateInput(updateOrderCommand: UpdateOrderCommand): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbUpdateOrderClient.validateInput'

    if (updateOrderCommand instanceof UpdateOrderCommand === false) {
      const errorMessage = `Expected UpdateOrderCommand but got ${updateOrderCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, updateOrderCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private buildDdbCommand(updateOrderCommand: UpdateOrderCommand) {
    const logContext = 'DbUpdateOrderClient.buildDdbCommand'

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
      console.error(`${logContext} error caught:`, { error, updateOrderCommand })
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
