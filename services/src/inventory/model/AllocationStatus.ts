export const AllocationStatus = {
  ALLOCATED: 'ALLOCATED',
  COMPLETED_PAYMENT_ACCEPTED: 'COMPLETED_PAYMENT_ACCEPTED',
  DEALLOCATED_PAYMENT_REJECTED: 'DEALLOCATED_PAYMENT_REJECTED',
  DEALLOCATED_ORDER_CANCELED: 'DEALLOCATED_ORDER_CANCELED',
} as const

export type AllocationStatus = (typeof AllocationStatus)[keyof typeof AllocationStatus]

export type FixedAllocationStatus<T extends AllocationStatus> = T
