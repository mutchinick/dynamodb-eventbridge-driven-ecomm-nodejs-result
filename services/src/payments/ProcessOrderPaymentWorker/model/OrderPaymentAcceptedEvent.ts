import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentsEvent } from '../../model/PaymentsEvent'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { ValueValidators } from '../../model/ValueValidators'

export type OrderPaymentAcceptedEventInput = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderPaymentAcceptedEventData = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderPaymentAcceptedEventProps = PaymentsEvent<
  PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
  OrderPaymentAcceptedEventData
>

/**
 *
 */
export class OrderPaymentAcceptedEvent implements OrderPaymentAcceptedEventProps {
  /**
   *
   */
  private constructor(
    public readonly eventName: PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
    public readonly eventData: OrderPaymentAcceptedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    orderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput,
  ): Success<OrderPaymentAcceptedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderPaymentAcceptedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderPaymentAcceptedEventInput })

    const propsResult = this.buildProps(orderPaymentAcceptedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, orderPaymentAcceptedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const orderPaymentAcceptedEvent = new OrderPaymentAcceptedEvent(eventName, eventData, createdAt, updatedAt)
    const orderPaymentAcceptedEventResult = Result.makeSuccess(orderPaymentAcceptedEvent)
    console.info(`${logContext} exit success:`, { orderPaymentAcceptedEventResult })
    return orderPaymentAcceptedEventResult
  }

  /**
   *
   */
  private static buildProps(
    orderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput,
  ): Success<OrderPaymentAcceptedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(orderPaymentAcceptedEventInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sku, units, price, userId } = orderPaymentAcceptedEventInput
    const currentDate = new Date().toISOString()
    const orderPaymentAcceptedEventProps: OrderPaymentAcceptedEventProps = {
      eventName: PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
      eventData: { orderId, sku, units, price, userId },
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    return Result.makeSuccess(orderPaymentAcceptedEventProps)
  }

  /**
   *
   */
  private static validateInput(
    orderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderPaymentAcceptedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderPaymentAcceptedEventInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, orderPaymentAcceptedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderPaymentAcceptedEventInput })
      return invalidArgsFailure
    }
  }
}
