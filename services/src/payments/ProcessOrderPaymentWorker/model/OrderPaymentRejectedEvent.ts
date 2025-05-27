import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentsEvent } from '../../model/PaymentsEvent'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { ValueValidators } from '../../model/ValueValidators'

export type OrderPaymentRejectedEventInput = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderPaymentRejectedEventData = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderPaymentRejectedEventProps = PaymentsEvent<
  PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT,
  OrderPaymentRejectedEventData
>

/**
 *
 */
export class OrderPaymentRejectedEvent implements OrderPaymentRejectedEventProps {
  /**
   *
   */
  private constructor(
    public readonly eventName: PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT,
    public readonly eventData: OrderPaymentRejectedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    orderPaymentRejectedEventInput: OrderPaymentRejectedEventInput,
  ): Success<OrderPaymentRejectedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderPaymentRejectedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderPaymentRejectedEventInput })

    const propsResult = this.buildProps(orderPaymentRejectedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, orderPaymentRejectedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const orderPaymentRejectedEvent = new OrderPaymentRejectedEvent(eventName, eventData, createdAt, updatedAt)
    const orderPaymentRejectedEventResult = Result.makeSuccess(orderPaymentRejectedEvent)
    console.info(`${logContext} exit success:`, { orderPaymentRejectedEventResult })
    return orderPaymentRejectedEventResult
  }

  /**
   *
   */
  private static buildProps(
    orderPaymentRejectedEventInput: OrderPaymentRejectedEventInput,
  ): Success<OrderPaymentRejectedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(orderPaymentRejectedEventInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sku, units, price, userId } = orderPaymentRejectedEventInput
    const currentDate = new Date().toISOString()
    const orderPaymentRejectedEventProps: OrderPaymentRejectedEventProps = {
      eventName: PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT,
      eventData: { orderId, sku, units, price, userId },
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    return Result.makeSuccess(orderPaymentRejectedEventProps)
  }

  /**
   *
   */
  private static validateInput(
    orderPaymentRejectedEventInput: OrderPaymentRejectedEventInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderPaymentRejectedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderPaymentRejectedEventInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, orderPaymentRejectedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderPaymentRejectedEventInput })
      return invalidArgsFailure
    }
  }
}
