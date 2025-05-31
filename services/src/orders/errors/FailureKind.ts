export type FailureKind =
  | 'InvalidOperationError'
  | 'UnrecognizedError'
  | 'InvalidArgumentsError'
  | 'RedundantOrderStatusTransitionError'
  | 'NotFoundOrderStatusTransitionError'
  | 'StaleOrderStatusTransitionError'
  | 'ForbiddenOrderStatusTransitionError'
  | 'DuplicateEventRaisedError'
