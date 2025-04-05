export const AllocationStatusMembers = ['ALLOCATED', 'CANCELED', 'PAYMENT_REJECTED'] as const

type AllocationStatusMembers = (typeof AllocationStatusMembers)[number]

export type AllocationStatus<T extends AllocationStatusMembers = AllocationStatusMembers> = T
