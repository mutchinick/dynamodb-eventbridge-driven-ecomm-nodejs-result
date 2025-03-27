import { DynamoDBDocumentClient, GetCommand, NativeAttributeValue } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { GetOrderCommand } from '../model/GetOrderCommand'

export interface IDbGetOrderClient {
  getOrder: (
    getOrderCommand: GetOrderCommand,
  ) => Promise<Success<OrderData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export class DbGetOrderClient implements IDbGetOrderClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async getOrder(
    getOrderCommand: GetOrderCommand,
  ): Promise<Success<OrderData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbGetOrderClient.getOrder'
    console.info(`${logContext} init:`, { getOrderCommand })

    const inputValidationResult = this.validateInput(getOrderCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, getOrderCommand })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbCommand(getOrderCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, getOrderCommand })
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
  private validateInput(getOrderCommand: GetOrderCommand): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbGetOrderClient.validateInput'

    if (getOrderCommand instanceof GetOrderCommand === false) {
      const errorMessage = `Expected GetOrderCommand but got ${getOrderCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, getOrderCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private buildDdbCommand(getOrderCommand: GetOrderCommand): Success<GetCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbGetOrderClient.buildDdbCommand'

    try {
      const tableName = process.env.ORDERS_TABLE_NAME

      const orderItemPk = `ORDERS#ORDER_ID#${getOrderCommand.orderData.orderId}`
      const orderItemSk = `ORDER_ID#${getOrderCommand.orderData.orderId}`

      const ddbCommand = new GetCommand({
        TableName: tableName,
        Key: {
          pk: orderItemPk,
          sk: orderItemSk,
        },
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, getOrderCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, getOrderCommand })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbCommand(ddbCommand: GetCommand) {
    const logContext = 'DbGetOrderClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbOutput = await this.ddbDocClient.send(ddbCommand)
      const orderData = ddbOutput.Item ? this.buildOrderData(ddbOutput.Item) : null
      const orderDataResult = Result.makeSuccess(orderData)
      console.info(`${logContext} exit success:`, { orderDataResult, ddbCommand })
      return orderDataResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, ddbCommand })
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
