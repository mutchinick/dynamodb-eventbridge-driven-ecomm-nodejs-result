import { PaymentsEventName } from './PaymentsEventName'

export type PaymentsEvent<
  TPaymentsEventName extends PaymentsEventName,
  TPaymentsEventData extends PaymentsEventData,
> = {
  eventName: TPaymentsEventName
  eventData: TPaymentsEventData
  createdAt: string
  updatedAt: string
}

export type PaymentsEventData = Record<string, unknown>
