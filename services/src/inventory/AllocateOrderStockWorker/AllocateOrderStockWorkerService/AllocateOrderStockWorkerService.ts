import { IDbGetOrderAllocationClient } from '../../AllocateOrderStockWorker/DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IEsRaiseOrderStockAllocatedEventClient } from '../EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { IEsRaiseOrderStockDepletedEventClient } from '../EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'
import { AllocateOrderStockCommand, AllocateOrderStockCommandInput } from '../model/AllocateOrderStockCommand'
import { GetOrderAllocationCommand, GetOrderAllocationCommandInput } from '../model/GetOrderAllocationCommand'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { OrderStockAllocatedEvent, OrderStockAllocatedEventInput } from '../model/OrderStockAllocatedEvent'
import { OrderStockDepletedEvent, OrderStockDepletedEventInput } from '../model/OrderStockDepletedEvent'

export interface IAllocateOrderStockWorkerService {
  allocateOrderStock: (
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class AllocateOrderStockWorkerService implements IAllocateOrderStockWorkerService {
  /**
   *
   */
  constructor(
    private readonly dbGetOrderAllocationClient: IDbGetOrderAllocationClient,
    private readonly dbAllocateOrderStockClient: IDbAllocateOrderStockClient,
    private readonly esRaiseOrderStockAllocatedEventClient: IEsRaiseOrderStockAllocatedEventClient,
    private readonly esRaiseOrderStockDepletedEventClient: IEsRaiseOrderStockDepletedEventClient,
  ) {}

  /**
   *
   */
  public async allocateOrderStock(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerService.allocateOrderStock'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    // This is one of those methods that is long and ugly, I have explored some ways to make it more readable,
    // and have liked some of them, but for now I have decided to keep it as is: verbose with naming, verbose
    // with error handling and verbose with logging. Also not a big fan of the comments =).
    // At some point I come back to it and shorten contextualized names, use helpers to clean up logging, etc.

    const inputValidationResult = this.validateInput(incomingOrderCreatedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingOrderCreatedEvent })
      return inputValidationResult
    }

    // When it reads the Allocation from the database
    const getOrderAllocationResult = await this.getOrderAllocation(incomingOrderCreatedEvent)
    if (Result.isFailure(getOrderAllocationResult)) {
      console.error(`${logContext} exit failure:`, { getOrderAllocationResult, incomingOrderCreatedEvent })
      return getOrderAllocationResult
    }
    const existingOrderAllocationData = getOrderAllocationResult.value

    // When the Allocation DOES exist and it only raises the Allocated event
    if (existingOrderAllocationData) {
      const raiseAllocatedEventResult = await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
      if (Result.isFailure(raiseAllocatedEventResult)) {
        console.error(`${logContext} exit failure:`, { raiseAllocatedEventResult, incomingOrderCreatedEvent })
        return raiseAllocatedEventResult
      }
      console.info(`${logContext} exit success: skipped:`, { raiseAllocatedEventResult, incomingOrderCreatedEvent })
      return Result.makeSuccess()
    }

    // When it creates the Allocation in the database
    const allocateOrderResult = await this.allocateOrder(incomingOrderCreatedEvent)

    // When the Allocation DOES NOT exist and it creates it and raises the Allocated event
    if (Result.isSuccess(allocateOrderResult)) {
      const raiseAllocatedEventResult = await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
      if (Result.isFailure(raiseAllocatedEventResult)) {
        console.error(`${logContext} exit failure:`, { raiseAllocatedEventResult, incomingOrderCreatedEvent })
        return raiseAllocatedEventResult
      }
      console.info(`${logContext} exit success:`, { raiseAllocatedEventResult, incomingOrderCreatedEvent })
      return Result.makeSuccess()
    }

    // When the Allocation DOES NOT exist WHEN READ but was created by another instance/race condition,
    // it encounters a DuplicateStockAllocationError and it tries to the raise the Allocated event
    // because it doesn't know if the Allocated event was raised successfully when first allocated.
    if (Result.isFailureOfKind(allocateOrderResult, 'DuplicateStockAllocationError')) {
      const raiseAllocatedEventResult = await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
      if (Result.isFailure(raiseAllocatedEventResult)) {
        console.error(`${logContext} exit failure:`, { raiseAllocatedEventResult, incomingOrderCreatedEvent })
        return raiseAllocatedEventResult
      }
      console.info(`${logContext} exit success: from-error:`, {
        allocateOrderResult,
        raiseAllocatedEventResult,
        incomingOrderCreatedEvent,
      })
      return Result.makeSuccess()
    }

    // When the Allocation DOES NOT exist and there is not enough stock and it raises the Depleted event,
    // it encounters a DepletedStockAllocationError and it tries to the raise the Depleted event.
    if (Result.isFailureOfKind(allocateOrderResult, 'DepletedStockAllocationError')) {
      const raiseDepletedEventResult = await this.raiseDepletedEvent(incomingOrderCreatedEvent)
      if (Result.isFailure(raiseDepletedEventResult)) {
        console.error(`${logContext} exit failure:`, { raiseDepletedEventResult, incomingOrderCreatedEvent })
        return raiseDepletedEventResult
      }
      console.info(`${logContext} exit success: from-error:`, {
        allocateOrderResult,
        raiseDepletedEventResult,
        incomingOrderCreatedEvent,
      })
      return Result.makeSuccess()
    }

    // If it gets to this point it means there is an error it did not or do not want to account for here,
    // in which case it logs the error and returns it.
    console.error(`${logContext} exit failure:`, { allocateOrderResult, incomingOrderCreatedEvent })
    return allocateOrderResult
  }

  /**
   *
   */
  private validateInput(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'AllocateOrderStockWorkerService.validateInput'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    if (incomingOrderCreatedEvent instanceof IncomingOrderCreatedEvent === false) {
      const errorMessage = `Expected IncomingOrderCreatedEvent but got ${incomingOrderCreatedEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderCreatedEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async getOrderAllocation(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Promise<Success<OrderAllocationData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'AllocateOrderStockWorkerService.getOrderAllocation'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    const { orderId, sku } = incomingOrderCreatedEvent.eventData
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
  private async allocateOrder(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateStockAllocationError'>
    | Failure<'DepletedStockAllocationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerService.allocateOrder'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    const allocateOrderStockCommandInput: AllocateOrderStockCommandInput = { incomingOrderCreatedEvent }
    const allocateOrderStockCommandResult = AllocateOrderStockCommand.validateAndBuild(allocateOrderStockCommandInput)
    if (Result.isFailure(allocateOrderStockCommandResult)) {
      console.error(`${logContext} exit failure:`, { allocateOrderStockCommandResult, allocateOrderStockCommandInput })
      return allocateOrderStockCommandResult
    }

    const allocateOrderStockCommand = allocateOrderStockCommandResult.value
    const allocateOrderStockResult = await this.dbAllocateOrderStockClient.allocateOrderStock(allocateOrderStockCommand)
    Result.isFailure(allocateOrderStockResult)
      ? console.error(`${logContext} exit failure:`, { allocateOrderStockResult, allocateOrderStockCommand })
      : console.info(`${logContext} exit success:`, { allocateOrderStockResult, allocateOrderStockCommand })

    return allocateOrderStockResult
  }

  /**
   *
   */
  private async raiseAllocatedEvent(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerService.raiseAllocatedEvent'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    const { orderId, sku, units, price, userId } = incomingOrderCreatedEvent.eventData
    const orderStockAllocatedEventInput: OrderStockAllocatedEventInput = { orderId, sku, units, price, userId }
    const orderStockAllocatedEventResult = OrderStockAllocatedEvent.validateAndBuild(orderStockAllocatedEventInput)
    if (Result.isFailure(orderStockAllocatedEventResult)) {
      console.error(`${logContext} exit failure:`, { orderStockAllocatedEventResult, orderStockAllocatedEventInput })
      return orderStockAllocatedEventResult
    }

    const orderStockAllocatedEvent = orderStockAllocatedEventResult.value
    const raiseEventResult =
      await this.esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(orderStockAllocatedEvent)
    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, orderStockAllocatedEvent })
      : console.info(`${logContext} exit success:`, { raiseEventResult, orderStockAllocatedEvent })

    return raiseEventResult
  }

  /**
   *
   */
  private async raiseDepletedEvent(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'AllocateOrderStockWorkerService.raiseDepletedEvent'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    const { orderId, sku, units, price, userId } = incomingOrderCreatedEvent.eventData
    const orderStockDepletedEventInput: OrderStockDepletedEventInput = { orderId, sku, units, price, userId }
    const orderStockDepletedEventResult = OrderStockDepletedEvent.validateAndBuild(orderStockDepletedEventInput)
    if (Result.isFailure(orderStockDepletedEventResult)) {
      console.error(`${logContext} exit failure:`, { orderStockDepletedEventResult, orderStockDepletedEventInput })
      return orderStockDepletedEventResult
    }

    const orderStockDepletedEvent = orderStockDepletedEventResult.value
    const raiseEventResult =
      await this.esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(orderStockDepletedEvent)

    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, orderStockDepletedEvent })
      : console.info(`${logContext} exit success:`, { raiseEventResult, orderStockDepletedEvent })

    return raiseEventResult
  }
}
