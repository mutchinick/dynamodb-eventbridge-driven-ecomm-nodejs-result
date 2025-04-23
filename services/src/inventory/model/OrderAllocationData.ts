import { AllocationStatus } from './AllocationStatus'

export type OrderAllocationData = {
  orderId: string
  sku: string
  units: number
  price: number
  userId: string
  createdAt: string
  updatedAt: string
  allocationStatus: AllocationStatus
}
