import { z } from 'zod'
import { OrderError } from '../../errors/OrderError'
import { OrderData } from '../../model/OrderData'
import { OrderEvent, OrderEventData } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
import { ValueValidators } from '../../model/ValueValidators'

type OrderCreatedEventData = Required<OrderEventData>

export interface OrderCreatedEventInput {
  incomingEventName: OrderEventName
  orderData: OrderData
}

type OrderCreatedEventProps = OrderEvent<string, OrderCreatedEventData>

export class OrderCreatedEvent implements OrderCreatedEventProps {
  //
  //
  //
  private constructor(
    public readonly eventName: string,
    public readonly eventData: OrderCreatedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(orderCreatedEventInput: OrderCreatedEventInput) {
    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildOrderCreatedEventProps(orderCreatedEventInput)
      return new OrderCreatedEvent(eventName, eventData, createdAt, updatedAt)
    } catch (error) {
      console.error('OrderCreatedEvent.validateAndBuild', { error, orderCreatedEventInput })
      throw error
    }
  }

  //
  //
  //
  private static buildOrderCreatedEventProps(orderCreatedEventInput: OrderCreatedEventInput): OrderCreatedEventProps {
    const { orderData, incomingEventName } = orderCreatedEventInput
    this.validateOrderData(orderData)
    this.validateIncomingEventName(incomingEventName)

    const date = new Date().toISOString()
    const orderCreatedEvent: OrderCreatedEventProps = {
      eventName: OrderEventName.ORDER_CREATED_EVENT,
      eventData: {
        orderId: orderData.orderId,
        orderStatus: orderData.orderStatus,
        sku: orderData.sku,
        units: orderData.units,
        price: orderData.price,
        userId: orderData.userId,
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
      },
      createdAt: date,
      updatedAt: date,
    }

    return orderCreatedEvent
  }

  //
  //
  //
  private static validateOrderData(orderData: OrderData) {
    try {
      return z
        .object({
          orderId: ValueValidators.validOrderId(),
          orderStatus: ValueValidators.validOrderStatus(),
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          price: ValueValidators.validPrice(),
          userId: ValueValidators.validUserId(),
          createdAt: ValueValidators.validCreatedAt(),
          updatedAt: ValueValidators.validUpdatedAt(),
        })
        .strict()
        .parse(orderData) as OrderData
    } catch (error) {
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }

  //
  //
  //
  private static validateIncomingEventName(incomingOrderEventName: OrderEventName) {
    try {
      ValueValidators.validOrderPlacedEventName().parse(incomingOrderEventName)
    } catch (error) {
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }
}
