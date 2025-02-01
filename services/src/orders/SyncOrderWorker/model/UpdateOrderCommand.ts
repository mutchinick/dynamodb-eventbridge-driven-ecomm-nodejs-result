import { z } from 'zod'
import { OrderError } from '../../errors/OrderError'
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
  public static validateAndBuild(updateOrderCommandInput: UpdateOrderCommandInput): UpdateOrderCommand {
    try {
      const { orderData, options } = this.buildUpdateOrderCommandProps(updateOrderCommandInput)
      return new UpdateOrderCommand(orderData, options)
    } catch (error) {
      console.error('UpdateOrderCommand.validateAndBuild', { error, updateOrderCommandInput })
      throw error
    }
  }

  //
  //
  //
  private static buildUpdateOrderCommandProps(
    updateOrderCommandInput: UpdateOrderCommandInput,
  ): UpdateOrderCommandProps {
    const { existingOrderData, incomingOrderEvent } = updateOrderCommandInput
    this.validateOrderData(existingOrderData)
    this.validateOrderEvent(incomingOrderEvent)

    const existingOrderStatus = existingOrderData.orderStatus
    const incomingEventName = incomingOrderEvent.eventName
    this.validateOrderStatusTransition({ existingOrderStatus, incomingEventName })

    const orderId = existingOrderData.orderId
    const orderStatus = this.getNewOrderStatus(incomingOrderEvent.eventName)
    const updatedAt = new Date().toISOString()
    return {
      orderData: {
        orderId,
        orderStatus,
        updatedAt,
      },
      options: {},
    }
  }

  //
  //
  //
  private static validateOrderData(existingOrderData: OrderData) {
    if (!existingOrderData) {
      this.throwNotFound()
    }

    try {
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
    } catch (error) {
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }

  //
  //
  //
  private static validateOrderEvent(incomingOrderEvent: IncomingOrderEvent) {
    try {
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
    } catch (error) {
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }

  //
  //
  //
  private static validateOrderStatusTransition({
    existingOrderStatus,
    incomingEventName,
  }: {
    existingOrderStatus: OrderStatus
    incomingEventName: OrderEventName
  }) {
    // This reads: Existing OrderStatus upon receiving OrderEventName then...
    const validationRules: Record<OrderStatus, Record<OrderEventName, () => void>> = {
      ORDER_CREATED_STATUS: {
        ORDER_PLACED_EVENT: this.throwInvalid,
        ORDER_CREATED_EVENT: this.throwRedundant,
        ORDER_STOCK_DEPLETED_EVENT: this.accept,
        ORDER_STOCK_ALLOCATED_EVENT: this.accept,
        ORDER_PAYMENT_REJECTED_EVENT: this.throwNotReady,
        ORDER_PAYMENT_ACCEPTED_EVENT: this.throwNotReady,
        ORDER_FULFILLED_EVENT: this.throwNotReady,
        ORDER_PACKAGED_EVENT: this.throwNotReady,
        ORDER_SHIPPED_EVENT: this.throwNotReady,
        ORDER_DELIVERED_EVENT: this.throwNotReady,
        ORDER_CANCELED_EVENT: this.accept,
      },
      ORDER_STOCK_DEPLETED_STATUS: {
        ORDER_PLACED_EVENT: this.throwInvalid,
        ORDER_CREATED_EVENT: this.throwInvalid,
        ORDER_STOCK_DEPLETED_EVENT: this.throwRedundant,
        ORDER_STOCK_ALLOCATED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_REJECTED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_ACCEPTED_EVENT: this.throwInvalid,
        ORDER_FULFILLED_EVENT: this.throwInvalid,
        ORDER_PACKAGED_EVENT: this.throwInvalid,
        ORDER_SHIPPED_EVENT: this.throwInvalid,
        ORDER_DELIVERED_EVENT: this.throwInvalid,
        ORDER_CANCELED_EVENT: this.accept,
      },
      ORDER_STOCK_ALLOCATED_STATUS: {
        ORDER_PLACED_EVENT: this.throwInvalid,
        ORDER_CREATED_EVENT: this.throwInvalid,
        ORDER_STOCK_DEPLETED_EVENT: this.throwInvalid,
        ORDER_STOCK_ALLOCATED_EVENT: this.throwRedundant,
        ORDER_PAYMENT_REJECTED_EVENT: this.accept,
        ORDER_PAYMENT_ACCEPTED_EVENT: this.accept,
        ORDER_FULFILLED_EVENT: this.throwNotReady,
        ORDER_PACKAGED_EVENT: this.throwNotReady,
        ORDER_SHIPPED_EVENT: this.throwNotReady,
        ORDER_DELIVERED_EVENT: this.throwNotReady,
        ORDER_CANCELED_EVENT: this.accept,
      },
      ORDER_PAYMENT_REJECTED_STATUS: {
        ORDER_PLACED_EVENT: this.throwInvalid,
        ORDER_CREATED_EVENT: this.throwInvalid,
        ORDER_STOCK_DEPLETED_EVENT: this.throwInvalid,
        ORDER_STOCK_ALLOCATED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_REJECTED_EVENT: this.throwRedundant,
        ORDER_PAYMENT_ACCEPTED_EVENT: this.throwInvalid,
        ORDER_FULFILLED_EVENT: this.throwInvalid,
        ORDER_PACKAGED_EVENT: this.throwInvalid,
        ORDER_SHIPPED_EVENT: this.throwInvalid,
        ORDER_DELIVERED_EVENT: this.throwInvalid,
        ORDER_CANCELED_EVENT: this.accept,
      },
      ORDER_PAYMENT_ACCEPTED_STATUS: {
        ORDER_PLACED_EVENT: this.throwInvalid,
        ORDER_CREATED_EVENT: this.throwInvalid,
        ORDER_STOCK_DEPLETED_EVENT: this.throwInvalid,
        ORDER_STOCK_ALLOCATED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_REJECTED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_ACCEPTED_EVENT: this.throwRedundant,
        ORDER_FULFILLED_EVENT: this.accept,
        ORDER_PACKAGED_EVENT: this.throwNotReady,
        ORDER_SHIPPED_EVENT: this.throwNotReady,
        ORDER_DELIVERED_EVENT: this.throwNotReady,
        ORDER_CANCELED_EVENT: this.accept,
      },
      ORDER_FULFILLED_STATUS: {
        ORDER_PLACED_EVENT: this.throwInvalid,
        ORDER_CREATED_EVENT: this.throwInvalid,
        ORDER_STOCK_DEPLETED_EVENT: this.throwInvalid,
        ORDER_STOCK_ALLOCATED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_REJECTED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_ACCEPTED_EVENT: this.throwInvalid,
        ORDER_FULFILLED_EVENT: this.throwRedundant,
        ORDER_PACKAGED_EVENT: this.accept,
        ORDER_SHIPPED_EVENT: this.throwNotReady,
        ORDER_DELIVERED_EVENT: this.throwNotReady,
        ORDER_CANCELED_EVENT: this.accept,
      },
      ORDER_PACKAGED_STATUS: {
        ORDER_PLACED_EVENT: this.throwInvalid,
        ORDER_CREATED_EVENT: this.throwInvalid,
        ORDER_STOCK_DEPLETED_EVENT: this.throwInvalid,
        ORDER_STOCK_ALLOCATED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_REJECTED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_ACCEPTED_EVENT: this.throwInvalid,
        ORDER_FULFILLED_EVENT: this.throwInvalid,
        ORDER_PACKAGED_EVENT: this.throwRedundant,
        ORDER_SHIPPED_EVENT: this.accept,
        ORDER_DELIVERED_EVENT: this.throwNotReady,
        ORDER_CANCELED_EVENT: this.accept,
      },
      ORDER_SHIPPED_STATUS: {
        ORDER_PLACED_EVENT: this.throwInvalid,
        ORDER_CREATED_EVENT: this.throwInvalid,
        ORDER_STOCK_DEPLETED_EVENT: this.throwInvalid,
        ORDER_STOCK_ALLOCATED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_REJECTED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_ACCEPTED_EVENT: this.throwInvalid,
        ORDER_FULFILLED_EVENT: this.throwInvalid,
        ORDER_PACKAGED_EVENT: this.throwInvalid,
        ORDER_SHIPPED_EVENT: this.throwRedundant,
        ORDER_DELIVERED_EVENT: this.accept,
        ORDER_CANCELED_EVENT: this.accept,
      },
      ORDER_DELIVERED_STATUS: {
        ORDER_PLACED_EVENT: this.throwInvalid,
        ORDER_CREATED_EVENT: this.throwInvalid,
        ORDER_STOCK_DEPLETED_EVENT: this.throwInvalid,
        ORDER_STOCK_ALLOCATED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_REJECTED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_ACCEPTED_EVENT: this.throwInvalid,
        ORDER_FULFILLED_EVENT: this.throwInvalid,
        ORDER_PACKAGED_EVENT: this.throwInvalid,
        ORDER_SHIPPED_EVENT: this.throwInvalid,
        ORDER_DELIVERED_EVENT: this.throwRedundant,
        ORDER_CANCELED_EVENT: this.accept,
      },
      ORDER_CANCELED_STATUS: {
        ORDER_PLACED_EVENT: this.throwInvalid,
        ORDER_CREATED_EVENT: this.throwInvalid,
        ORDER_STOCK_DEPLETED_EVENT: this.throwInvalid,
        ORDER_STOCK_ALLOCATED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_REJECTED_EVENT: this.throwInvalid,
        ORDER_PAYMENT_ACCEPTED_EVENT: this.throwInvalid,
        ORDER_FULFILLED_EVENT: this.throwInvalid,
        ORDER_PACKAGED_EVENT: this.throwInvalid,
        ORDER_SHIPPED_EVENT: this.throwInvalid,
        ORDER_DELIVERED_EVENT: this.throwInvalid,
        ORDER_CANCELED_EVENT: this.throwRedundant,
      },
    }

    const orderStatusRule = validationRules[existingOrderStatus]
    const action = orderStatusRule[incomingEventName]
    action()
  }

  //
  //
  //
  private static accept() {
    return
  }

  //
  //
  //
  private static throwNotFound() {
    const error = new Error('InvalidOrderStatusTransitionError_OrderNotFound')
    OrderError.addName(error, OrderError.InvalidOrderStatusTransitionError_OrderNotFound)
    throw error
  }

  //
  //
  //
  private static throwNotReady() {
    const error = new Error('InvalidOrderStatusTransitionError_OrderNotReady')
    OrderError.addName(error, OrderError.InvalidOrderStatusTransitionError_OrderNotReady)
    throw error
  }

  //
  //
  //
  private static throwRedundant() {
    const error = new Error('InvalidOrderStatusTransitionError_Redundant')
    OrderError.addName(error, OrderError.InvalidOrderStatusTransitionError_Redundant)
    OrderError.addName(error, OrderError.DoNotRetryError)
    throw error
  }

  //
  //
  //
  private static throwInvalid() {
    const error = new Error('InvalidOrderStatusTransitionError_Forbidden')
    OrderError.addName(error, OrderError.InvalidOrderStatusTransitionError_Forbidden)
    OrderError.addName(error, OrderError.DoNotRetryError)
    throw error
  }

  //
  //
  //
  private static getNewOrderStatus(incomingEventName: OrderEventName): OrderStatus {
    // This reads: OrderEventName transitions to OrderStatus
    const rules: Record<OrderEventName, OrderStatus> = {
      ORDER_PLACED_EVENT: null,
      ORDER_CREATED_EVENT: OrderStatus.ORDER_CREATED_STATUS,
      ORDER_STOCK_DEPLETED_EVENT: OrderStatus.ORDER_STOCK_DEPLETED_STATUS,
      ORDER_STOCK_ALLOCATED_EVENT: OrderStatus.ORDER_STOCK_ALLOCATED_STATUS,
      ORDER_PAYMENT_REJECTED_EVENT: OrderStatus.ORDER_PAYMENT_REJECTED_STATUS,
      ORDER_PAYMENT_ACCEPTED_EVENT: OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS,
      ORDER_FULFILLED_EVENT: OrderStatus.ORDER_FULFILLED_STATUS,
      ORDER_PACKAGED_EVENT: OrderStatus.ORDER_PACKAGED_STATUS,
      ORDER_SHIPPED_EVENT: OrderStatus.ORDER_SHIPPED_STATUS,
      ORDER_DELIVERED_EVENT: OrderStatus.ORDER_DELIVERED_STATUS,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    }

    const newOrderStatus = rules[incomingEventName]
    if (newOrderStatus) {
      return newOrderStatus
    }

    // Untestable code since validateOrderStatusTransition catches the error first,
    // nevertheless it's safer to have it.
    const error = new Error('InvalidOrderStatusTransitionError_Forbidden')
    OrderError.addName(error, OrderError.InvalidOrderStatusTransitionError_Forbidden)
    OrderError.addName(error, OrderError.DoNotRetryError)
    throw error
  }
}
