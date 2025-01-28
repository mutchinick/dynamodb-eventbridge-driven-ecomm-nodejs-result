import { z } from 'zod'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

export type SkuRestockedEventData = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

export type SkuRestockedEventInput = SkuRestockedEventData

type SkuRestockedEventProps = WarehouseEvent<WarehouseEventName.SKU_RESTOCKED_EVENT, SkuRestockedEventData>

export class SkuRestockedEvent implements SkuRestockedEventProps {
  //
  //
  //
  private constructor(
    public readonly eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    public readonly eventData: SkuRestockedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(skuRestockedEventInput: SkuRestockedEventInput) {
    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildSkuRestockedEventProps(skuRestockedEventInput)
      return new SkuRestockedEvent(eventName, eventData, createdAt, updatedAt)
    } catch (error) {
      console.error('SkuRestockedEvent.validateAndBuild', { error, skuRestockedEventInput })
      throw error
    }
  }

  //
  //
  //
  private static buildSkuRestockedEventProps(skuRestockedEventInput: SkuRestockedEventInput): SkuRestockedEventProps {
    const validInput = z
      .object({
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        lotId: ValueValidators.validLotId(),
      })
      .parse(skuRestockedEventInput) as SkuRestockedEventData

    const { sku, units, lotId } = validInput
    const date = new Date().toISOString()
    const skuRestockedEventData: SkuRestockedEventData = {
      sku,
      units,
      lotId,
    }

    return {
      eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
      eventData: skuRestockedEventData,
      createdAt: date,
      updatedAt: date,
    }
  }
}
