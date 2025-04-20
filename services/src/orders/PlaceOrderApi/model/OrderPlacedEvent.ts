import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderEvent } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
import { ValueValidators } from '../../model/ValueValidators'

export type OrderPlacedEventInput = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

type OrderPlacedEventData = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

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
  public static validateAndBuild(
    orderPlacedEventInput: OrderPlacedEventInput,
  ): Success<OrderPlacedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderPlacedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderPlacedEventInput })

    const propsResult = this.buildProps(orderPlacedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, orderPlacedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const orderPlacedEvent = new OrderPlacedEvent(eventName, eventData, createdAt, updatedAt)
    const orderPlacedEventResult = Result.makeSuccess(orderPlacedEvent)
    console.info(`${logContext} exit success:`, { orderPlacedEventResult, orderPlacedEventInput })
    return orderPlacedEventResult
  }

  //
  //
  //
  private static buildProps(
    orderPlacedEventInput: OrderPlacedEventInput,
  ): Success<OrderPlacedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(orderPlacedEventInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sku, units, price, userId } = orderPlacedEventInput
    const date = new Date().toISOString()
    const orderPlacedEventData: OrderPlacedEventData = { orderId, sku, units, price, userId }
    const orderPlacedEventProps: OrderPlacedEventProps = {
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: orderPlacedEventData,
      createdAt: date,
      updatedAt: date,
    }
    return Result.makeSuccess(orderPlacedEventProps)
  }

  //
  //
  //
  private static validateInput(
    orderPlacedEventInput: OrderPlacedEventData,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderPlacedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderPlacedEventInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, orderPlacedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, orderPlacedEventInput })
      return invalidArgsFailure
    }
  }
}
