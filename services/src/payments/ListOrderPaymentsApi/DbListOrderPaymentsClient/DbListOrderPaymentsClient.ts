import { DynamoDBDocumentClient, NativeAttributeValue, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { SortDirection } from '../../model/SortDirection'
import { ListOrderPaymentsCommand } from '../model/ListOrderPaymentsCommand'

export interface IDbListOrderPaymentsClient {
  listOrderPayments: (
    listOrderPaymentsCommand: ListOrderPaymentsCommand,
  ) => Promise<Success<OrderPaymentData[]> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

/**
 *
 */
export class DbListOrderPaymentsClient implements IDbListOrderPaymentsClient {
  public static readonly DEFAULT_LIMIT = 50
  public static readonly DEFAULT_SORT_DIRECTION = SortDirection['asc']

  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
  public async listOrderPayments(
    listOrderPaymentsCommand: ListOrderPaymentsCommand,
  ): Promise<Success<OrderPaymentData[]> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbListOrderPaymentsClient.listOrderPayments'
    console.info(`${logContext} init:`, { listOrderPaymentsCommand })

    const inputValidationResult = this.validateInput(listOrderPaymentsCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, listOrderPaymentsCommand })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbCommand(listOrderPaymentsCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, listOrderPaymentsCommand })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, listOrderPaymentsCommand })
      : console.info(`${logContext} exit success:`, { sendCommandResult, listOrderPaymentsCommand })

    return sendCommandResult
  }

  /**
   *
   */
  private validateInput(
    listOrderPaymentsCommand: ListOrderPaymentsCommand,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbListOrderPaymentsClient.validateInput'

    if (listOrderPaymentsCommand instanceof ListOrderPaymentsCommand === false) {
      const errorMessage = `Expected ListOrderPaymentsCommand but got ${listOrderPaymentsCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, listOrderPaymentsCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(
    listOrderPaymentsCommand: ListOrderPaymentsCommand,
  ): Success<QueryCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbListOrderPaymentsClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but QueryCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.PAYMENTS_TABLE_NAME

      const { orderId, sortDirection, limit } = listOrderPaymentsCommand.commandData

      let params: QueryCommandInput
      if (orderId) {
        const listPk = `PAYMENTS#ORDER_ID#${orderId}`
        const listSk = `ORDER_ID#${orderId}#PAYMENT`
        params = {
          TableName: tableName,
          KeyConditionExpression: '#pk = :pk AND #sk = :sk',
          ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk',
          },
          ExpressionAttributeValues: {
            ':pk': listPk,
            ':sk': listSk,
          },
        }
      } else {
        const listIndexName = 'gsi1pk-gsi1sk-index'
        const listGsi1pk = `PAYMENTS#PAYMENT`
        const listSortDirection = SortDirection[sortDirection] ?? DbListOrderPaymentsClient.DEFAULT_SORT_DIRECTION
        const listScanIndexForward = listSortDirection === DbListOrderPaymentsClient.DEFAULT_SORT_DIRECTION
        const listLimit = limit || DbListOrderPaymentsClient.DEFAULT_LIMIT
        params = {
          TableName: tableName,
          IndexName: listIndexName,
          KeyConditionExpression: '#gsi1pk = :gsi1pk',
          ExpressionAttributeNames: {
            '#gsi1pk': 'gsi1pk',
          },
          ExpressionAttributeValues: {
            ':gsi1pk': listGsi1pk,
          },
          ScanIndexForward: listScanIndexForward,
          Limit: listLimit,
        }
      }

      const ddbCommand = new QueryCommand(params)
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, listOrderPaymentsCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, listOrderPaymentsCommand })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(
    ddbCommand: QueryCommand,
  ): Promise<Success<OrderPaymentData[]> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbListOrderPaymentsClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbResult = await this.ddbDocClient.send(ddbCommand)
      if (!ddbResult.Items) {
        const orderPayments: OrderPaymentData[] = []
        const sendCommandResult = Result.makeSuccess(orderPayments)
        console.info(`${logContext} exit success: null-Items:`, { sendCommandResult, ddbResult, ddbCommand })
        return sendCommandResult
      } else {
        const orderPayments = this.buildOrderPaymentData(ddbResult.Items)
        const sendCommandResult = Result.makeSuccess(orderPayments)
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
  private buildOrderPaymentData(items: Record<string, NativeAttributeValue>[]): OrderPaymentData[] {
    const orderPayments: OrderPaymentData[] = items.map((item) => ({
      orderId: item.orderId,
      sku: item.sku,
      units: item.units,
      price: item.price,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      paymentId: item.paymentId,
      paymentStatus: item.paymentStatus,
      paymentRetries: item.paymentRetries,
    }))
    return orderPayments
  }
}
