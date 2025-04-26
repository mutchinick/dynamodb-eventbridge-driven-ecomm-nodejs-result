// FIXME: This component is duplicated in AllocateOrderStockWorker.
// It should be moved to a common place. Will do soon.
import { DynamoDBDocumentClient, GetCommand, NativeAttributeValue } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { GetOrderAllocationCommand } from '../model/GetOrderAllocationCommand'

export interface IDbGetOrderAllocationClient {
  getOrderAllocation: (
    getOrderAllocationCommand: GetOrderAllocationCommand,
  ) => Promise<Success<OrderAllocationData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

/**
 *
 */
export class DbGetOrderAllocationClient implements IDbGetOrderAllocationClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
  public async getOrderAllocation(
    getOrderAllocationCommand: GetOrderAllocationCommand,
  ): Promise<Success<OrderAllocationData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbGetOrderAllocationClient.getOrderAllocation'
    console.info(`${logContext} init:`, { getOrderAllocationCommand })

    const inputValidationResult = this.validateInput(getOrderAllocationCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, getOrderAllocationCommand })
      return inputValidationResult
    }

    const buildDdbCommandResult = this.buildDdbCommand(getOrderAllocationCommand)
    if (Result.isFailure(buildDdbCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildDdbCommandResult, getOrderAllocationCommand })
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
    getOrderAllocationCommand: GetOrderAllocationCommand,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbGetOrderAllocationClient.validateInput'

    if (getOrderAllocationCommand instanceof GetOrderAllocationCommand === false) {
      const errorMessage = `Expected GetOrderAllocationCommand but got ${getOrderAllocationCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, getOrderAllocationCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(
    getOrderAllocationCommand: GetOrderAllocationCommand,
  ): Success<GetCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbGetOrderAllocationClient.buildDdbCommand'

    try {
      const tableName = process.env.INVENTORY_TABLE_NAME

      const { orderId, sku } = getOrderAllocationCommand.commandData

      const allocationPk = `INVENTORY#SKU#${sku}`
      const allocationSk = `SKU#${sku}#ORDER_ID#${orderId}#ALLOCATION`

      const ddbCommand = new GetCommand({
        TableName: tableName,
        Key: {
          pk: allocationPk,
          sk: allocationSk,
        },
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, getOrderAllocationCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, getOrderAllocationCommand })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(
    ddbCommand: GetCommand,
  ): Promise<Success<OrderAllocationData> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbGetOrderAllocationClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbOutput = await this.ddbDocClient.send(ddbCommand)
      if (!ddbOutput.Item) {
        const orderAllocationData: OrderAllocationData = null
        const sendDdbCommandResult = Result.makeSuccess(orderAllocationData)
        console.info(`${logContext} exit success: exit success: null-Item:`, { sendDdbCommandResult })
        return sendDdbCommandResult
      } else {
        const orderAllocationData = this.buildOrderAllocationData(ddbOutput.Item)
        const sendDdbCommandResult = Result.makeSuccess(orderAllocationData)
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
  private buildOrderAllocationData(ddbItem: Record<string, NativeAttributeValue>): OrderAllocationData {
    const orderAllocationData: OrderAllocationData = {
      orderId: ddbItem.orderId,
      sku: ddbItem.sku,
      units: ddbItem.units,
      price: ddbItem.price,
      userId: ddbItem.userId,
      createdAt: ddbItem.createdAt,
      updatedAt: ddbItem.updatedAt,
      allocationStatus: ddbItem.allocationStatus,
    }
    return orderAllocationData
  }
}
