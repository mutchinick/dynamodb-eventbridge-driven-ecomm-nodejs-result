import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { getDdbTransactionCancellationCode } from './getDdbTransactionCancellationCode'

describe('getDdbTransactionCancellationCode', () => {
  it('returns null if the input Error is not a TransactionCanceledException', () => {
    const error = Error()
    expect(getDdbTransactionCancellationCode(error)).toBeNull()
  })

  it('returns null if the input Error CancellationReasons is not defined', () => {
    const error: Error = new TransactionCanceledException({
      $metadata: {},
      message: '',
    })
    expect(getDdbTransactionCancellationCode(error)).toBeNull()
  })

  it('returns null if the input Error does not contain the requested CancellationReasons[0].Code', () => {
    const error: Error = new TransactionCanceledException({
      $metadata: {},
      message: '',
      CancellationReasons: [],
    })
    expect(getDdbTransactionCancellationCode(error)).toBeNull()
  })

  it('returns the requested Code if the input Error contains the requested CancellationReasons[0].Code', () => {
    const mockCancellationReasonCode = 'mockCancellationReasonCode'
    const error: Error = new TransactionCanceledException({
      $metadata: {},
      message: '',
      CancellationReasons: [{ Code: mockCancellationReasonCode }],
    })
    expect(getDdbTransactionCancellationCode(error)).toBe(mockCancellationReasonCode)
  })

  it('returns the requested Code if the input Error contains the requested CancellationReasons[n].Code', () => {
    const mockCancellationReasonCode = 'mockCancellationReasonCode'
    const error: Error = new TransactionCanceledException({
      $metadata: {},
      message: '',
      CancellationReasons: [null, null, { Code: mockCancellationReasonCode }],
    })
    expect(getDdbTransactionCancellationCode(error, 2)).toBe(mockCancellationReasonCode)
  })
})
