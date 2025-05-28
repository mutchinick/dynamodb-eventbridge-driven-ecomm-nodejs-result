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

/**
 *
 */
export class DbRestockSkuClient implements IDbRestockSkuClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
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

    const inputValidationResult = this.validateInput(restockSkuCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, restockSkuCommand })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbCommand(restockSkuCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, restockSkuCommand })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, restockSkuCommand })
      : console.info(`${logContext} exit success:`, { sendCommandResult, restockSkuCommand })

    return sendCommandResult
  }

  /**
   *
   */
  private validateInput(restockSkuCommand: RestockSkuCommand): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbRestockSkuClient.validateInput'

    if (restockSkuCommand instanceof RestockSkuCommand === false) {
      const errorMessage = `Expected RestockSkuCommand but got ${restockSkuCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, restockSkuCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(
    restockSkuCommand: RestockSkuCommand,
  ): Success<TransactWriteCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbRestockSkuClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.INVENTORY_TABLE_NAME

      const { sku, units, lotId, createdAt, updatedAt } = restockSkuCommand.commandData

      const restockPk = `INVENTORY#SKU#${sku}`
      const restockSk = `LOT_ID#${lotId}`
      const restockTn = `INVENTORY#RESTOCK_SKU`
      const restockSn = `INVENTORY`
      const restockGsi1Pk = `INVENTORY#RESTOCK_SKU`
      const restockGsi1Sk = `CREATED_AT#${createdAt}`

      const skuItemPk = `INVENTORY#SKU#${sku}`
      const skuItemSk = `SKU#${sku}`
      const skuItemTn = `INVENTORY#SKU`
      const skuItemSn = `INVENTORY`
      const skuItemGsi1Pk = `INVENTORY#SKU`
      const skuItemGsi1Sk = `CREATED_AT#${createdAt}`

      const ddbCommand = new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: {
                pk: restockPk,
                sk: restockSk,
                sku,
                units,
                lotId,
                createdAt,
                updatedAt,
                _tn: restockTn,
                _sn: restockSn,
                gsi1pk: restockGsi1Pk,
                gsi1sk: restockGsi1Sk,
              },
              ConditionExpression: 'attribute_not_exists(pk)',
            },
          },
          {
            Update: {
              TableName: tableName,
              Key: {
                pk: skuItemPk,
                sk: skuItemSk,
              },
              UpdateExpression:
                `SET ` +
                `#sku = :sku, ` +
                `#units = if_not_exists(#units, :zero) + :units, ` +
                `#createdAt = if_not_exists(#createdAt, :createdAt), ` +
                `#updatedAt = :updatedAt, ` +
                `#_tn = :_tn, ` +
                `#_sn = :_sn, ` +
                `#gsi1pk = :gsi1pk, ` +
                `#gsi1sk = :gsi1sk`,
              ExpressionAttributeNames: {
                '#sku': 'sku',
                '#units': 'units',
                '#createdAt': 'createdAt',
                '#updatedAt': 'updatedAt',
                '#_tn': '_tn',
                '#_sn': '_sn',
                '#gsi1pk': 'gsi1pk',
                '#gsi1sk': 'gsi1sk',
              },
              ExpressionAttributeValues: {
                ':sku': sku,
                ':units': units,
                ':createdAt': createdAt,
                ':updatedAt': updatedAt,
                ':zero': 0,
                ':_tn': skuItemTn,
                ':_sn': skuItemSn,
                ':gsi1pk': skuItemGsi1Pk,
                ':gsi1sk': skuItemGsi1Sk,
              },
            },
          },
        ],
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, restockSkuCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, restockSkuCommand })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(
    ddbCommand: TransactWriteCommand,
  ): Promise<Success<void> | Failure<'DuplicateRestockOperationError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbRestockSkuClient.sendDdbCommand'
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
      if (this.isDuplicateRestockOperationError(error)) {
        const duplicationFailure = Result.makeFailure('DuplicateRestockOperationError', error, false)
        console.error(`${logContext} exit failure:`, { duplicationFailure, ddbCommand })
        return duplicationFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
    }
  }

  /**
   *
   */
  private isDuplicateRestockOperationError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === DynamoDbUtils.CancellationReasons.ConditionalCheckFailed
  }
}
