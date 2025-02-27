export type FailureKind =
  | 'InvalidOperationError'
  | 'UnrecognizedError'
  | 'InvalidArgumentsError'
  | 'DuplicateEventRaisedError'
  | 'DuplicateRestockOperationError'
  | 'DuplicateStockAllocationError'
  | 'DepletedStockAllocationError'
