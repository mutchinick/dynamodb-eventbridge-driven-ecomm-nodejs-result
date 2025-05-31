import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { IDbCreateOrderClient } from '../DbCreateOrderClient/DbCreateOrderClient'
import { IDbGetOrderClient } from '../DbGetOrderClient/DbGetOrderClient'
import { IDbUpdateOrderClient } from '../DbUpdateOrderClient/DbUpdateOrderClient'
import { IEsRaiseOrderCreatedEventClient } from '../EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { CreateOrderCommand, CreateOrderCommandInput } from '../model/CreateOrderCommand'
import { GetOrderCommand, GetOrderCommandInput } from '../model/GetOrderCommand'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { OrderCreatedEvent, OrderCreatedEventInput } from '../model/OrderCreatedEvent'
import { UpdateOrderCommand, UpdateOrderCommandInput } from '../model/UpdateOrderCommand'

export interface ISyncOrderWorkerService {
  syncOrder: (
    incomingOrderEvent: IncomingOrderEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidOperationError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'ForbiddenOrderStatusTransitionError'>
    | Failure<'StaleOrderStatusTransitionError'>
    | Failure<'RedundantOrderStatusTransitionError'>
    | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class SyncOrderWorkerService implements ISyncOrderWorkerService {
  /**
   *
   */
  constructor(
    private readonly dbGetOrderClient: IDbGetOrderClient,
    private readonly dbCreateOrderClient: IDbCreateOrderClient,
    private readonly dbUpdateOrderClient: IDbUpdateOrderClient,
    private readonly esRaiseOrderCreatedEventClient: IEsRaiseOrderCreatedEventClient,
  ) {}

  /**
   *
   */
  public async syncOrder(
    incomingOrderEvent: IncomingOrderEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidOperationError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'ForbiddenOrderStatusTransitionError'>
    | Failure<'StaleOrderStatusTransitionError'>
    | Failure<'RedundantOrderStatusTransitionError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'SyncOrderWorkerService.syncOrder'
    console.info(`${logContext} init:`, { incomingOrderEvent })

    // This is one of those methods that is long and ugly, I have explored some ways to make it more readable,
    // and have liked some of them, but for now I have decided to keep it as is: verbose with naming, verbose
    // with error handling and verbose with logging. Also not a big fan of the comments =).
    // At some point I come back to it and shorten contextualized names, use helpers to clean up logging, etc.

    // The input IncomingOrderEvent should already be valid because it can only be built through the same
    // IncomingOrderEvent class which enforces strict validation. Still it performs just enough validation to
    // prevent unlikely but still possible "exceptions" for some properties that are accessed directly.

    const inputValidationResult = this.validateInput(incomingOrderEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingOrderEvent })
      return inputValidationResult
    }

    const getOrderResult = await this.getOrder(incomingOrderEvent)
    if (Result.isFailure(getOrderResult)) {
      console.error(`${logContext} exit failure:`, { getOrderResult, incomingOrderEvent })
      return getOrderResult
    }

    const existingOrderData = getOrderResult.value
    const isOrderPlacedEvent = IncomingOrderEvent.isOrderPlacedEvent(incomingOrderEvent)

    // When IT IS an OrderPlacedEvent and the OrderData DOES NOT exist in the database then it needs to
    // create the Order and then raise the event. This is the starting point for the Order.
    if (isOrderPlacedEvent && !existingOrderData) {
      const createOrderResult = await this.createOrder(incomingOrderEvent)
      if (Result.isFailure(createOrderResult)) {
        console.error(`${logContext} exit failure:`, { createOrderResult, incomingOrderEvent })
        return createOrderResult
      }

      const createdOrderData = createOrderResult.value
      const raiseEventResult = await this.raiseOrderCreatedEvent(createdOrderData)
      if (Result.isFailure(raiseEventResult)) {
        console.error(`${logContext} exit failure:`, { raiseEventResult, createdOrderData, incomingOrderEvent })
        return raiseEventResult
      }

      console.info(`${logContext} exit success:`, { raiseEventResult, createdOrderData, incomingOrderEvent })
      return Result.makeSuccess()
    }

    // When IT IS an OrderPlacedEvent and the OrderData DOES exist in the database, it only tries
    // to raise the event again because the intuition is that is was tried before but it failed.
    if (isOrderPlacedEvent && existingOrderData) {
      const raiseEventResult = await this.raiseOrderCreatedEvent(existingOrderData)
      if (Result.isFailure(raiseEventResult)) {
        console.error(`${logContext} exit failure:`, { raiseEventResult, existingOrderData, incomingOrderEvent })
        return raiseEventResult
      }

      console.info(`${logContext} exit success:`, { raiseEventResult, existingOrderData, incomingOrderEvent })
      return Result.makeSuccess()
    }

    // When IT IS NOT an OrderPlacedEvent and the OrderData DOES exist in the database, then it needs to
    // update the Order to a new state. No event needs to be raised because it is in tracking mode.
    if (!isOrderPlacedEvent && existingOrderData) {
      const updateOrderResult = await this.updateOrder(existingOrderData, incomingOrderEvent)
      if (Result.isFailure(updateOrderResult)) {
        console.error(`${logContext} exit failure:`, { updateOrderResult, existingOrderData, incomingOrderEvent })
        return updateOrderResult
      }

      console.info(`${logContext} exit success:`, { updateOrderResult, existingOrderData, incomingOrderEvent })
      return Result.makeSuccess()
    }

    // When IT IS NOT an OrderPlacedEvent and the OrderData DOES NOT exist in the database.
    // This means it reached an invalid operation somehow, so it must return an error.
    const invalidOpsFailure = Result.makeFailure('InvalidOperationError', 'Order to update does not exist', false)
    console.error(`${logContext} exit failure:`, { invalidOpsFailure, existingOrderData, incomingOrderEvent })
    return invalidOpsFailure
  }

  /**
   *
   */
  private validateInput(incomingOrderEvent: IncomingOrderEvent): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'SyncOrderWorkerService.validateInput'

    if (
      incomingOrderEvent instanceof IncomingOrderEvent === false ||
      incomingOrderEvent == null ||
      incomingOrderEvent.eventName == null ||
      incomingOrderEvent.eventData?.orderId == null
    ) {
      const errorMessage = `Expected IncomingOrderEvent but got ${incomingOrderEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async getOrder(
    incomingOrderEvent: IncomingOrderEvent,
  ): Promise<Success<OrderData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'SyncOrderWorkerService.getOrder'
    console.info(`${logContext} init:`, { incomingOrderEvent })

    const { orderId } = incomingOrderEvent.eventData
    const getOrderCommandInput: GetOrderCommandInput = { orderId }
    const getOrderCommandResult = GetOrderCommand.validateAndBuild(getOrderCommandInput)
    if (Result.isFailure(getOrderCommandResult)) {
      console.error(`${logContext} exit failure:`, { getOrderCommandResult, getOrderCommandInput })
      return getOrderCommandResult
    }

    const getOrderCommand = getOrderCommandResult.value
    const getOrderResult = await this.dbGetOrderClient.getOrder(getOrderCommand)
    Result.isFailure(getOrderResult)
      ? console.error(`${logContext} exit failure:`, { getOrderResult, getOrderCommand })
      : console.info(`${logContext} exit success:`, { getOrderResult, getOrderCommand })

    return getOrderResult
  }

  /**
   *
   */
  private async createOrder(
    incomingOrderEvent: IncomingOrderEvent,
  ): Promise<
    | Success<OrderData>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidOperationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'SyncOrderWorkerService.createOrder'
    console.info(`${logContext} init:`, { incomingOrderEvent })

    const createOrderCommandInput: CreateOrderCommandInput = { incomingOrderEvent }
    const createOrderCommandResult = CreateOrderCommand.validateAndBuild(createOrderCommandInput)
    if (Result.isFailure(createOrderCommandResult)) {
      console.error(`${logContext} exit failure:`, { createOrderCommandResult, createOrderCommandInput })
      return createOrderCommandResult
    }

    const createOrderCommand = createOrderCommandResult.value
    const createOrderResult = await this.dbCreateOrderClient.createOrder(createOrderCommand)
    Result.isFailure(createOrderResult)
      ? console.error(`${logContext} exit failure:`, { createOrderResult, createOrderCommand })
      : console.info(`${logContext} exit success:`, { createOrderResult, createOrderCommand })

    return createOrderResult
  }

  /**
   *
   */
  private async raiseOrderCreatedEvent(
    createdOrderData: OrderData,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'SyncOrderWorkerService.raiseOrderCreatedEvent'
    console.info(`${logContext} init:`, { createdOrderData })

    const { orderId, sku, units, price, userId } = createdOrderData
    const orderCreatedEventInput: OrderCreatedEventInput = { orderId, sku, units, price, userId }
    const orderCreatedEventResult = OrderCreatedEvent.validateAndBuild(orderCreatedEventInput)
    if (Result.isFailure(orderCreatedEventResult)) {
      console.error(`${logContext} exit failure:`, { orderCreatedEventResult, orderCreatedEventInput })
      return orderCreatedEventResult
    }

    const orderCreatedEvent = orderCreatedEventResult.value
    const raiseEventResult = await this.esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(orderCreatedEvent)
    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, orderCreatedEvent })
      : console.info(`${logContext} exit success:`, { raiseEventResult, orderCreatedEvent })

    return raiseEventResult
  }

  /**
   *
   */
  private async updateOrder(
    existingOrderData: OrderData,
    incomingOrderEvent: IncomingOrderEvent,
  ): Promise<
    | Success<OrderData>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidOperationError'>
    | Failure<'ForbiddenOrderStatusTransitionError'>
    | Failure<'StaleOrderStatusTransitionError'>
    | Failure<'RedundantOrderStatusTransitionError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'SyncOrderWorkerService.updateOrder'
    console.info(`${logContext} init:`, { incomingOrderEvent, existingOrderData })

    const updateOrderCommandInput: UpdateOrderCommandInput = { existingOrderData, incomingOrderEvent }
    const updateOrderCommandResult = UpdateOrderCommand.validateAndBuild(updateOrderCommandInput)
    if (Result.isFailure(updateOrderCommandResult)) {
      console.error(`${logContext} exit failure:`, { updateOrderCommandResult, updateOrderCommandInput })
      return updateOrderCommandResult
    }

    const updateOrderCommand = updateOrderCommandResult.value
    const updateOrderResult = await this.dbUpdateOrderClient.updateOrder(updateOrderCommand)
    Result.isFailure(updateOrderResult)
      ? console.error(`${logContext} exit failure:`, { updateOrderResult, updateOrderCommand })
      : console.info(`${logContext} exit success:`, { updateOrderResult, updateOrderCommand })

    return updateOrderResult
  }
}
