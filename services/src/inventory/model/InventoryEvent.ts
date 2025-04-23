import { InventoryEventName } from './InventoryEventName'

export type InventoryEvent<
  TInventoryEventName extends InventoryEventName | string,
  TInventoryEventData extends InventoryEventData,
> = {
  eventName: TInventoryEventName
  eventData: TInventoryEventData
  createdAt: string
  updatedAt: string
}

export type InventoryEventData = Record<string, unknown>
