import { z } from 'zod'
import { TypeUtilsPretty, TypeUtilsWrapper } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderEvent } from './IncomingOrderEvent'

export type UpdateOrderCommandInput = {
  existingOrderData: OrderData
  incomingOrderEvent: IncomingOrderEvent
}

type UpdateOrderCommandData = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'orderStatus' | 'updatedAt'>>

type UpdateOrderCommandProps = {
  readonly commandData: UpdateOrderCommandData
  readonly options?: Record<string, unknown>
}

type UpdateOrderFailureFactory = () =>
  | Failure<'ForbiddenOrderStatusTransitionError'>
  | Failure<'RedundantOrderStatusTransitionError'>
  | Failure<'StaleOrderStatusTransitionError'>

/**
 *
 */
export class UpdateOrderCommand implements UpdateOrderCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: UpdateOrderCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    updateOrderCommandInput: UpdateOrderCommandInput,
  ): TypeUtilsWrapper<
    | Success<UpdateOrderCommand>
    | Failure<'InvalidArgumentsError'>
    | Failure<'InvalidOperationError'>
    | Failure<'ForbiddenOrderStatusTransitionError'>
    | Failure<'StaleOrderStatusTransitionError'>
    | Failure<'RedundantOrderStatusTransitionError'>
  > {
    const logContext = 'this.validateAndBuild'
    console.info(`${logContext} init:`, { updateOrderCommandInput })

    const propsResult = this.buildProps(updateOrderCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, updateOrderCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const updateOrderCommand = new UpdateOrderCommand(commandData, options)
    const updateOrderCommandResult = Result.makeSuccess(updateOrderCommand)
    console.info(`${logContext} exit success:`, { updateOrderCommandResult, updateOrderCommandInput })
    return updateOrderCommandResult
  }

  /**
   *
   */
  private static buildProps(
    updateOrderCommandInput: UpdateOrderCommandInput,
  ): TypeUtilsWrapper<
    | Success<UpdateOrderCommandProps>
    | Failure<'InvalidArgumentsError'>
    | Failure<'ForbiddenOrderStatusTransitionError'>
    | Failure<'StaleOrderStatusTransitionError'>
    | Failure<'RedundantOrderStatusTransitionError'>
    | Failure<'InvalidOperationError'>
  > {
    const inputValidationResult = this.validateInput(updateOrderCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { existingOrderData, incomingOrderEvent } = updateOrderCommandInput
    const existingOrderStatus = existingOrderData.orderStatus
    const incomingEventName = incomingOrderEvent.eventName

    const newOrderStatusResult = this.computeNewOrderStatus({ existingOrderStatus, incomingEventName })
    if (Result.isFailure(newOrderStatusResult)) {
      return newOrderStatusResult
    }

    const newOrderStatus = newOrderStatusResult.value
    const currentDate = new Date().toISOString()
    const updateOrderCommandProps: UpdateOrderCommandProps = {
      commandData: {
        orderId: existingOrderData.orderId,
        orderStatus: newOrderStatus,
        updatedAt: currentDate,
      },
      options: {},
    }
    return Result.makeSuccess(updateOrderCommandProps)
  }

  /**
   *
   */
  private static validateInput(
    updateOrderCommandInput: UpdateOrderCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'this.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const existingOrderDataSchema = z.object({
      orderId: ValueValidators.validOrderId(),
      orderStatus: ValueValidators.validOrderStatus(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    })

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const incomingOrderEventSchema = z.object({
      eventName: ValueValidators.validOrderEventName(),
      eventData: z.object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
      }),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    })

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      existingOrderData: existingOrderDataSchema,
      incomingOrderEvent: incomingOrderEventSchema,
    })

    try {
      schema.parse(updateOrderCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, updateOrderCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, updateOrderCommandInput })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private static computeNewOrderStatus({
    existingOrderStatus,
    incomingEventName,
  }: {
    existingOrderStatus: OrderStatus
    incomingEventName: OrderEventName
  }): TypeUtilsWrapper<
    | Success<OrderStatus>
    | Failure<'ForbiddenOrderStatusTransitionError'>
    | Failure<'StaleOrderStatusTransitionError'>
    | Failure<'RedundantOrderStatusTransitionError'>
    | Failure<'InvalidOperationError'>
  > {
    const logContext = 'this.computeNewOrderStatus'

    const eventToStatusMap = this.orderStatusTransitionRules[existingOrderStatus]
    const statusOrFailureFactory = eventToStatusMap?.[incomingEventName]

    if (!statusOrFailureFactory) {
      // NOTE: Unreachable with current tests because of guards, but helps make the system fundamentally safe.
      const error = new Error(`Expected valid event but received "${incomingEventName}"`)
      const invalidOpsFailure = Result.makeFailure('InvalidOperationError', error, false)
      console.error(`${logContext} exit failure:`, { invalidOpsFailure, existingOrderStatus, incomingEventName })
      return invalidOpsFailure
    }

    const isErrorFactory = (val: unknown): val is UpdateOrderFailureFactory => typeof val === 'function'

    if (isErrorFactory(statusOrFailureFactory)) {
      const newOrderStatusResult = statusOrFailureFactory()
      console.error(`${logContext} exit failure:`, {
        newOrderStatusResult,
        existingOrderStatus,
        incomingEventName,
      })
      return newOrderStatusResult
    }

    const newOrderStatus = statusOrFailureFactory as OrderStatus
    const newOrderStatusResult = Result.makeSuccess(newOrderStatus)
    console.info(`${logContext} exit success:`, {
      newOrderStatusResult: statusOrFailureFactory,
      existingOrderStatus,
      incomingEventName,
    })

    return newOrderStatusResult
  }

  /**
   * ForbiddenOrderStatusTransitionError: something nasty happened upstream.
   * Transition will not be allowed nor should it be retried.
   */
  public static forbiddenFailureFactory(): Failure<'ForbiddenOrderStatusTransitionError'> {
    const error = new Error('Order status transition is forbidden (non-transient error, cannot retry)')
    return Result.makeFailure('ForbiddenOrderStatusTransitionError', error, false)
  }

  /**
   * RedundantOrderStatusTransitionError: probably a glitch happened upstream.
   * Transition will not be allowed nor should it be retried.
   */
  public static redundancyFailureFactory(): Failure<'RedundantOrderStatusTransitionError'> {
    const error = new Error('Order status transition is redundant (non-transient error, cannot retry)')
    return Result.makeFailure('RedundantOrderStatusTransitionError', error, false)
  }

  /**
   * StaleOrderStatusTransitionError: event got here late and is no longer valid.
   * Transition will not be allowed nor should it be retried.
   */
  public static staleFailureFactory(): Failure<'StaleOrderStatusTransitionError'> {
    const error = new Error('Order status transition is stale (non-transient error, cannot retry)')
    return Result.makeFailure('StaleOrderStatusTransitionError', error, false)
  }

  /**
   * Rules for transitioning order statuses based on incoming events.
   * Each order status maps to a set of events and their resulting statuses or errors.
   */
  public static readonly orderStatusTransitionRules: Record<
    OrderStatus,
    Record<OrderEventName, OrderStatus | UpdateOrderFailureFactory>
  > = {
    // This reads: When existing OrderStatus upon receiving OrderEventName then...
    ORDER_CREATED_STATUS: {
      ORDER_PLACED_EVENT: this.staleFailureFactory,
      ORDER_CREATED_EVENT: this.redundancyFailureFactory,
      ORDER_STOCK_DEPLETED_EVENT: OrderStatus.ORDER_STOCK_DEPLETED_STATUS,
      ORDER_STOCK_ALLOCATED_EVENT: OrderStatus.ORDER_STOCK_ALLOCATED_STATUS,
      ORDER_PAYMENT_REJECTED_EVENT: OrderStatus.ORDER_PAYMENT_REJECTED_STATUS,
      ORDER_PAYMENT_ACCEPTED_EVENT: OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS,
      ORDER_SHIPPED_EVENT: OrderStatus.ORDER_SHIPPED_STATUS,
      ORDER_DELIVERED_EVENT: OrderStatus.ORDER_DELIVERED_STATUS,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_STOCK_DEPLETED_STATUS: {
      ORDER_PLACED_EVENT: this.staleFailureFactory,
      ORDER_CREATED_EVENT: this.staleFailureFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.redundancyFailureFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.forbiddenFailureFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.forbiddenFailureFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.forbiddenFailureFactory,
      ORDER_SHIPPED_EVENT: this.forbiddenFailureFactory,
      ORDER_DELIVERED_EVENT: this.forbiddenFailureFactory,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_STOCK_ALLOCATED_STATUS: {
      ORDER_PLACED_EVENT: this.staleFailureFactory,
      ORDER_CREATED_EVENT: this.staleFailureFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.forbiddenFailureFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.redundancyFailureFactory,
      ORDER_PAYMENT_REJECTED_EVENT: OrderStatus.ORDER_PAYMENT_REJECTED_STATUS,
      ORDER_PAYMENT_ACCEPTED_EVENT: OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS,
      ORDER_SHIPPED_EVENT: OrderStatus.ORDER_SHIPPED_STATUS,
      ORDER_DELIVERED_EVENT: OrderStatus.ORDER_DELIVERED_STATUS,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_PAYMENT_REJECTED_STATUS: {
      ORDER_PLACED_EVENT: this.staleFailureFactory,
      ORDER_CREATED_EVENT: this.staleFailureFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.forbiddenFailureFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.staleFailureFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.redundancyFailureFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.forbiddenFailureFactory,
      ORDER_SHIPPED_EVENT: this.forbiddenFailureFactory,
      ORDER_DELIVERED_EVENT: this.forbiddenFailureFactory,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_PAYMENT_ACCEPTED_STATUS: {
      ORDER_PLACED_EVENT: this.staleFailureFactory,
      ORDER_CREATED_EVENT: this.staleFailureFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.forbiddenFailureFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.staleFailureFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.forbiddenFailureFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.redundancyFailureFactory,
      ORDER_SHIPPED_EVENT: OrderStatus.ORDER_SHIPPED_STATUS,
      ORDER_DELIVERED_EVENT: OrderStatus.ORDER_DELIVERED_STATUS,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_SHIPPED_STATUS: {
      ORDER_PLACED_EVENT: this.staleFailureFactory,
      ORDER_CREATED_EVENT: this.staleFailureFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.forbiddenFailureFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.staleFailureFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.forbiddenFailureFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.staleFailureFactory,
      ORDER_SHIPPED_EVENT: this.redundancyFailureFactory,
      ORDER_DELIVERED_EVENT: OrderStatus.ORDER_DELIVERED_STATUS,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_DELIVERED_STATUS: {
      ORDER_PLACED_EVENT: this.staleFailureFactory,
      ORDER_CREATED_EVENT: this.staleFailureFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.forbiddenFailureFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.staleFailureFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.forbiddenFailureFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.staleFailureFactory,
      ORDER_SHIPPED_EVENT: this.staleFailureFactory,
      ORDER_DELIVERED_EVENT: this.redundancyFailureFactory,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_CANCELED_STATUS: {
      ORDER_PLACED_EVENT: this.staleFailureFactory,
      ORDER_CREATED_EVENT: this.staleFailureFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.staleFailureFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.staleFailureFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.staleFailureFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.staleFailureFactory,
      ORDER_SHIPPED_EVENT: this.staleFailureFactory,
      ORDER_DELIVERED_EVENT: this.staleFailureFactory,
      ORDER_CANCELED_EVENT: this.redundancyFailureFactory,
    },
  }
}
