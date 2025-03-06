export type FailureKind =
  | 'InvalidOperationError'
  | 'UnrecognizedError'
  | 'InvalidArgumentsError'
  | 'RedundantOrderStatusTransitionError'
  | 'NotFoundOrderStatusTransitionError'
  | 'NotReadyOrderStatusTransitionError'
  | 'ForbiddenOrderStatusTransitionError'
  | 'DuplicateEventRaisedError'
