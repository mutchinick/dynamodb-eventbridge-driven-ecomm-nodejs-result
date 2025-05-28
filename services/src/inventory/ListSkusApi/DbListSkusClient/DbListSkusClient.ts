import { DynamoDBDocumentClient, NativeAttributeValue, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { SkuData } from '../../model/SkuData'
import { SortDirection } from '../../model/SortDirection'
import { ListSkusCommand } from '../model/ListSkusCommand'

export interface IDbListSkusClient {
  listSkus: (
    listSkusCommand: ListSkusCommand,
  ) => Promise<Success<SkuData[]> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

/**
 *
 */
export class DbListSkusClient implements IDbListSkusClient {
  public static readonly DEFAULT_LIMIT = 50
  public static readonly DEFAULT_SORT_DIRECTION = SortDirection['asc']

  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
  public async listSkus(
    listSkusCommand: ListSkusCommand,
  ): Promise<Success<SkuData[]> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbListSkusClient.listSkus'
    console.info(`${logContext} init:`, { listSkusCommand })

    const inputValidationResult = this.validateInput(listSkusCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, listSkusCommand })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbCommand(listSkusCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, listSkusCommand })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, listSkusCommand })
      : console.info(`${logContext} exit success:`, { sendCommandResult, listSkusCommand })

    return sendCommandResult
  }

  /**
   *
   */
  private validateInput(listSkusCommand: ListSkusCommand): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbListSkusClient.validateInput'

    if (listSkusCommand instanceof ListSkusCommand === false) {
      const errorMessage = `Expected ListSkusCommand but got ${listSkusCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, listSkusCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(listSkusCommand: ListSkusCommand): Success<QueryCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbListSkusClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but QueryCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.INVENTORY_TABLE_NAME

      const { sku, sortDirection, limit } = listSkusCommand.commandData

      let params: QueryCommandInput
      if (sku) {
        const skuListPk = `INVENTORY#SKU#${sku}`
        const skuListSk = `SKU#${sku}`
        params = {
          TableName: tableName,
          KeyConditionExpression: '#pk = :pk AND #sk = :sk',
          ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk',
          },
          ExpressionAttributeValues: {
            ':pk': skuListPk,
            ':sk': skuListSk,
          },
        }
      } else {
        const skuListIndexName = 'gsi1pk-gsi1sk-index'
        const skuListGsi1pk = `INVENTORY#SKU`
        const skuListSortDirection = SortDirection[sortDirection] ?? DbListSkusClient.DEFAULT_SORT_DIRECTION
        const skuListScanIndexForward = skuListSortDirection === DbListSkusClient.DEFAULT_SORT_DIRECTION
        const skuListLimit = limit || DbListSkusClient.DEFAULT_LIMIT
        params = {
          TableName: tableName,
          IndexName: skuListIndexName,
          KeyConditionExpression: '#gsi1pk = :gsi1pk',
          ExpressionAttributeNames: {
            '#gsi1pk': 'gsi1pk',
          },
          ExpressionAttributeValues: {
            ':gsi1pk': skuListGsi1pk,
          },
          ScanIndexForward: skuListScanIndexForward,
          Limit: skuListLimit,
        }
      }

      const ddbCommand = new QueryCommand(params)
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, listSkusCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, listSkusCommand })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(ddbCommand: QueryCommand): Promise<Success<SkuData[]> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbListSkusClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbResult = await this.ddbDocClient.send(ddbCommand)
      if (!ddbResult.Items) {
        const skus: SkuData[] = []
        const sendCommandResult = Result.makeSuccess(skus)
        console.info(`${logContext} exit success: null-Items:`, { sendCommandResult, ddbResult, ddbCommand })
        return sendCommandResult
      } else {
        const skus = this.buildSkuData(ddbResult.Items)
        const sendCommandResult = Result.makeSuccess(skus)
        console.info(`${logContext} exit success:`, { sendCommandResult, ddbResult, ddbCommand })
        return sendCommandResult
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
  private buildSkuData(items: Record<string, NativeAttributeValue>[]): SkuData[] {
    const skus: SkuData[] = items.map((item) => ({
      sku: item.sku,
      units: item.units,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
    return skus
  }
}
