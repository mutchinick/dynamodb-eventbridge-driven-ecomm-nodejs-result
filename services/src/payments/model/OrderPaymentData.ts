import { PaymentStatus } from './PaymentStatus'

export type OrderPaymentData = {
  orderId: string
  sku: string
  units: number
  price: number
  userId: string
  createdAt: string
  updatedAt: string
  paymentId: string
  paymentStatus: PaymentStatus
  paymentRetries: number
}
