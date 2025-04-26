import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderEvent } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
import { ValueValidators } from '../../model/ValueValidators'

export type OrderCreatedEventInput = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

type OrderCreatedEventData = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

type OrderCreatedEventProps = OrderEvent<string, OrderCreatedEventData>

/**
 *
 */
export class OrderCreatedEvent implements OrderCreatedEventProps {
  /**
   *
   */
  private constructor(
    public readonly eventName: string,
    public readonly eventData: OrderCreatedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   *
   */
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

  /**
   *
   */
  private static buildProps(
    orderCreatedEventInput: OrderCreatedEventInput,
  ): Success<OrderCreatedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(orderCreatedEventInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sku, units, price, userId } = orderCreatedEventInput
    const currentDate = new Date().toISOString()
    const orderCreatedEventProps: OrderCreatedEventProps = {
      eventName: OrderEventName.ORDER_CREATED_EVENT,
      eventData: { orderId, sku, units, price, userId },
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    return Result.makeSuccess(orderCreatedEventProps)
  }

  /**
   *
   */
  private static validateInput(
    orderCreatedEventInput: OrderCreatedEventInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderCreatedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderCreatedEventInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, orderCreatedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderCreatedEventInput })
      return invalidArgsFailure
    }
  }
}
