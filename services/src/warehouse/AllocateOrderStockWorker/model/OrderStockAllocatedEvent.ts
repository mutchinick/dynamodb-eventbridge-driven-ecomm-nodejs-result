import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

export type OrderStockAllocatedEventInput = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderStockAllocatedEventData = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

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

    const propsResult = this.buildProps(orderStockAllocatedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, orderStockAllocatedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const orderStockAllocatedEvent = new OrderStockAllocatedEvent(eventName, eventData, createdAt, updatedAt)
    const orderStockAllocatedEventResult = Result.makeSuccess(orderStockAllocatedEvent)
    console.info(`${logContext} exit success:`, { orderStockAllocatedEventResult })
    return orderStockAllocatedEventResult
  }

  //
  //
  //
  private static buildProps(
    orderStockAllocatedEventInput: OrderStockAllocatedEventInput,
  ): Success<OrderStockAllocatedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(orderStockAllocatedEventInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sku, units, price, userId } = orderStockAllocatedEventInput
    const currentDate = new Date().toISOString()
    const orderStockAllocatedEventProps: OrderStockAllocatedEventProps = {
      eventName: WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: { orderId, sku, units, price, userId },
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    return Result.makeSuccess(orderStockAllocatedEventProps)
  }

  //
  //
  //
  private static validateInput(
    orderStockAllocatedEventInput: OrderStockAllocatedEventData,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'OrderStockAllocatedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderStockAllocatedEventInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, orderStockAllocatedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderStockAllocatedEventInput })
      return invalidArgsFailure
    }
  }
}
