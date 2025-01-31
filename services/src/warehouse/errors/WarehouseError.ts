export class WarehouseError {
  public static ConditionalCheckFailedException = 'ConditionalCheckFailedException'
  public static TransactionCanceledException = 'TransactionCanceledException'
  public static InvalidArgumentsError = 'InvalidArgumentsError'
  public static InvalidEventRaiseOperationError_Redundant = 'InvalidEventRaiseOperationError_Redundant'
  public static InvalidRestockOperationError_Redundant = 'InvalidRestockOperationError_Redundant'
  public static InvalidStockAllocationOperationError_Depleted = 'InvalidStockAllocationOperationError_Depleted'
  public static InvalidStockAllocationOperationError_Redundant = 'InvalidStockAllocationOperationError_Redundant'
  public static DoNotRetryError = 'DoNotRetryError'

  //
  //
  //
  public static getName(error: unknown) {
    const e = error as Error
    return e.name
  }

  //
  //
  //
  public static addName(error: unknown, name: string) {
    const e = error as Error
    e.name = `${e.name} ${name}`
  }

  //
  //
  //
  public static hasName(error: unknown, name: string) {
    const e = error as Error
    const regex = new RegExp(`\\b${name}\\b`, 'i')
    return regex.test(e.name)
  }

  //
  //
  //
  public static doNotRetry(error: unknown) {
    return this.hasName(error, WarehouseError.DoNotRetryError)
  }
}
