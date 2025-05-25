import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'

/**
 *
 */
export class DynamoDbUtils {
  public static readonly CancellationReasons = {
    ConditionalCheckFailed: 'ConditionalCheckFailed',
  } as const

  /**
   *
   */
  public static getTransactionCancellationCode(error: unknown, n: number): string {
    if (error instanceof TransactionCanceledException) {
      return error.CancellationReasons?.[n]?.Code || null
    }
    return null
  }
}
