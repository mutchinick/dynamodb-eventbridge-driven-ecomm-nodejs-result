export class OrderError {
  public static ConditionalCheckFailedException = 'ConditionalCheckFailedException'
  public static InvalidArgumentsError = 'InvalidArgumentsError'
  public static InvalidOrderStatusTransitionError_Redundant = 'InvalidOrderStatusTransitionError_Redundant'
  public static InvalidOrderStatusTransitionError_OrderNotFound = 'InvalidOrderStatusTransitionError_OrderNotFound'
  public static InvalidOrderStatusTransitionError_OrderNotReady = 'InvalidOrderStatusTransitionError_OrderNotReady'
  public static InvalidOrderStatusTransitionError_Forbidden = 'InvalidOrderStatusTransitionError_Forbidden'
  public static InvalidEventRaiseOperationError_Redundant = 'InvalidEventRaiseOperationError_Redundant'
  public static DoNotRetryError = 'DoNotRetryError'

  public static getName(error: unknown) {
    const e = error as Error
    return e.name
  }

  public static addName(error: unknown, name: string) {
    const e = error as Error
    e.name = `${e.name} ${name}`
  }

  public static hasName(error: unknown, name: string) {
    const e = error as Error
    const regex = new RegExp(`\\b${name}\\b`, 'i')
    return regex.test(e.name)
  }

  public static doNotRetry(error: unknown) {
    return this.hasName(error, OrderError.DoNotRetryError)
  }
}
