import { z } from 'zod'
import { TypeUtilsWrapper } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderEvent } from './IncomingOrderEvent'

export interface UpdateOrderCommandInput {
  existingOrderData: OrderData
  incomingOrderEvent: IncomingOrderEvent
}

type UpdateOrderCommandData = Pick<OrderData, 'orderId' | 'orderStatus' | 'updatedAt'>

type UpdateOrderCommandProps = {
  readonly orderData: UpdateOrderCommandData
  readonly options?: Record<string, unknown>
}

export class UpdateOrderCommand implements UpdateOrderCommandProps {
  //
  //
  //
  private constructor(
    public readonly orderData: UpdateOrderCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    updateOrderCommandInput: UpdateOrderCommandInput,
  ): TypeUtilsWrapper<
    | Success<UpdateOrderCommand>
    | Failure<'InvalidArgumentsError'>
    | Failure<'ForbiddenOrderStatusTransitionError'>
    | Failure<'NotReadyOrderStatusTransitionError'>
    | Failure<'RedundantOrderStatusTransitionError'>
  > {
    const logContext = 'UpdateOrderCommand.validateAndBuild'
    console.info(`${logContext} init:`, { updateOrderCommandInput })

    const propsResult = this.buildProps(updateOrderCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, updateOrderCommandInput })
      return propsResult
    }

    const { orderData, options } = propsResult.value
    const updateOrderCommand = new UpdateOrderCommand(orderData, options)
    const updateOrderCommandResult = Result.makeSuccess(updateOrderCommand)
    console.info(`${logContext} exit success:`, { updateOrderCommandResult, updateOrderCommandInput })
    return updateOrderCommandResult
  }

  //
  //
  //
  private static buildProps(
    updateOrderCommandInput: UpdateOrderCommandInput,
  ): TypeUtilsWrapper<
    | Success<UpdateOrderCommandProps>
    | Failure<'InvalidArgumentsError'>
    | Failure<'ForbiddenOrderStatusTransitionError'>
    | Failure<'NotReadyOrderStatusTransitionError'>
    | Failure<'RedundantOrderStatusTransitionError'>
  > {
    const logContext = 'UpdateOrderCommand.buildProps'

    try {
      this.validateInput(updateOrderCommandInput)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure })
      return invalidArgsFailure
    }

    const { existingOrderData, incomingOrderEvent } = updateOrderCommandInput
    const existingOrderStatus = existingOrderData.orderStatus
    const incomingEventName = incomingOrderEvent.eventName

    const orderStatusResult = this.computeNewOrderStatus({ existingOrderStatus, incomingEventName })
    if (Result.isFailure(orderStatusResult)) {
      console.error(`${logContext} exit failure:`, { orderStatusResult, updateOrderCommandInput })
      return orderStatusResult
    }

    const updateOrderCommandProps: UpdateOrderCommandProps = {
      orderData: {
        orderId: existingOrderData.orderId,
        orderStatus: orderStatusResult.value,
        updatedAt: new Date().toISOString(),
      },
      options: {},
    }
    return Result.makeSuccess(updateOrderCommandProps)
  }

  //
  //
  //
  private static validateInput(updateOrderCommandInput: UpdateOrderCommandInput): void {
    this.validateExistingOrderData(updateOrderCommandInput.existingOrderData)
    this.validateIncomingOrderEvent(updateOrderCommandInput.incomingOrderEvent)
  }

  //
  //
  //
  private static validateExistingOrderData(existingOrderData: OrderData): void {
    z.object({
      orderId: ValueValidators.validOrderId(),
      orderStatus: ValueValidators.validOrderStatus(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    }).parse(existingOrderData)
  }

  //
  //
  //
  private static validateIncomingOrderEvent(incomingOrderEvent: IncomingOrderEvent): void {
    z.object({
      eventName: ValueValidators.validIncomingEventName(),
      eventData: z.object({
        orderId: ValueValidators.validOrderId(),
        orderStatus: ValueValidators.validOrderStatus().optional(),
        sku: ValueValidators.validSku().optional(),
        units: ValueValidators.validUnits().optional(),
        price: ValueValidators.validPrice().optional(),
        userId: ValueValidators.validUserId().optional(),
        createdAt: ValueValidators.validCreatedAt().optional(),
        updatedAt: ValueValidators.validUpdatedAt().optional(),
      }),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    }).parse(incomingOrderEvent)
  }

  //
  //
  //
  private static computeNewOrderStatus({
    existingOrderStatus,
    incomingEventName,
  }: {
    existingOrderStatus: OrderStatus
    incomingEventName: OrderEventName
  }): TypeUtilsWrapper<
    | Success<OrderStatus>
    | Failure<'ForbiddenOrderStatusTransitionError'>
    | Failure<'NotReadyOrderStatusTransitionError'>
    | Failure<'RedundantOrderStatusTransitionError'>
  > {
    //
    const forbiddenFailure = Result.makeFailure(
      'ForbiddenOrderStatusTransitionError',
      'Order status transition is forbidden (non-transient error, cannot retry)',
      false,
    )

    const redundancyFailure = Result.makeFailure(
      'RedundantOrderStatusTransitionError',
      'Order status transition is redundant (non-transient error, cannot retry)',
      false,
    )

    const notReadyFailure = Result.makeFailure(
      'NotReadyOrderStatusTransitionError',
      'Order status is not ready to transition to the new status (transient error, can retry)',
      true,
    )

    const orderStatusTransitionRules: Record<
      OrderStatus,
      Record<
        OrderEventName,
        | Success<OrderStatus>
        | Failure<'ForbiddenOrderStatusTransitionError'>
        | Failure<'NotReadyOrderStatusTransitionError'>
        | Failure<'RedundantOrderStatusTransitionError'>
      >
    > = {
      // This reads: When existing OrderStatus upon receiving OrderEventName then...
      ORDER_CREATED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenFailure,
        ORDER_CREATED_EVENT: redundancyFailure,
        ORDER_STOCK_DEPLETED_EVENT: Result.makeSuccess(OrderStatus.ORDER_STOCK_DEPLETED_STATUS),
        ORDER_STOCK_ALLOCATED_EVENT: Result.makeSuccess(OrderStatus.ORDER_STOCK_ALLOCATED_STATUS),
        ORDER_PAYMENT_REJECTED_EVENT: notReadyFailure,
        ORDER_PAYMENT_ACCEPTED_EVENT: notReadyFailure,
        ORDER_FULFILLED_EVENT: notReadyFailure,
        ORDER_PACKAGED_EVENT: notReadyFailure,
        ORDER_SHIPPED_EVENT: notReadyFailure,
        ORDER_DELIVERED_EVENT: notReadyFailure,
        ORDER_CANCELED_EVENT: Result.makeSuccess(OrderStatus.ORDER_CANCELED_STATUS),
      },
      ORDER_STOCK_DEPLETED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenFailure,
        ORDER_CREATED_EVENT: forbiddenFailure,
        ORDER_STOCK_DEPLETED_EVENT: redundancyFailure,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenFailure,
        ORDER_FULFILLED_EVENT: forbiddenFailure,
        ORDER_PACKAGED_EVENT: forbiddenFailure,
        ORDER_SHIPPED_EVENT: forbiddenFailure,
        ORDER_DELIVERED_EVENT: forbiddenFailure,
        ORDER_CANCELED_EVENT: Result.makeSuccess(OrderStatus.ORDER_CANCELED_STATUS),
      },
      ORDER_STOCK_ALLOCATED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenFailure,
        ORDER_CREATED_EVENT: forbiddenFailure,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenFailure,
        ORDER_STOCK_ALLOCATED_EVENT: redundancyFailure,
        ORDER_PAYMENT_REJECTED_EVENT: Result.makeSuccess(OrderStatus.ORDER_PAYMENT_REJECTED_STATUS),
        ORDER_PAYMENT_ACCEPTED_EVENT: Result.makeSuccess(OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS),
        ORDER_FULFILLED_EVENT: notReadyFailure,
        ORDER_PACKAGED_EVENT: notReadyFailure,
        ORDER_SHIPPED_EVENT: notReadyFailure,
        ORDER_DELIVERED_EVENT: notReadyFailure,
        ORDER_CANCELED_EVENT: Result.makeSuccess(OrderStatus.ORDER_CANCELED_STATUS),
      },
      ORDER_PAYMENT_REJECTED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenFailure,
        ORDER_CREATED_EVENT: forbiddenFailure,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenFailure,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_REJECTED_EVENT: redundancyFailure,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenFailure,
        ORDER_FULFILLED_EVENT: forbiddenFailure,
        ORDER_PACKAGED_EVENT: forbiddenFailure,
        ORDER_SHIPPED_EVENT: forbiddenFailure,
        ORDER_DELIVERED_EVENT: forbiddenFailure,
        ORDER_CANCELED_EVENT: Result.makeSuccess(OrderStatus.ORDER_CANCELED_STATUS),
      },
      ORDER_PAYMENT_ACCEPTED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenFailure,
        ORDER_CREATED_EVENT: forbiddenFailure,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenFailure,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_ACCEPTED_EVENT: redundancyFailure,
        ORDER_FULFILLED_EVENT: Result.makeSuccess(OrderStatus.ORDER_FULFILLED_STATUS),
        ORDER_PACKAGED_EVENT: notReadyFailure,
        ORDER_SHIPPED_EVENT: notReadyFailure,
        ORDER_DELIVERED_EVENT: notReadyFailure,
        ORDER_CANCELED_EVENT: Result.makeSuccess(OrderStatus.ORDER_CANCELED_STATUS),
      },
      ORDER_FULFILLED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenFailure,
        ORDER_CREATED_EVENT: forbiddenFailure,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenFailure,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenFailure,
        ORDER_FULFILLED_EVENT: redundancyFailure,
        ORDER_PACKAGED_EVENT: Result.makeSuccess(OrderStatus.ORDER_PACKAGED_STATUS),
        ORDER_SHIPPED_EVENT: notReadyFailure,
        ORDER_DELIVERED_EVENT: notReadyFailure,
        ORDER_CANCELED_EVENT: Result.makeSuccess(OrderStatus.ORDER_CANCELED_STATUS),
      },
      ORDER_PACKAGED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenFailure,
        ORDER_CREATED_EVENT: forbiddenFailure,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenFailure,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenFailure,
        ORDER_FULFILLED_EVENT: forbiddenFailure,
        ORDER_PACKAGED_EVENT: redundancyFailure,
        ORDER_SHIPPED_EVENT: Result.makeSuccess(OrderStatus.ORDER_SHIPPED_STATUS),
        ORDER_DELIVERED_EVENT: notReadyFailure,
        ORDER_CANCELED_EVENT: Result.makeSuccess(OrderStatus.ORDER_CANCELED_STATUS),
      },
      ORDER_SHIPPED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenFailure,
        ORDER_CREATED_EVENT: forbiddenFailure,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenFailure,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenFailure,
        ORDER_FULFILLED_EVENT: forbiddenFailure,
        ORDER_PACKAGED_EVENT: forbiddenFailure,
        ORDER_SHIPPED_EVENT: redundancyFailure,
        ORDER_DELIVERED_EVENT: Result.makeSuccess(OrderStatus.ORDER_DELIVERED_STATUS),
        ORDER_CANCELED_EVENT: Result.makeSuccess(OrderStatus.ORDER_CANCELED_STATUS),
      },
      ORDER_DELIVERED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenFailure,
        ORDER_CREATED_EVENT: forbiddenFailure,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenFailure,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenFailure,
        ORDER_FULFILLED_EVENT: forbiddenFailure,
        ORDER_PACKAGED_EVENT: forbiddenFailure,
        ORDER_SHIPPED_EVENT: forbiddenFailure,
        ORDER_DELIVERED_EVENT: redundancyFailure,
        ORDER_CANCELED_EVENT: Result.makeSuccess(OrderStatus.ORDER_CANCELED_STATUS),
      },
      ORDER_CANCELED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenFailure,
        ORDER_CREATED_EVENT: forbiddenFailure,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenFailure,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenFailure,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenFailure,
        ORDER_FULFILLED_EVENT: forbiddenFailure,
        ORDER_PACKAGED_EVENT: forbiddenFailure,
        ORDER_SHIPPED_EVENT: forbiddenFailure,
        ORDER_DELIVERED_EVENT: forbiddenFailure,
        ORDER_CANCELED_EVENT: redundancyFailure,
      },
    }

    const eventNameToOrderStatusMap = orderStatusTransitionRules[existingOrderStatus] ?? null
    const newOrderStatusResult = eventNameToOrderStatusMap?.[incomingEventName] ?? forbiddenFailure

    const logContext = 'UpdateOrderCommand.computeNewOrderStatus'
    Result.isFailure(newOrderStatusResult)
      ? console.error(`${logContext} exit failure:`, { newOrderStatusResult, existingOrderStatus, incomingEventName })
      : console.info(`${logContext} exit success:`, { newOrderStatusResult, existingOrderStatus, incomingEventName })

    return newOrderStatusResult
  }
}
