import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { RestockSkuCommand } from '../model/RestockSkuCommand'

export interface IDbRestockSkuClient {
  restockSku: (
    restockSkuCommand: RestockSkuCommand,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateRestockOperationError'>
    | Failure<'UnrecognizedError'>
  >
}

export class DbRestockSkuClient implements IDbRestockSkuClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async restockSku(
    restockSkuCommand: RestockSkuCommand,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateRestockOperationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DbRestockSkuClient.restockSku'
    console.info(`${logContext} init:`, { restockSkuCommand })

    const buildCommandResult = this.buildDdbUpdateCommand(restockSkuCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, restockSkuCommand })
      return buildCommandResult
    }

    const ddbUpdateCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbUpdateCommand(ddbUpdateCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, restockSkuCommand })
      : console.info(`${logContext} exit success:`, { sendCommandResult, restockSkuCommand })

    return sendCommandResult
  }

  //
  //
  //
  private buildDdbUpdateCommand(
    restockSkuCommand: RestockSkuCommand,
  ): Success<TransactWriteCommand> | Failure<'InvalidArgumentsError'> {
    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.WAREHOUSE_TABLE_NAME
      const { sku, units, lotId, createdAt, updatedAt } = restockSkuCommand.restockSkuData
      const ddbUpdateCommand = new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: {
                pk: `LOT_ID#${lotId}`,
                sk: `LOT_ID#${lotId}`,
                sku,
                units,
                lotId,
                createdAt,
                updatedAt,
                _tn: 'WAREHOUSE#LOT',
              },
              ConditionExpression: 'attribute_not_exists(pk)',
            },
          },
          {
            Update: {
              TableName: tableName,
              Key: {
                pk: `SKU#${sku}`,
                sk: `SKU#${sku}`,
              },
              UpdateExpression:
                `SET ` +
                `#sku = :sku, ` +
                `#units = if_not_exists(#units, :zero) + :units, ` +
                `#createdAt = if_not_exists(#createdAt, :createdAt), ` +
                `#updatedAt = :updatedAt, ` +
                `#_tn = :_tn`,
              ExpressionAttributeNames: {
                '#sku': 'sku',
                '#units': 'units',
                '#createdAt': 'createdAt',
                '#updatedAt': 'updatedAt',
                '#_tn': '_tn',
              },
              ExpressionAttributeValues: {
                ':sku': sku,
                ':units': units,
                ':createdAt': createdAt,
                ':updatedAt': updatedAt,
                ':zero': 0,
                ':_tn': 'WAREHOUSE#SKU',
              },
            },
          },
        ],
      })
      return Result.makeSuccess(ddbUpdateCommand)
    } catch (error) {
      const logContext = 'DbRestockSkuClient.buildDdbUpdateCommand'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, restockSkuCommand })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbUpdateCommand(
    ddbUpdateCommand: TransactWriteCommand,
  ): Promise<Success<void> | Failure<'DuplicateRestockOperationError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbRestockSkuClient.sendDdbUpdateCommand'
    console.info(`${logContext} init:`, { ddbUpdateCommand })

    try {
      await this.ddbDocClient.send(ddbUpdateCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult })
      return sendCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Duplication Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isDuplicateRestockOperationError(error)) {
        const duplicationFailure = Result.makeFailure('DuplicateRestockOperationError', error, false)
        console.error(`${logContext} exit failure:`, { duplicationFailure, ddbUpdateCommand })
        return duplicationFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbUpdateCommand })
      return unrecognizedFailure
    }
  }

  //
  //
  //
  private isDuplicateRestockOperationError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === DynamoDbUtils.CancellationReasons.ConditionalCheckFailed
  }
}
