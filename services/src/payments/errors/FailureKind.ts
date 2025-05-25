export type FailureKind =
  | 'InvalidOperationError'
  | 'UnrecognizedError'
  | 'InvalidArgumentsError'
  | 'DuplicateEventRaisedError'
  | 'PaymentFailedError'
  | 'PaymentAlreadyRejectedError'
  | 'PaymentAlreadyAcceptedError'
