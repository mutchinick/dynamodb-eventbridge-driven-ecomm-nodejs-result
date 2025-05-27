/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { z } from 'zod'
import { AllocationStatusMembers } from './AllocationStatus'
import { InventoryEventName } from './InventoryEventName'
import { SortDirection } from './SortDirection'

/**
 *
 */
export class ValueValidators {
  public static validInventoryEventName = () => z.nativeEnum(InventoryEventName)

  public static validInventoryEventNameLiteral = (eventName: InventoryEventName) =>
    z.nativeEnum(InventoryEventName).and(z.literal(eventName))

  public static validInventoryEventNameGroup = (eventGroup: InventoryEventName[]) =>
    z.nativeEnum(InventoryEventName).and(z.enum(eventGroup as unknown as [InventoryEventName, ...InventoryEventName[]]))

  public static validOrderId = () => z.string().trim().min(4)

  public static validSku = () => z.string().trim().min(4)

  public static validUnits = () => z.number().int().min(1)

  public static validPrice = () => z.number().min(0)

  public static validUserId = () => z.string().trim().min(4)

  public static validCreatedAt = () => z.string().trim().min(4)

  public static validUpdatedAt = () => z.string().trim().min(4)

  public static validLotId = () => z.string().trim().min(4)

  public static validSortDirection = () => z.nativeEnum(SortDirection)

  public static validLimit = () => z.number().int().min(1).max(1000)

  public static validAllocationStatus = () => z.enum(AllocationStatusMembers)
}
