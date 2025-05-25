export const PaymentStatusMembers = ['PAYMENT_ACCEPTED', 'PAYMENT_FAILED', 'PAYMENT_REJECTED'] as const

type PaymentStatusMembers = (typeof PaymentStatusMembers)[number]

export type PaymentStatus<T extends PaymentStatusMembers = PaymentStatusMembers> = T
