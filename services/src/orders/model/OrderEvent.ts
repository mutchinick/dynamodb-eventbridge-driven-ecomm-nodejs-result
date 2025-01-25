import { TypeUtilsPretty } from '../../shared/TypeUtils'
import { OrderData } from './OrderData'
import { OrderEventName } from './OrderEventName'

export type OrderEvent<TOrderEventName extends OrderEventName | string, TOrderEventData extends OrderEventData> = {
  eventName: TOrderEventName
  eventData: TOrderEventData
  createdAt: string
  updatedAt: string
}

export type OrderEventData = TypeUtilsPretty<Partial<OrderData> & { orderId: string }>
