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
  readonly commandData: UpdateOrderCommandData
  readonly options?: Record<string, unknown>
}

export class UpdateOrderCommand implements UpdateOrderCommandProps {
  //
  //
  //
  private constructor(
    public readonly commandData: UpdateOrderCommandData,
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
    | Failure<'InvalidOperationError'>
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

    const { commandData, options } = propsResult.value
    const updateOrderCommand = new UpdateOrderCommand(commandData, options)
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
    | Failure<'InvalidOperationError'>
  > {
    const inputValidationResult = this.validateInput(updateOrderCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { existingOrderData, incomingOrderEvent } = updateOrderCommandInput
    const existingOrderStatus = existingOrderData.orderStatus
    const incomingEventName = incomingOrderEvent.eventName

    const orderStatusResult = this.computeNewOrderStatus({ existingOrderStatus, incomingEventName })
    if (Result.isFailure(orderStatusResult)) {
      return orderStatusResult
    }

    const updateOrderCommandProps: UpdateOrderCommandProps = {
      commandData: {
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
  private static validateInput(updateOrderCommandInput: UpdateOrderCommandInput) {
    const logContext = 'UpdateOrderCommand.validateInput'

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
      eventName: ValueValidators.validIncomingEventName(),
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
    | Failure<'InvalidOperationError'>
  > {
    const logContext = 'UpdateOrderCommand.computeNewOrderStatus'

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

    const eventNameToOrderStatusMap = orderStatusTransitionRules[existingOrderStatus]
    const newOrderStatusResult = eventNameToOrderStatusMap?.[incomingEventName]

    if (!newOrderStatusResult) {
      const error = new Error(`Expected valid event but received "${incomingEventName}"`)
      const invalidOpsFailure = Result.makeFailure('InvalidOperationError', error, false)
      console.error(`${logContext} exit failure:`, { invalidOpsFailure, existingOrderStatus, incomingEventName })
      return invalidOpsFailure
    }

    Result.isFailure(newOrderStatusResult)
      ? console.error(`${logContext} exit failure:`, { newOrderStatusResult, existingOrderStatus, incomingEventName })
      : console.info(`${logContext} exit success:`, { newOrderStatusResult, existingOrderStatus, incomingEventName })

    return newOrderStatusResult
  }
}
