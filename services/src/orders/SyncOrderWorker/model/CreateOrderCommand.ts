import { z } from 'zod'
import { OrderError } from '../../errors/OrderError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderEvent } from './IncomingOrderEvent'

export interface CreateOrderCommandInput {
  incomingOrderEvent: IncomingOrderEvent
}

type CreateOrderCommandProps = {
  readonly orderData: OrderData
  readonly options?: Record<string, unknown>
}

export class CreateOrderCommand implements CreateOrderCommandProps {
  //
  //
  //
  private constructor(
    public readonly orderData: OrderData,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(createOrderCommandInput: CreateOrderCommandInput) {
    try {
      const { orderData, options } = this.buildCreateOrderCommandProps(createOrderCommandInput)
      return new CreateOrderCommand(orderData, options)
    } catch (error) {
      console.error('CreateOrderCommand.validateAndBuild', { error, createOrderCommandInput })
      throw error
    }
  }

  //
  //
  //
  private static buildCreateOrderCommandProps(
    createOrderCommandInput: CreateOrderCommandInput,
  ): CreateOrderCommandProps {
    const { incomingOrderEvent } = createOrderCommandInput
    this.validateOrderEvent(incomingOrderEvent)

    const incomingEventData = incomingOrderEvent.eventData
    const incomingEventName = incomingOrderEvent.eventName
    const { orderId, sku, units, price, userId } = incomingEventData
    const newOrderStatus = this.getNewOrderStatus(incomingEventName)
    const currentDate = new Date().toISOString()

    const createOrderCommand: CreateOrderCommandProps = {
      orderData: {
        orderId,
        orderStatus: newOrderStatus,
        sku,
        units,
        price,
        userId,
        createdAt: currentDate,
        updatedAt: currentDate,
      },
      options: {},
    }
    return createOrderCommand
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
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          price: ValueValidators.validPrice(),
          userId: ValueValidators.validUserId(),
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
  private static getNewOrderStatus(incomingEventName: OrderEventName) {
    if (incomingEventName === OrderEventName.ORDER_PLACED_EVENT) {
      return OrderStatus.ORDER_CREATED_STATUS
    }

    const error = new Error('InvalidOrderStatusTransitionError_Forbidden')
    OrderError.addName(error, OrderError.InvalidOrderStatusTransitionError_Forbidden)
    OrderError.addName(error, OrderError.DoNotRetryError)
    throw error
  }
}
