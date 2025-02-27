import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDbUtils } from './DynamoDbUtils'

describe(`DynamoDbUtils.getTransactionCancellationCode`, () => {
  it(`returns null if the input Error is not a TransactionCanceledException`, () => {
    const error = Error()
    expect(DynamoDbUtils.getTransactionCancellationCode(error, 0)).toBeNull()
  })

  it(`returns null if the input Error CancellationReasons is not defined`, () => {
    const error: Error = new TransactionCanceledException({
      $metadata: {},
      message: '',
    })
    expect(DynamoDbUtils.getTransactionCancellationCode(error, 0)).toBeNull()
  })

  it(`returns null if the input Error does not contain the requested CancellationReasons[0].Code`, () => {
    const error: Error = new TransactionCanceledException({
      $metadata: {},
      message: '',
      CancellationReasons: [],
    })
    expect(DynamoDbUtils.getTransactionCancellationCode(error, 0)).toBeNull()
  })

  it(`returns the requested Code if the input Error contains the requested CancellationReasons[0].Code`, () => {
    const mockCancellationReasonCode = 'mockCancellationReasonCode'
    const error: Error = new TransactionCanceledException({
      $metadata: {},
      message: '',
      CancellationReasons: [{ Code: mockCancellationReasonCode }],
    })
    expect(DynamoDbUtils.getTransactionCancellationCode(error, 0)).toBe(mockCancellationReasonCode)
  })

  it(`returns the requested Code if the input Error contains the requested CancellationReasons[n].Code`, () => {
    const mockCancellationReasonCode = 'mockCancellationReasonCode'
    const error: Error = new TransactionCanceledException({
      $metadata: {},
      message: '',
      CancellationReasons: [null, null, { Code: mockCancellationReasonCode }],
    })
    expect(DynamoDbUtils.getTransactionCancellationCode(error, 2)).toBe(mockCancellationReasonCode)
  })
})
