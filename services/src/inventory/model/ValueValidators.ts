/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { z } from 'zod'
import { SortDirection } from './SortDirection'
import { InventoryEventName } from './InventoryEventName'
import { AllocationStatus, AllocationStatusMembers } from './AllocationStatus'

/**
 *
 */
export class ValueValidators {
  public static validSkuRestockedEventName = () => z.literal(InventoryEventName.SKU_RESTOCKED_EVENT)

  public static validOrderCreatedEventName = () => z.literal(InventoryEventName.ORDER_CREATED_EVENT)

  public static validOrderEventNameGroup = (events: InventoryEventName[]) =>
    z.enum(events as unknown as [InventoryEventName, ...InventoryEventName[]])

  public static validOrderId = () => z.string().trim().min(4)

  public static validSku = () => z.string().trim().min(4)

  public static validUnits = () => z.number().int().min(1)

  public static validPrice = () => z.number().min(0)

  public static validUserId = () => z.string().trim().min(4)

  public static validCreatedAt = () => z.string().trim().min(4)

  public static validUpdatedAt = () => z.string().trim().min(4)

  public static validLotId = () => z.string().trim().min(4)

  public static validSortDirection = () => z.enum(Object.values(SortDirection) as [string, ...string[]])

  public static validLimit = () => z.number().int().min(1).max(1000)

  public static validAllocationStatus = (expectedAllocationStatus?: AllocationStatus) =>
    expectedAllocationStatus !== undefined
      ? z.enum(AllocationStatusMembers).and(z.literal(expectedAllocationStatus))
      : z.enum(AllocationStatusMembers)
}
