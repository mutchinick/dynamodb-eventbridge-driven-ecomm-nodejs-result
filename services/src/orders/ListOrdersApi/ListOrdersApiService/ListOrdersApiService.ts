import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { IDbListOrdersClient } from '../DbListOrdersClient/DbListOrdersClient'
import { IncomingListOrdersRequest } from '../model/IncomingListOrdersRequest'
import { ListOrdersCommand, ListOrdersCommandInput } from '../model/ListOrdersCommand'

export interface IListOrdersApiService {
  listOrders: (
    incomingListOrdersRequest: IncomingListOrdersRequest,
  ) => Promise<Success<ListOrdersApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export type ListOrdersApiServiceOutput = { orders: OrderData[] }

/**
 *
 */
export class ListOrdersApiService implements IListOrdersApiService {
  /**
   *
   */
  constructor(private readonly dbListOrdersClient: IDbListOrdersClient) {}

  /**
   *
   */
  public async listOrders(
    incomingListOrdersRequest: IncomingListOrdersRequest,
  ): Promise<Success<ListOrdersApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'ListOrdersApiService.listOrders'
    console.info(`${logContext} init:`, { incomingListOrdersRequest })

    const inputValidationResult = this.validateInput(incomingListOrdersRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingListOrdersRequest })
      return inputValidationResult
    }

    const queryOrdersResult = await this.queryOrders(incomingListOrdersRequest)
    if (Result.isFailure(queryOrdersResult)) {
      console.error(`${logContext} exit failure:`, { queryOrdersResult, incomingListOrdersRequest })
      return queryOrdersResult
    }

    const orders = queryOrdersResult.value
    const serviceOutput: ListOrdersApiServiceOutput = { orders }
    const serviceOutputResult = Result.makeSuccess(serviceOutput)
    console.info(`${logContext} exit success:`, { serviceOutputResult, incomingListOrdersRequest })
    return serviceOutputResult
  }

  /**
   *
   */
  private validateInput(
    incomingListOrdersRequest: IncomingListOrdersRequest,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListOrdersApiService.validateInput'
    console.info(`${logContext} init:`, { incomingListOrdersRequest })

    if (incomingListOrdersRequest instanceof IncomingListOrdersRequest === false) {
      const errorMessage = `Expected IncomingListOrdersRequest but got ${incomingListOrdersRequest}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingListOrdersRequest })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async queryOrders(
    incomingListOrdersRequest: IncomingListOrdersRequest,
  ): Promise<Success<OrderData[]> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'ListOrdersApiService.queryOrders'
    console.info(`${logContext} init:`, { incomingListOrdersRequest })

    const { orderId, sortDirection, limit } = incomingListOrdersRequest
    const listOrdersCommandInput: ListOrdersCommandInput = { orderId, sortDirection, limit }
    const listOrdersCommandResult = ListOrdersCommand.validateAndBuild(listOrdersCommandInput)
    if (Result.isFailure(listOrdersCommandResult)) {
      console.error(`${logContext} exit failure:`, { listOrdersCommandResult, listOrdersCommandInput })
      return listOrdersCommandResult
    }

    const listOrdersCommand = listOrdersCommandResult.value
    const listOrdersResult = await this.dbListOrdersClient.listOrders(listOrdersCommand)
    Result.isFailure(listOrdersResult)
      ? console.error(`${logContext} exit failure:`, { listOrdersResult, listOrdersCommand })
      : console.info(`${logContext} exit success:`, { listOrdersResult, listOrdersCommand })

    return listOrdersResult
  }
}
