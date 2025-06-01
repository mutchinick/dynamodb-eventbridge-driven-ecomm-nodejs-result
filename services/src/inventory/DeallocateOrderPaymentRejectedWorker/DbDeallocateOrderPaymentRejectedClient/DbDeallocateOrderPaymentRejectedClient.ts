import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { DeallocateOrderPaymentRejectedCommand } from '../model/DeallocateOrderPaymentRejectedCommand'

export interface IDbDeallocateOrderPaymentRejectedClient {
  deallocateOrder: (
    deallocateOrderPaymentRejectedCommand: DeallocateOrderPaymentRejectedCommand,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockDeallocationError'>
    | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class DbDeallocateOrderPaymentRejectedClient implements IDbDeallocateOrderPaymentRejectedClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
  public async deallocateOrder(
    deallocateOrderPaymentRejectedCommand: DeallocateOrderPaymentRejectedCommand,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockDeallocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DbDeallocateOrderPaymentRejectedClient.deallocateOrder'
    console.info(`${logContext} init:`, { deallocateOrderPaymentRejectedCommand })

    const inputValidationResult = this.validateInput(deallocateOrderPaymentRejectedCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, deallocateOrderPaymentRejectedCommand })
      return inputValidationResult
    }

    const buildDdbCommandResult = this.buildDdbCommand(deallocateOrderPaymentRejectedCommand)
    if (Result.isFailure(buildDdbCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildDdbCommandResult, deallocateOrderPaymentRejectedCommand })
      return buildDdbCommandResult
    }

    const ddbCommand = buildDdbCommandResult.value
    const sendDdbCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendDdbCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendDdbCommandResult, deallocateOrderPaymentRejectedCommand })
      : console.info(`${logContext} exit success:`, { sendDdbCommandResult, deallocateOrderPaymentRejectedCommand })

    return sendDdbCommandResult
  }

  /**
   *
   */
  private validateInput(
    deallocateOrderPaymentRejectedCommand: DeallocateOrderPaymentRejectedCommand,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbDeallocateOrderPaymentRejectedClient.validateInput'

    if (deallocateOrderPaymentRejectedCommand instanceof DeallocateOrderPaymentRejectedCommand === false) {
      const errorMessage = `Expected DeallocateOrderPaymentRejectedCommand but got ${deallocateOrderPaymentRejectedCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, deallocateOrderPaymentRejectedCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(
    deallocateOrderPaymentRejectedCommand: DeallocateOrderPaymentRejectedCommand,
  ): Success<TransactWriteCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbDeallocateOrderPaymentRejectedClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.INVENTORY_TABLE_NAME

      const { commandData } = deallocateOrderPaymentRejectedCommand
      const { orderId, sku, units, updatedAt } = commandData
      const { allocationStatus, expectedAllocationStatus } = commandData

      const allocationPk = `INVENTORY#SKU#${sku}`
      const allocationSk = `SKU#${sku}#ORDER_ID#${orderId}#ORDER_ALLOCATION`

      const skuItemPk = `INVENTORY#SKU#${sku}`
      const skuItemSk = `SKU#${sku}`

      const ddbCommand = new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: tableName,
              Key: {
                pk: allocationPk,
                sk: allocationSk,
              },
              UpdateExpression: 'SET #allocationStatus = :newAllocationStatus, #updatedAt = :updatedAt',
              ExpressionAttributeNames: {
                '#orderId': 'orderId',
                '#sku': 'sku',
                '#units': 'units',
                '#updatedAt': 'updatedAt',
                '#allocationStatus': 'allocationStatus',
              },
              ExpressionAttributeValues: {
                ':orderId': orderId,
                ':sku': sku,
                ':units': units,
                ':updatedAt': updatedAt,
                ':newAllocationStatus': allocationStatus,
                ':expectedAllocationStatus': expectedAllocationStatus,
              },
              ConditionExpression:
                'attribute_exists(pk) AND ' +
                'attribute_exists(sk) AND ' +
                '#orderId = :orderId AND ' +
                '#sku = :sku AND ' +
                '#units = :units AND ' +
                '#allocationStatus = :expectedAllocationStatus',
            },
          },
          {
            Update: {
              TableName: tableName,
              Key: {
                pk: skuItemPk,
                sk: skuItemSk,
              },
              UpdateExpression: 'SET #units = #units + :units, #updatedAt = :updatedAt',
              ExpressionAttributeNames: {
                '#units': 'units',
                '#updatedAt': 'updatedAt',
              },
              ExpressionAttributeValues: {
                ':units': units,
                ':updatedAt': updatedAt,
              },
              ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
            },
          },
        ],
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, deallocateOrderPaymentRejectedCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, deallocateOrderPaymentRejectedCommand })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(
    ddbCommand: TransactWriteCommand,
  ): Promise<Success<void> | Failure<'InvalidStockDeallocationError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbDeallocateOrderPaymentRejectedClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      const sendDdbCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendDdbCommandResult })
      return sendDdbCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, ddbCommand })

      if (error instanceof TransactionCanceledException) {
        const deallocationFailure = Result.makeFailure('InvalidStockDeallocationError', error, false)
        console.error(`${logContext} exit failure:`, { deallocationFailure, ddbCommand })
        return deallocationFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
    }
  }
}
