import { z } from 'zod'
import { WarehouseEventName } from './WarehouseEventName'

export class ValueValidators {
  public static validSkuRestockedEventName = () => z.literal(WarehouseEventName.SKU_RESTOCKED_EVENT)

  public static validOrderCreatedEventName = () => z.literal(WarehouseEventName.ORDER_CREATED_EVENT)

  public static validSku = () => z.string().trim().min(4)

  public static validUnits = () => z.number().int().min(1)

  public static validLotId = () => z.string().trim().min(4)

  public static validOrderId = () => z.string().trim().min(4)

  public static validCreatedAt = () => z.string().trim().min(4)

  public static validUpdatedAt = () => z.string().trim().min(4)
}
