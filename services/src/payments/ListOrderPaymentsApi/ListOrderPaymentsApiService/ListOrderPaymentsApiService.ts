import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { IDbListOrderPaymentsClient } from '../DbListOrderPaymentsClient/DbListOrderPaymentsClient'
import { IncomingListOrderPaymentsRequest } from '../model/IncomingListOrderPaymentsRequest'
import { ListOrderPaymentsCommand, ListOrderPaymentsCommandInput } from '../model/ListOrderPaymentsCommand'

export interface IListOrderPaymentsApiService {
  listOrderPayments: (
    incomingListOrderPaymentsRequest: IncomingListOrderPaymentsRequest,
  ) => Promise<
    Success<ListOrderPaymentsApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>
  >
}

export type ListOrderPaymentsApiServiceOutput = { orderPayments: OrderPaymentData[] }

/**
 *
 */
export class ListOrderPaymentsApiService implements IListOrderPaymentsApiService {
  /**
   *
   */
  constructor(private readonly dbListOrderPaymentsClient: IDbListOrderPaymentsClient) {}

  /**
   *
   */
  public async listOrderPayments(
    incomingListOrderPaymentsRequest: IncomingListOrderPaymentsRequest,
  ): Promise<
    Success<ListOrderPaymentsApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>
  > {
    const logContext = 'ListOrderPaymentsApiService.listOrderPayments'
    console.info(`${logContext} init:`, { incomingListOrderPaymentsRequest })

    const inputValidationResult = this.validateInput(incomingListOrderPaymentsRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingListOrderPaymentsRequest })
      return inputValidationResult
    }

    const queryOrderPaymentsResult = await this.queryOrderPayments(incomingListOrderPaymentsRequest)
    if (Result.isFailure(queryOrderPaymentsResult)) {
      console.error(`${logContext} exit failure:`, { queryOrderPaymentsResult, incomingListOrderPaymentsRequest })
      return queryOrderPaymentsResult
    }

    const orderPayments = queryOrderPaymentsResult.value
    const serviceOutput: ListOrderPaymentsApiServiceOutput = { orderPayments }
    const serviceOutputResult = Result.makeSuccess(serviceOutput)
    console.info(`${logContext} exit success:`, { serviceOutputResult, incomingListOrderPaymentsRequest })
    return serviceOutputResult
  }

  /**
   *
   */
  private validateInput(
    incomingListOrderPaymentsRequest: IncomingListOrderPaymentsRequest,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListOrderPaymentsApiService.validateInput'
    console.info(`${logContext} init:`, { incomingListOrderPaymentsRequest })

    if (incomingListOrderPaymentsRequest instanceof IncomingListOrderPaymentsRequest === false) {
      const errorMessage = `Expected IncomingListOrderPaymentsRequest but got ${incomingListOrderPaymentsRequest}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingListOrderPaymentsRequest })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async queryOrderPayments(
    incomingListOrderPaymentsRequest: IncomingListOrderPaymentsRequest,
  ): Promise<Success<OrderPaymentData[]> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'ListOrderPaymentsApiService.queryOrderPayments'
    console.info(`${logContext} init:`, { incomingListOrderPaymentsRequest })

    const { orderId, sortDirection, limit } = incomingListOrderPaymentsRequest
    const listOrderPaymentsCommandInput: ListOrderPaymentsCommandInput = { orderId, sortDirection, limit }
    const listOrderPaymentsCommandResult = ListOrderPaymentsCommand.validateAndBuild(listOrderPaymentsCommandInput)
    if (Result.isFailure(listOrderPaymentsCommandResult)) {
      console.error(`${logContext} exit failure:`, { listOrderPaymentsCommandResult, listOrderPaymentsCommandInput })
      return listOrderPaymentsCommandResult
    }

    const listOrderPaymentsCommand = listOrderPaymentsCommandResult.value
    const listOrderPaymentsResult = await this.dbListOrderPaymentsClient.listOrderPayments(listOrderPaymentsCommand)
    Result.isFailure(listOrderPaymentsResult)
      ? console.error(`${logContext} exit failure:`, { listOrderPaymentsResult, listOrderPaymentsCommand })
      : console.info(`${logContext} exit success:`, { listOrderPaymentsResult, listOrderPaymentsCommand })

    return listOrderPaymentsResult
  }
}
