import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

// TODO: Not all events provide the full Order data
// https://github.com/mutchinick/dynamodb-eventbridge-driven-ecomm-nodejs-result/issues/2
export type OrderStockDepletedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
// export type OrderStockDepletedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units'>

export type OrderStockDepletedEventInput = OrderStockDepletedEventData

type OrderStockDepletedEventProps = WarehouseEvent<
  WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
  OrderStockDepletedEventData
>

export class OrderStockDepletedEvent implements OrderStockDepletedEventProps {
  //
  //
  //
  private constructor(
    public readonly eventName: WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
    public readonly eventData: OrderStockDepletedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    orderStockDepletedEventInput: OrderStockDepletedEventInput,
  ): Success<OrderStockDepletedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderStockDepletedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderStockDepletedEventInput })

    const propsResult = this.buildProps(orderStockDepletedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, orderStockDepletedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const orderStockDepletedEvent = new OrderStockDepletedEvent(eventName, eventData, createdAt, updatedAt)
    const orderStockDepletedEventResult = Result.makeSuccess(orderStockDepletedEvent)
    console.info(`${logContext} exit success:`, { orderStockDepletedEventResult })
    return orderStockDepletedEventResult
  }

  //
  //
  //
  private static buildProps(
    orderStockDepletedEventInput: OrderStockDepletedEventInput,
  ): Success<OrderStockDepletedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(orderStockDepletedEventInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sku, units, price, userId } = orderStockDepletedEventInput
    const date = new Date().toISOString()
    const orderStockDepletedEventData: OrderStockDepletedEventData = { orderId, sku, units, price, userId }
    const orderStockDepletedEventProps: OrderStockDepletedEventProps = {
      eventName: WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
      eventData: orderStockDepletedEventData,
      createdAt: date,
      updatedAt: date,
    }
    return Result.makeSuccess(orderStockDepletedEventProps)
  }

  //
  //
  //
  private static validateInput(
    orderStockDepletedEventInput: OrderStockDepletedEventData,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderStockDepletedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderStockDepletedEventInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, orderStockDepletedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderStockDepletedEventInput })
      return invalidArgsFailure
    }
  }
}
