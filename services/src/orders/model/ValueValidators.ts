/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { z } from 'zod'
import { OrderEventName } from './OrderEventName'
import { OrderStatus } from './OrderStatus'
import { SortDirection } from './SortDirection'

/**
 *
 */
export class ValueValidators {
  public static validOrderEventName = () => z.nativeEnum(OrderEventName)

  public static validOrderEventNameLiteral = (eventName: OrderEventName) =>
    z.nativeEnum(OrderEventName).and(z.literal(eventName))

  public static validOrderEventNameGroup = (eventGroup: OrderEventName[]) =>
    z.nativeEnum(OrderEventName).and(z.enum(eventGroup as unknown as [OrderEventName, ...OrderEventName[]]))

  public static validOrderId = () => z.string().trim().min(4)

  public static validOrderStatus = () => z.nativeEnum(OrderStatus)

  public static validSku = () => z.string().trim().min(4)

  public static validUnits = () => z.number().int().min(1)

  public static validPrice = () => z.number().min(0)

  public static validUserId = () => z.string().trim().min(4)

  public static validCreatedAt = () => z.string().trim().min(4)

  public static validUpdatedAt = () => z.string().trim().min(4)

  public static validSortDirection = () => z.nativeEnum(SortDirection)

  public static validLimit = () => z.number().int().min(1).max(1000)
}
