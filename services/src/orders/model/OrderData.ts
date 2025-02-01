import { OrderStatus } from './OrderStatus'

export type OrderData = {
  orderId: string
  orderStatus: OrderStatus
  sku: string
  units: number
  price: number
  userId: string
  createdAt: string
  updatedAt: string
}
