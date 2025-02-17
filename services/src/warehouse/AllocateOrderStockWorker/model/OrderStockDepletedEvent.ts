import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

export type OrderStockDepletedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units'>

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

    const propsResult = this.buildPropsSafe(orderStockDepletedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, orderStockDepletedEventInput })
      return propsResult
    }

    const props = propsResult.value
    const { eventName, eventData, createdAt, updatedAt } = props
    const orderStockDepletedEvent = new OrderStockDepletedEvent(eventName, eventData, createdAt, updatedAt)
    const orderStockDepletedEventResult = Result.makeSuccess(orderStockDepletedEvent)
    console.info(`${logContext} exit success:`, { orderStockDepletedEventResult })
    return orderStockDepletedEventResult
  }

  //
  //
  //
  private static buildPropsSafe(
    orderStockDepletedEventInput: OrderStockDepletedEventInput,
  ): Success<OrderStockDepletedEventProps> | Failure<'InvalidArgumentsError'> {
    try {
      z.object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
      }).parse(orderStockDepletedEventInput)
    } catch (error) {
      const logContext = 'OrderStockDepletedEvent.buildPropsSafe'
      console.error(`${logContext} error:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderStockDepletedEventInput })
      return invalidArgsFailure
    }

    const { orderId, sku, units } = orderStockDepletedEventInput
    const date = new Date().toISOString()
    const orderStockDepletedEventData: OrderStockDepletedEventData = {
      orderId,
      sku,
      units,
    }

    const orderStockDepletedEventProps: OrderStockDepletedEventProps = {
      eventName: WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
      eventData: orderStockDepletedEventData,
      createdAt: date,
      updatedAt: date,
    }
    return Result.makeSuccess(orderStockDepletedEventProps)
  }
}
