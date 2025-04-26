import { Failure, Result, Success } from '../../errors/Result'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbDeallocateOrderPaymentRejectedClient } from '../DbDeallocateOrderPaymentRejectedClient/DbDeallocateOrderPaymentRejectedClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import {
  DeallocateOrderPaymentRejectedCommand,
  DeallocateOrderPaymentRejectedCommandInput,
} from '../model/DeallocateOrderPaymentRejectedCommand'
import { GetOrderAllocationCommand, GetOrderAllocationCommandInput } from '../model/GetOrderAllocationCommand'
import { IncomingOrderPaymentRejectedEvent } from '../model/IncomingOrderPaymentRejectedEvent'

export interface IDeallocateOrderPaymentRejectedWorkerService {
  deallocateOrderStock: (
    incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockDeallocationError'>
    | Failure<'UnrecognizedError'>
  >
}

//
//
//
export class DeallocateOrderPaymentRejectedWorkerService implements IDeallocateOrderPaymentRejectedWorkerService {
  //
  //
  //
  constructor(
    private readonly dbGetOrderAllocationClient: IDbGetOrderAllocationClient,
    private readonly dbDeallocateOrderPaymentRejectedClient: IDbDeallocateOrderPaymentRejectedClient,
  ) {}

  //
  //
  //
  public async deallocateOrderStock(
    incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockDeallocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock'
    console.info(`${logContext} init:`, { incomingOrderPaymentRejectedEvent })

    const inputValidationResult = this.validateInput(incomingOrderPaymentRejectedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingOrderPaymentRejectedEvent })
      return inputValidationResult
    }

    // When it reads the Allocation from the database
    const getOrderAllocationResult = await this.getOrderAllocation(incomingOrderPaymentRejectedEvent)
    if (Result.isFailure(getOrderAllocationResult)) {
      console.error(`${logContext} exit failure:`, { getOrderAllocationResult, incomingOrderPaymentRejectedEvent })
      return getOrderAllocationResult
    }
    const orderAllocationData = getOrderAllocationResult.value

    // When the Allocation DOES exist and it deallocates it
    if (orderAllocationData) {
      const deallocateOrderResult = await this.deallocateOrder(orderAllocationData, incomingOrderPaymentRejectedEvent)

      if (Result.isFailure(deallocateOrderResult)) {
        console.error(`${logContext} exit failure:`, {
          deallocateOrderResult,
          orderAllocationData,
          incomingOrderPaymentRejectedEvent,
        })
        return deallocateOrderResult
      }

      console.info(`${logContext} exit success:`, {
        deallocateOrderResult,
        orderAllocationData,
        incomingOrderPaymentRejectedEvent,
      })
      return Result.makeSuccess()
    }

    // When the Allocation DOES NOT exist and it skips the deallocation
    console.info(`${logContext} exit success: skipped:`, { orderAllocationData, incomingOrderPaymentRejectedEvent })
    return Result.makeSuccess()
  }

  //
  //
  //
  private validateInput(
    incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerService.validateInput'
    console.info(`${logContext} init:`, { incomingOrderPaymentRejectedEvent })

    if (incomingOrderPaymentRejectedEvent instanceof IncomingOrderPaymentRejectedEvent === false) {
      const errorMessage = `Expected IncomingOrderPaymentRejectedEvent but got ${incomingOrderPaymentRejectedEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderPaymentRejectedEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private async getOrderAllocation(
    incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
  ): Promise<Success<OrderAllocationData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerService.getOrderAllocation'
    console.info(`${logContext} init:`, { incomingOrderPaymentRejectedEvent })

    const { orderId, sku } = incomingOrderPaymentRejectedEvent.eventData
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

  //
  //
  //
  private async deallocateOrder(
    existingOrderAllocationData: OrderAllocationData,
    incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidStockDeallocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerService.deallocateOrder'
    console.info(`${logContext} init:`, { incomingOrderPaymentRejectedEvent })

    const deallocateCommandInput: DeallocateOrderPaymentRejectedCommandInput = {
      existingOrderAllocationData,
      incomingOrderPaymentRejectedEvent,
    }
    const buildDeallocateCommandResult = DeallocateOrderPaymentRejectedCommand.validateAndBuild(deallocateCommandInput)
    if (Result.isFailure(buildDeallocateCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildDeallocateCommandResult, deallocateCommandInput })
      return buildDeallocateCommandResult
    }

    const deallocateCommand = buildDeallocateCommandResult.value
    const deallocateResult = await this.dbDeallocateOrderPaymentRejectedClient.deallocateOrderStock(deallocateCommand)
    Result.isFailure(deallocateResult)
      ? console.error(`${logContext} exit failure:`, { deallocateResult, deallocateCommand })
      : console.info(`${logContext} exit success:`, { deallocateResult, deallocateCommand })

    return deallocateResult
  }
}
