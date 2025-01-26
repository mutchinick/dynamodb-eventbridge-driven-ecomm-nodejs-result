import { WarehouseEventName } from './WarehouseEventName'

export type WarehouseEvent<
  TWarehouseEventName extends WarehouseEventName | string,
  TWarehouseEventData extends WarehouseEventData,
> = {
  eventName: TWarehouseEventName
  eventData: TWarehouseEventData
  createdAt: string
  updatedAt: string
}

export type WarehouseEventData = Record<string, unknown>
