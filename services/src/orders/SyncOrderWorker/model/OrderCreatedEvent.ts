import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
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
  public static validateAndBuild(
    orderCreatedEventInput: OrderCreatedEventInput,
  ): Success<OrderCreatedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderCreatedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderCreatedEventInput })

    const propsResult = this.buildProps(orderCreatedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, orderCreatedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const orderCreatedEvent = new OrderCreatedEvent(eventName, eventData, createdAt, updatedAt)
    const orderCreatedEventResult = Result.makeSuccess(orderCreatedEvent)
    console.info(`${logContext} exit success:`, { orderCreatedEventResult, orderCreatedEventInput })
    return orderCreatedEventResult
  }

  //
  //
  //
  private static buildProps(
    orderCreatedEventInput: OrderCreatedEventInput,
  ): Success<OrderCreatedEventProps> | Failure<'InvalidArgumentsError'> {
    try {
      this.validateInput(orderCreatedEventInput)
    } catch (error) {
      const logContext = 'OrderCreatedEvent.buildProps'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderCreatedEventInput })
      return invalidArgsFailure
    }

    const { orderData } = orderCreatedEventInput
    const { orderId, orderStatus, sku, units, price, userId, createdAt, updatedAt } = orderData
    const date = new Date().toISOString()
    const orderCreatedEventProps: OrderCreatedEventProps = {
      eventName: OrderEventName.ORDER_CREATED_EVENT,
      eventData: { orderId, orderStatus, sku, units, price, userId, createdAt, updatedAt },
      createdAt: date,
      updatedAt: date,
    }
    return Result.makeSuccess(orderCreatedEventProps)
  }

  //
  //
  //
  private static validateInput(orderCreatedEventInput: OrderCreatedEventInput): void {
    z.object({
      incomingEventName: ValueValidators.validOrderPlacedEventName(),
      orderData: z.object({
        orderId: ValueValidators.validOrderId(),
        orderStatus: ValueValidators.validOrderStatus(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      }),
    }).parse(orderCreatedEventInput)
  }
}
