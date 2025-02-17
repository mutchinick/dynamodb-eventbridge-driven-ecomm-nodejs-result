import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

export type OrderStockAllocatedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units'>

export type OrderStockAllocatedEventInput = OrderStockAllocatedEventData

type OrderStockAllocatedEventProps = WarehouseEvent<
  WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
  OrderStockAllocatedEventData
>

export class OrderStockAllocatedEvent implements OrderStockAllocatedEventProps {
  //
  //
  //
  private constructor(
    public readonly eventName: WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
    public readonly eventData: OrderStockAllocatedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    orderStockAllocatedEventInput: OrderStockAllocatedEventInput,
  ): Success<OrderStockAllocatedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderStockAllocatedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderStockAllocatedEventInput })

    const propsResult = this.buildPropsSafe(orderStockAllocatedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, orderStockAllocatedEventInput })
      return propsResult
    }

    const props = propsResult.value
    const { eventName, eventData, createdAt, updatedAt } = props
    const orderStockAllocatedEvent = new OrderStockAllocatedEvent(eventName, eventData, createdAt, updatedAt)
    const orderStockAllocatedEventResult = Result.makeSuccess(orderStockAllocatedEvent)
    console.info(`${logContext} exit success:`, { orderStockAllocatedEventResult })
    return orderStockAllocatedEventResult
  }

  //
  //
  //
  private static buildPropsSafe(
    orderStockAllocatedEventInput: OrderStockAllocatedEventInput,
  ): Success<OrderStockAllocatedEventProps> | Failure<'InvalidArgumentsError'> {
    try {
      z.object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
      }).parse(orderStockAllocatedEventInput)
    } catch (error) {
      const logContext = 'OrderStockAllocatedEvent.buildPropsSafe'
      console.error(`${logContext} error:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderStockAllocatedEventInput })
      return invalidArgsFailure
    }

    const { orderId, sku, units } = orderStockAllocatedEventInput
    const date = new Date().toISOString()
    const orderStockAllocatedEventData: OrderStockAllocatedEventData = {
      orderId,
      sku,
      units,
    }

    const orderStockAllocatedEventProps: OrderStockAllocatedEventProps = {
      eventName: WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: orderStockAllocatedEventData,
      createdAt: date,
      updatedAt: date,
    }
    return Result.makeSuccess(orderStockAllocatedEventProps)
  }
}
