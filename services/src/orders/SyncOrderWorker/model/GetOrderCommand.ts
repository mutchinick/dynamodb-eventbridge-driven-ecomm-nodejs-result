import { OrderError } from '../../errors/OrderError'
import { OrderData } from '../../model/OrderData'
import { ValueValidators } from '../../model/ValueValidators'

export type GetOrderCommandInput = Pick<OrderData, 'orderId'>

type GetOrderCommandProps = {
  readonly orderId: string
  readonly options?: Record<string, unknown>
}

export class GetOrderCommand implements GetOrderCommandProps {
  //
  //
  //
  private constructor(
    public readonly orderId: string,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(getOrderCommandInput: GetOrderCommandInput) {
    try {
      const { orderId, options } = this.buildGetOrderCommandProps(getOrderCommandInput)
      return new GetOrderCommand(orderId, options)
    } catch (error) {
      console.error('GetOrderCommand.validateAndBuild', { error, getOrderCommandInput })
      throw error
    }
  }

  //
  //
  //
  private static buildGetOrderCommandProps(getOrderCommandInput: GetOrderCommandInput): GetOrderCommandProps {
    const { orderId } = getOrderCommandInput
    this.validateOrderId(orderId)

    const getOrderCommand: GetOrderCommandProps = {
      orderId,
      options: {},
    }
    return getOrderCommand
  }

  //
  //
  //
  private static validateOrderId(orderId: string) {
    try {
      ValueValidators.validOrderId().parse(orderId)
    } catch (error) {
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }
}
