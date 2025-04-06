import { Failure, Result, Success } from '../../errors/Result'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
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

    const getOrderAllocationResult = await this.getOrderAllocation(incomingOrderPaymentRejectedEvent)
    if (Result.isFailure(getOrderAllocationResult)) {
      console.error(`${logContext} exit failure:`, { getOrderAllocationResult, incomingOrderPaymentRejectedEvent })
      return getOrderAllocationResult
    }

    const existingOrderAllocationData = getOrderAllocationResult.value
    const deallocateOrderResult = await this.deallocateOrder(
      existingOrderAllocationData,
      incomingOrderPaymentRejectedEvent,
    )

    Result.isFailure(deallocateOrderResult)
      ? console.error(`${logContext} exit failure:`, {
          deallocateOrderResult,
          existingOrderAllocationData,
          incomingOrderPaymentRejectedEvent,
        })
      : console.info(`${logContext} exit success:`, { deallocateOrderResult })

    return deallocateOrderResult
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
  ): Promise<Success<AllocateOrderStockData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
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
      : console.info(`${logContext} exit success:`, { getOrderAllocationResult })

    return getOrderAllocationResult
  }

  //
  //
  //
  private async deallocateOrder(
    existingOrderAllocationData: AllocateOrderStockData,
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
      console.error(`${logContext} exit failure:`, {
        buildDeallocateCommandResult,
        existingOrderAllocationData,
        incomingOrderPaymentRejectedEvent,
      })
      return buildDeallocateCommandResult
    }

    const deallocateCommand = buildDeallocateCommandResult.value
    const deallocateResult = await this.dbDeallocateOrderPaymentRejectedClient.deallocateOrderStock(deallocateCommand)

    Result.isFailure(deallocateResult)
      ? console.error(`${logContext} exit failure:`, {
          deallocateResult,
          existingOrderAllocationData,
          incomingOrderPaymentRejectedEvent,
        })
      : console.info(`${logContext} exit success:`, { deallocateResult })

    return deallocateResult
  }
}
