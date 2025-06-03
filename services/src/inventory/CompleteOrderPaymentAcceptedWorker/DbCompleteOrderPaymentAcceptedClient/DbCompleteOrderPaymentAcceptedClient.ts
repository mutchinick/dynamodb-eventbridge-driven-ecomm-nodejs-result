import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { CompleteOrderPaymentAcceptedCommand } from '../model/CompleteOrderPaymentAcceptedCommand'

export interface IDbCompleteOrderPaymentAcceptedClient {
  completeOrder: (
    completeOrderPaymentAcceptedCommand: CompleteOrderPaymentAcceptedCommand,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockCompletionError'>
    | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class DbCompleteOrderPaymentAcceptedClient implements IDbCompleteOrderPaymentAcceptedClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
  public async completeOrder(
    completeOrderPaymentAcceptedCommand: CompleteOrderPaymentAcceptedCommand,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockCompletionError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DbCompleteOrderPaymentAcceptedClient.completeOrder'
    console.info(`${logContext} init:`, { completeOrderPaymentAcceptedCommand })

    const inputValidationResult = this.validateInput(completeOrderPaymentAcceptedCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, completeOrderPaymentAcceptedCommand })
      return inputValidationResult
    }

    const buildDdbCommandResult = this.buildDdbCommand(completeOrderPaymentAcceptedCommand)
    if (Result.isFailure(buildDdbCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildDdbCommandResult, completeOrderPaymentAcceptedCommand })
      return buildDdbCommandResult
    }

    const ddbCommand = buildDdbCommandResult.value
    const sendDdbCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendDdbCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendDdbCommandResult, completeOrderPaymentAcceptedCommand })
      : console.info(`${logContext} exit success:`, { sendDdbCommandResult, completeOrderPaymentAcceptedCommand })

    return sendDdbCommandResult
  }

  /**
   *
   */
  private validateInput(
    completeOrderPaymentAcceptedCommand: CompleteOrderPaymentAcceptedCommand,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbCompleteOrderPaymentAcceptedClient.validateInput'

    if (completeOrderPaymentAcceptedCommand instanceof CompleteOrderPaymentAcceptedCommand === false) {
      const errorMessage = `Expected CompleteOrderPaymentAcceptedCommand but got ${completeOrderPaymentAcceptedCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, completeOrderPaymentAcceptedCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(
    completeOrderPaymentAcceptedCommand: CompleteOrderPaymentAcceptedCommand,
  ): Success<UpdateCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbCompleteOrderPaymentAcceptedClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but UpdateCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.INVENTORY_TABLE_NAME

      const { commandData } = completeOrderPaymentAcceptedCommand
      const { orderId, sku, units, updatedAt } = commandData
      const { allocationStatus, expectedAllocationStatus } = commandData

      const allocationPk = `INVENTORY#SKU#${sku}`
      const allocationSk = `SKU#${sku}#ORDER_ID#${orderId}#ORDER_ALLOCATION`

      const ddbCommand = new UpdateCommand({
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
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, completeOrderPaymentAcceptedCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, completeOrderPaymentAcceptedCommand })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(
    ddbCommand: UpdateCommand,
  ): Promise<Success<void> | Failure<'InvalidStockCompletionError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbCompleteOrderPaymentAcceptedClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      const sendDdbCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendDdbCommandResult })
      return sendDdbCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, ddbCommand })

      if (error instanceof ConditionalCheckFailedException) {
        const completionFailure = Result.makeFailure('InvalidStockCompletionError', error, false)
        console.error(`${logContext} exit failure:`, { completionFailure, ddbCommand })
        return completionFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
    }
  }
}
