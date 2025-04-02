import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'

export interface IDbAllocateOrderStockClient {
  allocateOrderStock: (
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateStockAllocationError'>
    | Failure<'DepletedStockAllocationError'>
    | Failure<'UnrecognizedError'>
  >
}

export class DbAllocateOrderStockClient implements IDbAllocateOrderStockClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async allocateOrderStock(
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateStockAllocationError'>
    | Failure<'DepletedStockAllocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DbAllocateOrderStockClient.allocateOrderStock'
    console.info(`${logContext} init:`, { allocateOrderStockCommand })

    const inputValidationResult = this.validateInput(allocateOrderStockCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, allocateOrderStockCommand })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbCommand(allocateOrderStockCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, allocateOrderStockCommand })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, allocateOrderStockCommand })
      : console.info(`${logContext} exit success:`, { sendCommandResult, allocateOrderStockCommand })

    return sendCommandResult
  }

  //
  //
  //
  private validateInput(
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbAllocateOrderStockClient.validateInput'

    if (allocateOrderStockCommand instanceof AllocateOrderStockCommand === false) {
      const errorMessage = `Expected AllocateOrderStockCommand but got ${allocateOrderStockCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, allocateOrderStockCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private buildDdbCommand(
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ): Success<TransactWriteCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbAllocateOrderStockClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.WAREHOUSE_TABLE_NAME

      const { allocateOrderStockData } = allocateOrderStockCommand
      const { orderId, sku, units, price, userId, createdAt, updatedAt } = allocateOrderStockData

      const allocationPk = `WAREHOUSE#SKU#${sku}`
      const allocationSk = `SKU#${sku}#ORDER_ID#${orderId}#ALLOCATION`
      const allocationTn = `WAREHOUSE#ALLOCATION`
      const allocationSn = `WAREHOUSE`
      const allocationGsi1Pk = `WAREHOUSE#ALLOCATION`
      const allocationGsi1Sk = `CREATED_AT#${createdAt}`
      const allocationStatus = `ALLOCATED`

      const skuItemPk = `WAREHOUSE#SKU#${sku}`
      const skuItemSk = `SKU#${sku}`

      const ddbCommand = new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: {
                pk: allocationPk,
                sk: allocationSk,
                orderId,
                sku,
                units,
                price,
                userId,
                allocationStatus,
                createdAt,
                updatedAt,
                _tn: allocationTn,
                _sn: allocationSn,
                gsi1pk: allocationGsi1Pk,
                gsi1sk: allocationGsi1Sk,
              },
              ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
            },
          },
          {
            Update: {
              TableName: tableName,
              Key: {
                pk: skuItemPk,
                sk: skuItemSk,
              },
              UpdateExpression: `SET #units = #units - :units, #updatedAt = :updatedAt`,
              ExpressionAttributeNames: {
                '#units': 'units',
                '#updatedAt': 'updatedAt',
              },
              ExpressionAttributeValues: {
                ':units': units,
                ':updatedAt': updatedAt,
              },
              ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk) and #units >= :units',
            },
          },
        ],
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, allocateOrderStockCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, allocateOrderStockCommand })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbCommand(
    ddbCommand: TransactWriteCommand,
  ): Promise<
    | Success<void>
    | Failure<'DuplicateStockAllocationError'>
    | Failure<'DepletedStockAllocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DbAllocateOrderStockClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult })
      return sendCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, ddbCommand })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Duplication Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isDuplicateStockAllocationError(error)) {
        const duplicationFailure = Result.makeFailure('DuplicateStockAllocationError', error, false)
        console.error(`${logContext} exit failure:`, { duplicationFailure, ddbCommand })
        return duplicationFailure
      }

      if (this.isDepletedStockAllocationError(error)) {
        const depletionFailure = Result.makeFailure('DepletedStockAllocationError', error, false)
        console.error(`${logContext} exit failure:`, { depletionFailure, ddbCommand })
        return depletionFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
    }
  }

  //
  //
  //
  private isDuplicateStockAllocationError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === DynamoDbUtils.CancellationReasons.ConditionalCheckFailed
  }

  //
  //
  //
  private isDepletedStockAllocationError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 1)
    return errorCode === DynamoDbUtils.CancellationReasons.ConditionalCheckFailed
  }
}
