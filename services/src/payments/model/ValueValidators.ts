/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { z } from 'zod'
import { PaymentsEventName } from './PaymentsEventName'
import { PaymentStatusMembers } from './PaymentStatus'
import { SortDirection } from './SortDirection'

/**
 *
 */
export class ValueValidators {
  public static validPaymentsEventName = () => z.nativeEnum(PaymentsEventName)

  public static validPaymentsEventNameLiteral = (eventName: PaymentsEventName) =>
    z.nativeEnum(PaymentsEventName).and(z.literal(eventName))

  public static validPaymentsEventNameGroup = (eventGroup: PaymentsEventName[]) =>
    z.nativeEnum(PaymentsEventName).and(z.enum(eventGroup as unknown as [PaymentsEventName, ...PaymentsEventName[]]))

  public static validOrderId = () => z.string().trim().min(4)

  public static validSku = () => z.string().trim().min(4)

  public static validUnits = () => z.number().int().min(1)

  public static validPrice = () => z.number().min(0)

  public static validUserId = () => z.string().trim().min(4)

  public static validCreatedAt = () => z.string().trim().min(4)

  public static validUpdatedAt = () => z.string().trim().min(4)

  public static validSortDirection = () => z.nativeEnum(SortDirection)

  public static validLimit = () => z.number().int().min(1).max(1000)

  public static validPaymentId = () => z.string().trim().min(4)

  public static validPaymentStatus = () => z.enum(PaymentStatusMembers)

  public static validPaymentRetries = () => z.number().int().min(0)
}
