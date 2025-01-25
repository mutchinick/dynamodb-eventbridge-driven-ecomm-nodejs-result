import { OrderStatus } from './OrderStatus'

export type OrderData = {
  orderId: string
  orderStatus: OrderStatus
  sku: string
  quantity: number
  price: number
  userId: string
  createdAt: string
  updatedAt: string
}
