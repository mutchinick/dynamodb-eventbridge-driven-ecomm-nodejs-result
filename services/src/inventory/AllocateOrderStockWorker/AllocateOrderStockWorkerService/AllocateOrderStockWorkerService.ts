import { Failure, Result, Success } from '../../errors/Result'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IEsRaiseOrderStockAllocatedEventClient } from '../EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { IEsRaiseOrderStockDepletedEventClient } from '../EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'
import { AllocateOrderStockCommand, AllocateOrderStockCommandInput } from '../model/AllocateOrderStockCommand'
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

export class AllocateOrderStockWorkerService implements IAllocateOrderStockWorkerService {
  //
  //
  //
  constructor(
    private readonly dbAllocateOrderStockClient: IDbAllocateOrderStockClient,
    private readonly esRaiseOrderStockAllocatedEventClient: IEsRaiseOrderStockAllocatedEventClient,
    private readonly esRaiseOrderStockDepletedEventClient: IEsRaiseOrderStockDepletedEventClient,
  ) {}

  //
  //
  //
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

    // This is one of those methods that is long and not pretty, but decomposing it will not be of much help,
    // because for one, it would add some indirection and deviate from the process flow making it even harder to
    // understand, also the error handling mechanism is safe but verbose, and on top of that we are very, very
    // log-happy everywhere, so we just live with it.

    const inputValidationResult = this.validateInput(incomingOrderCreatedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingOrderCreatedEvent })
      return inputValidationResult
    }

    // When it creates the Allocation, this can result in some errors that we want to handle with some specific
    // logic, like DuplicateEventRaisedError or DepletedStockAllocationError.
    const allocateOrderResult = await this.allocateOrder(incomingOrderCreatedEvent)

    // When the Allocation DID NOT exist and is created successfully, we try to the raise the Allocation event.
    if (Result.isSuccess(allocateOrderResult)) {
      const raiseAllocatedEventResult = await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
      if (Result.isFailure(raiseAllocatedEventResult)) {
        console.error(`${logContext} exit failure:`, { raiseAllocatedEventResult, incomingOrderCreatedEvent })
        return raiseAllocatedEventResult
      }
      console.info(`${logContext} exit success:`, { raiseAllocatedEventResult, incomingOrderCreatedEvent })
      return Result.makeSuccess()
    }

    // When the Allocation DID already exist we are facing a DuplicateStockAllocationError, if so then we still try
    // to the raise the event because we don't know if the event was raised successfully when first allocated.
    if (Result.isFailureOfKind(allocateOrderResult, 'DuplicateStockAllocationError')) {
      const raiseAllocatedEventResult = await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
      if (Result.isFailure(raiseAllocatedEventResult)) {
        console.error(`${logContext} exit failure:`, { raiseAllocatedEventResult, incomingOrderCreatedEvent })
        return raiseAllocatedEventResult
      }
      console.info(`${logContext} exit success: form-error:`, {
        allocateOrderResult,
        raiseAllocatedEventResult,
        incomingOrderCreatedEvent,
      })
      return Result.makeSuccess()
    }

    // When the stock for the Allocation is not enough or depleted we are facing a DepletedStockAllocationError,
    // if so then we try to raise an Order Depleted Event.
    if (Result.isFailureOfKind(allocateOrderResult, 'DepletedStockAllocationError')) {
      const raiseDepletedEventResult = await this.raiseDepletedEvent(incomingOrderCreatedEvent)
      if (Result.isFailure(raiseDepletedEventResult)) {
        console.error(`${logContext} exit failure:`, { raiseDepletedEventResult, incomingOrderCreatedEvent })
        return raiseDepletedEventResult
      }
      console.info(`${logContext} exit success: form-error:`, {
        allocateOrderResult,
        raiseDepletedEventResult,
        incomingOrderCreatedEvent,
      })
      return Result.makeSuccess()
    }

    // If we get to this point it means we have an error we did not or do not want to account for here,
    // in which case we log the error and return it.
    console.error(`${logContext} exit failure:`, { allocateOrderResult, incomingOrderCreatedEvent })
    return allocateOrderResult
  }

  //
  //
  //
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

  //
  //
  //
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

  //
  //
  //
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

  //
  //
  //
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
