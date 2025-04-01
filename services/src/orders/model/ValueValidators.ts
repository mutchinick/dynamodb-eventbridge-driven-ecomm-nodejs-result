import { z } from 'zod'
import { OrderEventName } from './OrderEventName'
import { OrderStatus } from './OrderStatus'
import { SortDirection } from './SortDirection'

export class ValueValidators {
  public static validIncomingEventName = () => z.nativeEnum(OrderEventName)

  public static validOrderPlacedEventName = () => z.literal(OrderEventName.ORDER_PLACED_EVENT)

  public static validOrderId = () => z.string().trim().min(4)

  public static validOrderStatus = () => z.nativeEnum(OrderStatus)

  public static validSku = () => z.string().trim().min(4)

  public static validUnits = () => z.number().int().min(1)

  public static validPrice = () => z.number().min(0)

  public static validUserId = () => z.string().trim().min(4)

  public static validCreatedAt = () => z.string().trim().min(4)

  public static validUpdatedAt = () => z.string().trim().min(4)

  public static validSortDirection = () => z.enum(Object.values(SortDirection) as [string, ...string[]])

  public static validLimit = () => z.number().int().min(1).max(1000)
}
