import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { IDbListOrdersClient } from '../DbListOrdersClient/DbListOrdersClient'
import { IncomingListOrdersRequest } from '../model/IncomingListOrdersRequest'
import { ListOrdersCommand } from '../model/ListOrdersCommand'

export interface IListOrdersApiService {
  listOrders: (
    incomingListOrdersRequest: IncomingListOrdersRequest,
  ) => Promise<Success<ListOrdersApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export type ListOrdersApiServiceOutput = { orders: OrderData[] }

export class ListOrdersApiService implements IListOrdersApiService {
  //
  //
  //
  constructor(private readonly dbListOrdersClient: IDbListOrdersClient) {}

  //
  //
  //
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

    const ordersResult = await this.queryDatabase(incomingListOrdersRequest)
    if (Result.isFailure(ordersResult)) {
      console.error(`${logContext} exit failure:`, { ordersResult, incomingListOrdersRequest })
      return ordersResult
    }

    const orders = ordersResult.value
    const serviceOutput: ListOrdersApiServiceOutput = { orders }
    const serviceOutputResult = Result.makeSuccess(serviceOutput)
    console.info(`${logContext} exit success:`, { serviceOutputResult, incomingListOrdersRequest })
    return serviceOutputResult
  }

  //
  //
  //
  private validateInput(incomingListOrdersRequest: IncomingListOrdersRequest) {
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

  //
  //
  //
  private async queryDatabase(
    incomingListOrdersRequest: IncomingListOrdersRequest,
  ): Promise<Success<OrderData[]> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'ListOrdersApiService.queryDatabase'
    console.info(`${logContext} init:`, { incomingListOrdersRequest })

    const listOrdersCommandResult = ListOrdersCommand.validateAndBuild(incomingListOrdersRequest)
    if (Result.isFailure(listOrdersCommandResult)) {
      console.error(`${logContext} exit failure:`, { listOrdersCommandResult, incomingListOrdersRequest })
      return listOrdersCommandResult
    }

    const listOrdersCommand = listOrdersCommandResult.value
    const ordersResult = await this.dbListOrdersClient.listOrders(listOrdersCommand)
    Result.isFailure(ordersResult)
      ? console.error(`${logContext} exit failure:`, { ordersResult, incomingListOrdersRequest })
      : console.info(`${logContext} exit success:`, { ordersResult, incomingListOrdersRequest })

    return ordersResult
  }
}
