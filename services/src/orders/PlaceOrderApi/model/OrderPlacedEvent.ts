import { z } from 'zod'
import { OrderData } from '../../model/OrderData'
import { OrderEvent } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
import { ValueValidators } from '../../model/ValueValidators'

export type OrderPlacedEventData = Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>

export type OrderPlacedEventInput = OrderPlacedEventData

type OrderPlacedEventProps = OrderEvent<OrderEventName.ORDER_PLACED_EVENT, OrderPlacedEventData>

export class OrderPlacedEvent implements OrderPlacedEventProps {
  //
  //
  //
  private constructor(
    public readonly eventName: OrderEventName.ORDER_PLACED_EVENT,
    public readonly eventData: OrderPlacedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(orderPlacedEventInput: OrderPlacedEventInput) {
    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildOrderPlacedEventProps(orderPlacedEventInput)
      return new OrderPlacedEvent(eventName, eventData, createdAt, updatedAt)
    } catch (error) {
      console.error('OrderPlacedEvent.validateAndBuild', { error, orderPlacedEventInput })
      throw error
    }
  }

  //
  //
  //
  private static buildOrderPlacedEventProps(orderPlacedEventInput: OrderPlacedEventInput): OrderPlacedEventProps {
    const validInput = z
      .object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
      })
      .parse(orderPlacedEventInput) as OrderPlacedEventData

    const { orderId, sku, units, price, userId } = validInput
    const date = new Date().toISOString()
    const orderPlacedEventData: OrderPlacedEventData = {
      orderId,
      sku,
      units,
      price,
      userId,
    }

    return {
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: orderPlacedEventData,
      createdAt: date,
      updatedAt: date,
    }
  }
}
