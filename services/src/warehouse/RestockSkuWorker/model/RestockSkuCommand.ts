import { z } from 'zod'
import { WarehouseError } from '../../errors/WarehouseError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'

export interface RestockSkuCommandInput {
  incomingSkuRestockedEvent: IncomingSkuRestockedEvent
}

type RestockSkuCommandData = RestockSkuData

type RestockSkuCommandProps = {
  readonly restockSkuData: RestockSkuCommandData
  readonly options?: Record<string, unknown>
}

export class RestockSkuCommand implements RestockSkuCommandProps {
  //
  //
  //
  private constructor(
    public readonly restockSkuData: RestockSkuCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(restockSkuCommandInput: RestockSkuCommandInput): RestockSkuCommand {
    try {
      const { restockSkuData, options } = this.buildRestockSkuCommandProps(restockSkuCommandInput)
      return new RestockSkuCommand(restockSkuData, options)
    } catch (error) {
      console.error('RestockSkuCommand.validateAndBuild', { error, restockSkuCommandInput })
      throw error
    }
  }

  //
  //
  //
  private static buildRestockSkuCommandProps(restockSkuCommandInput: RestockSkuCommandInput): RestockSkuCommandProps {
    const { incomingSkuRestockedEvent } = restockSkuCommandInput
    this.validateWarehouseEvent(incomingSkuRestockedEvent)

    const { sku, units, lotId } = incomingSkuRestockedEvent.eventData
    const date = new Date().toISOString()
    return {
      restockSkuData: {
        sku,
        units,
        lotId,
        createdAt: date,
        updatedAt: date,
      },
      options: {},
    }
  }

  //
  //
  //
  private static validateWarehouseEvent(incomingSkuRestockedEvent: IncomingSkuRestockedEvent) {
    try {
      z.object({
        eventName: ValueValidators.validSkuRestockedEventName(),
        eventData: z.object({
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          lotId: ValueValidators.validLotId(),
        }),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      }).parse(incomingSkuRestockedEvent)
    } catch (error) {
      WarehouseError.addName(error, WarehouseError.InvalidArgumentsError)
      WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      throw error
    }
  }
}
