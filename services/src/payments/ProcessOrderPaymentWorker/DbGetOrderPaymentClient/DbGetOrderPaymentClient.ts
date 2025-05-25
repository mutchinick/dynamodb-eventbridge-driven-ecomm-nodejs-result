import { DynamoDBDocumentClient, GetCommand, NativeAttributeValue } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { GetOrderPaymentCommand } from '../model/GetOrderPaymentCommand'

export interface IDbGetOrderPaymentClient {
  getOrderPayment: (
    getOrderPaymentCommand: GetOrderPaymentCommand,
  ) => Promise<Success<OrderPaymentData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

/**
 *
 */
export class DbGetOrderPaymentClient implements IDbGetOrderPaymentClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
  public async getOrderPayment(
    getOrderPaymentCommand: GetOrderPaymentCommand,
  ): Promise<Success<OrderPaymentData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbGetOrderPaymentClient.getOrderPayment'
    console.info(`${logContext} init:`, { getOrderPaymentCommand })

    const inputValidationResult = this.validateInput(getOrderPaymentCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, getOrderPaymentCommand })
      return inputValidationResult
    }

    const buildDdbCommandResult = this.buildDdbCommand(getOrderPaymentCommand)
    if (Result.isFailure(buildDdbCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildDdbCommandResult, getOrderPaymentCommand })
      return buildDdbCommandResult
    }

    const ddbCommand = buildDdbCommandResult.value
    const sendDdbCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendDdbCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendDdbCommandResult, ddbCommand })
      : console.info(`${logContext} exit success:`, { sendDdbCommandResult, ddbCommand })

    return sendDdbCommandResult
  }

  /**
   *
   */
  private validateInput(
    getOrderPaymentCommand: GetOrderPaymentCommand,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbGetOrderPaymentClient.validateInput'

    if (getOrderPaymentCommand instanceof GetOrderPaymentCommand === false) {
      const errorMessage = `Expected GetOrderPaymentCommand but got ${getOrderPaymentCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, getOrderPaymentCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(
    getOrderPaymentCommand: GetOrderPaymentCommand,
  ): Success<GetCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbGetOrderPaymentClient.buildDdbCommand'

    try {
      const tableName = process.env.PAYMENTS_TABLE_NAME

      const { orderId } = getOrderPaymentCommand.commandData

      const paymentPk = `PAYMENTS#ORDER_ID#${orderId}`
      const paymentSk = `ORDER_ID#${orderId}#PAYMENT`

      const ddbCommand = new GetCommand({
        TableName: tableName,
        Key: {
          pk: paymentPk,
          sk: paymentSk,
        },
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, getOrderPaymentCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, getOrderPaymentCommand })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(
    ddbCommand: GetCommand,
  ): Promise<Success<OrderPaymentData> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbGetOrderPaymentClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbOutput = await this.ddbDocClient.send(ddbCommand)
      if (!ddbOutput.Item) {
        const orderPaymentData: OrderPaymentData = null
        const sendDdbCommandResult = Result.makeSuccess(orderPaymentData)
        console.info(`${logContext} exit success: null-Item:`, { sendDdbCommandResult })
        return sendDdbCommandResult
      } else {
        const orderPaymentData = this.buildOrderPaymentData(ddbOutput.Item)
        const sendDdbCommandResult = Result.makeSuccess(orderPaymentData)
        console.info(`${logContext} exit success:`, { sendDdbCommandResult })
        return sendDdbCommandResult
      }
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, ddbCommand })
      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
    }
  }

  /**
   *
   */
  private buildOrderPaymentData(ddbItem: Record<string, NativeAttributeValue>): OrderPaymentData {
    const orderPaymentData: OrderPaymentData = {
      orderId: ddbItem.orderId,
      sku: ddbItem.sku,
      units: ddbItem.units,
      price: ddbItem.price,
      userId: ddbItem.userId,
      createdAt: ddbItem.createdAt,
      updatedAt: ddbItem.updatedAt,
      paymentId: ddbItem.paymentId,
      paymentStatus: ddbItem.paymentStatus,
      paymentRetries: ddbItem.paymentRetries,
    }
    return orderPaymentData
  }
}
