import { z } from 'zod'
import { WarehouseError } from '../../errors/WarehouseError'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'

export interface AllocateOrderStockCommandInput {
  incomingOrderCreatedEvent: IncomingOrderCreatedEvent
}

type AllocateOrderStockCommandData = AllocateOrderStockData

type AllocateOrderStockCommandProps = {
  readonly allocateOrderStockData: AllocateOrderStockCommandData
  readonly options?: Record<string, unknown>
}

export class AllocateOrderStockCommand implements AllocateOrderStockCommandProps {
  //
  //
  //
  private constructor(
    public readonly allocateOrderStockData: AllocateOrderStockCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    allocateOrderStockCommandInput: AllocateOrderStockCommandInput,
  ): AllocateOrderStockCommand {
    try {
      const { allocateOrderStockData, options } =
        this.buildAllocateOrderStockCommandProps(allocateOrderStockCommandInput)
      return new AllocateOrderStockCommand(allocateOrderStockData, options)
    } catch (error) {
      console.error('AllocateOrderStockCommand.validateAndBuild', { error, allocateOrderStockCommandInput })
      throw error
    }
  }

  //
  //
  //
  private static buildAllocateOrderStockCommandProps(
    allocateOrderStockCommandInput: AllocateOrderStockCommandInput,
  ): AllocateOrderStockCommandProps {
    const { incomingOrderCreatedEvent } = allocateOrderStockCommandInput
    this.validateWarehouseEvent(incomingOrderCreatedEvent)

    const { sku, orderId, units } = incomingOrderCreatedEvent.eventData
    const date = new Date().toISOString()
    return {
      allocateOrderStockData: {
        sku,
        units,
        orderId,
        createdAt: date,
        updatedAt: date,
      },
      options: {},
    }
  }

  //
  //
  //
  private static validateWarehouseEvent(incomingOrderCreatedEvent: IncomingOrderCreatedEvent) {
    try {
      z.object({
        eventName: ValueValidators.validOrderCreatedEventName(),
        eventData: z.object({
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          orderId: ValueValidators.validOrderId(),
        }),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      }).parse(incomingOrderCreatedEvent)
    } catch (error) {
      WarehouseError.addName(error, WarehouseError.InvalidArgumentsError)
      WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      throw error
    }
  }
}
