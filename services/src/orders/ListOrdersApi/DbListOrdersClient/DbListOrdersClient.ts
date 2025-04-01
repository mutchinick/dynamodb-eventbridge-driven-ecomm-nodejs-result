import { DynamoDBDocumentClient, NativeAttributeValue, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { SortDirection } from '../../model/SortDirection'
import { ListOrdersCommand } from '../model/ListOrdersCommand'

export interface IDbListOrdersClient {
  listOrders: (
    listOrdersCommand: ListOrdersCommand,
  ) => Promise<Success<OrderData[]> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export class DbListOrdersClient implements IDbListOrdersClient {
  public static readonly DEFAULT_LIMIT = 50
  public static readonly DEFAULT_SORT_DIRECTION = SortDirection['asc']

  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async listOrders(
    listOrdersCommand: ListOrdersCommand,
  ): Promise<Success<OrderData[]> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbListOrdersClient.listOrders'
    console.info(`${logContext} init:`, { listOrdersCommand })

    const inputValidationResult = this.validateInput(listOrdersCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, listOrdersCommand })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbCommand(listOrdersCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, listOrdersCommand })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, listOrdersCommand })
      : console.info(`${logContext} exit success:`, { sendCommandResult, listOrdersCommand })

    return sendCommandResult
  }

  //
  //
  //
  private validateInput(listOrdersCommand: ListOrdersCommand): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbListOrdersClient.validateInput'

    if (listOrdersCommand instanceof ListOrdersCommand === false) {
      const errorMessage = `Expected ListOrdersCommand but got ${listOrdersCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, listOrdersCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private buildDdbCommand(
    listOrdersCommand: ListOrdersCommand,
  ): Success<QueryCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbListOrdersClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but QueryCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.ORDERS_TABLE_NAME

      const { orderId, sortDirection, limit } = listOrdersCommand.queryData

      let params: QueryCommandInput
      if (orderId) {
        const orderListPk = `ORDERS#ORDER_ID#${orderId}`
        const orderListSk = `ORDER_ID#${orderId}`
        params = {
          TableName: tableName,
          KeyConditionExpression: '#pk = :pk AND #sk = :sk',
          ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk',
          },
          ExpressionAttributeValues: {
            ':pk': orderListPk,
            ':sk': orderListSk,
          },
        }
      } else {
        const orderListIndexName = 'gsi1pk-gsi1sk-index'
        const orderListGsi1pk = `ORDERS#ORDER`
        const orderListSortDirection = SortDirection[sortDirection] ?? DbListOrdersClient.DEFAULT_SORT_DIRECTION
        const orderListScanIndexForward = orderListSortDirection === DbListOrdersClient.DEFAULT_SORT_DIRECTION
        const orderListLimit = limit || DbListOrdersClient.DEFAULT_LIMIT
        params = {
          TableName: tableName,
          IndexName: orderListIndexName,
          KeyConditionExpression: '#gsi1pk = :gsi1pk',
          ExpressionAttributeNames: {
            '#gsi1pk': 'gsi1pk',
          },
          ExpressionAttributeValues: {
            ':gsi1pk': orderListGsi1pk,
          },
          ScanIndexForward: orderListScanIndexForward,
          Limit: orderListLimit,
        }
      }

      const ddbCommand = new QueryCommand(params)
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, listOrdersCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, listOrdersCommand })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private async sendDdbCommand(ddbCommand: QueryCommand): Promise<Success<OrderData[]> | Failure<'UnrecognizedError'>> {
    const logContext = 'DbListOrdersClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbResult = await this.ddbDocClient.send(ddbCommand)
      if (!ddbResult.Items) {
        const orders: OrderData[] = []
        const sendCommandResult = Result.makeSuccess(orders)
        console.info(`${logContext} exit success: null-Items:`, { sendCommandResult, ddbResult, ddbCommand })
        return sendCommandResult
      } else {
        const orders = this.buildOrderData(ddbResult.Items)
        const sendCommandResult = Result.makeSuccess(orders)
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

  //
  //
  //
  private buildOrderData(items: Record<string, NativeAttributeValue>[]): OrderData[] {
    const orders: OrderData[] = items.map((item) => ({
      orderId: item.orderId,
      orderStatus: item.orderStatus,
      sku: item.sku,
      units: item.units,
      price: item.price,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
    return orders
  }
}
