import { Failure, Result, Success } from '../../errors/Result'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbCompleteOrderPaymentAcceptedClient } from '../DbCompleteOrderPaymentAcceptedClient/DbCompleteOrderPaymentAcceptedClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import {
  CompleteOrderPaymentAcceptedCommand,
  CompleteOrderPaymentAcceptedCommandInput,
} from '../model/CompleteOrderPaymentAcceptedCommand'
import { GetOrderAllocationCommand, GetOrderAllocationCommandInput } from '../model/GetOrderAllocationCommand'
import { IncomingOrderPaymentAcceptedEvent } from '../model/IncomingOrderPaymentAcceptedEvent'

export interface ICompleteOrderPaymentAcceptedWorkerService {
  completeOrder: (
    incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent,
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
export class CompleteOrderPaymentAcceptedWorkerService implements ICompleteOrderPaymentAcceptedWorkerService {
  /**
   *
   */
  constructor(
    private readonly dbGetOrderAllocationClient: IDbGetOrderAllocationClient,
    private readonly dbCompleteOrderPaymentAcceptedClient: IDbCompleteOrderPaymentAcceptedClient,
  ) {}

  /**
   *
   */
  public async completeOrder(
    incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockCompletionError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerService.completeOrder'
    console.info(`${logContext} init:`, { incomingOrderPaymentAcceptedEvent })

    const inputValidationResult = this.validateInput(incomingOrderPaymentAcceptedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingOrderPaymentAcceptedEvent })
      return inputValidationResult
    }

    // When it reads the Allocation from the database
    const getOrderAllocationResult = await this.getOrderAllocation(incomingOrderPaymentAcceptedEvent)
    if (Result.isFailure(getOrderAllocationResult)) {
      console.error(`${logContext} exit failure:`, { getOrderAllocationResult, incomingOrderPaymentAcceptedEvent })
      return getOrderAllocationResult
    }
    const orderAllocationData = getOrderAllocationResult.value

    // When the Allocation DOES exist and it completes it
    if (orderAllocationData) {
      const completeOrderAllocationResult = await this.completeOrderAllocation(
        orderAllocationData,
        incomingOrderPaymentAcceptedEvent,
      )

      if (Result.isFailure(completeOrderAllocationResult)) {
        console.error(`${logContext} exit failure:`, {
          completeOrderAllocationResult,
          orderAllocationData,
          incomingOrderPaymentAcceptedEvent,
        })
        return completeOrderAllocationResult
      }

      console.info(`${logContext} exit success:`, {
        completeOrderAllocationResult,
        orderAllocationData,
        incomingOrderPaymentAcceptedEvent,
      })
      return Result.makeSuccess()
    }

    // When the Allocation DOES NOT exist and it skips the completion
    console.info(`${logContext} exit success: skipped:`, { orderAllocationData, incomingOrderPaymentAcceptedEvent })
    return Result.makeSuccess()
  }

  /**
   *
   */
  private validateInput(
    incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerService.validateInput'
    console.info(`${logContext} init:`, { incomingOrderPaymentAcceptedEvent })

    if (incomingOrderPaymentAcceptedEvent instanceof IncomingOrderPaymentAcceptedEvent === false) {
      const errorMessage = `Expected IncomingOrderPaymentAcceptedEvent but got ${incomingOrderPaymentAcceptedEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderPaymentAcceptedEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async getOrderAllocation(
    incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent,
  ): Promise<Success<OrderAllocationData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerService.getOrderAllocation'
    console.info(`${logContext} init:`, { incomingOrderPaymentAcceptedEvent })

    const { orderId, sku } = incomingOrderPaymentAcceptedEvent.eventData
    const getOrderAllocationCommandInput: GetOrderAllocationCommandInput = { orderId, sku }
    const getOrderAllocationCommandResult = GetOrderAllocationCommand.validateAndBuild(getOrderAllocationCommandInput)
    if (Result.isFailure(getOrderAllocationCommandResult)) {
      console.error(`${logContext} exit failure:`, { getOrderAllocationCommandResult, getOrderAllocationCommandInput })
      return getOrderAllocationCommandResult
    }

    const getOrderAllocationCommand = getOrderAllocationCommandResult.value
    const getOrderAllocationResult = await this.dbGetOrderAllocationClient.getOrderAllocation(getOrderAllocationCommand)
    Result.isFailure(getOrderAllocationResult)
      ? console.error(`${logContext} exit failure:`, { getOrderAllocationResult, getOrderAllocationCommand })
      : console.info(`${logContext} exit success:`, { getOrderAllocationResult, getOrderAllocationCommand })

    return getOrderAllocationResult
  }

  /**
   *
   */
  private async completeOrderAllocation(
    existingOrderAllocationData: OrderAllocationData,
    incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockCompletionError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerService.completeOrderAllocation'
    console.info(`${logContext} init:`, { incomingOrderPaymentAcceptedEvent })

    const completeCommandInput: CompleteOrderPaymentAcceptedCommandInput = {
      existingOrderAllocationData,
      incomingOrderPaymentAcceptedEvent,
    }
    const buildCompleteCommandResult = CompleteOrderPaymentAcceptedCommand.validateAndBuild(completeCommandInput)
    if (Result.isFailure(buildCompleteCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCompleteCommandResult, completeCommandInput })
      return buildCompleteCommandResult
    }

    const completeCommand = buildCompleteCommandResult.value
    const completeResult = await this.dbCompleteOrderPaymentAcceptedClient.completeOrder(completeCommand)
    Result.isFailure(completeResult)
      ? console.error(`${logContext} exit failure:`, { completeResult, completeCommand })
      : console.info(`${logContext} exit success:`, { completeResult, completeCommand })

    return completeResult
  }
}
