import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { WarehouseError } from '../errors/WarehouseError'

//
//
//
export function getDdbTransactionCancellationCode(error: unknown, n: number = 0): string {
  if (!WarehouseError.hasName(error, WarehouseError.TransactionCanceledException)) {
    return null
  }
  const transactionError = error as TransactionCanceledException
  const errorCode = transactionError.CancellationReasons?.[n]?.Code || null
  return errorCode
}
