import { z } from 'zod'
import { OrderError } from '../../errors/OrderError'
import { OrderData } from '../../model/OrderData'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingPlaceOrderRequestInput = Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>

type IncomingPlaceOrderRequestProps = Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>

export class IncomingPlaceOrderRequest implements IncomingPlaceOrderRequestProps {
  //
  //
  //
  private constructor(
    public readonly orderId: string,
    public readonly sku: string,
    public readonly units: number,
    public readonly price: number,
    public readonly userId: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(incomingPlaceOrderRequestInput: IncomingPlaceOrderRequestInput) {
    try {
      const { orderId, sku, units, price, userId } =
        this.buildIncomingPlaceOrderRequestProps(incomingPlaceOrderRequestInput)
      return new IncomingPlaceOrderRequest(orderId, sku, units, price, userId)
    } catch (error) {
      console.error('IncomingPlaceOrderRequest.validateAndBuild', { error, incomingPlaceOrderRequestInput })
      throw error
    }
  }

  //
  //
  //
  private static buildIncomingPlaceOrderRequestProps(
    incomingPlaceOrderRequestInput: IncomingPlaceOrderRequestInput,
  ): IncomingPlaceOrderRequestProps {
    try {
      const incomingPlaceOrderRequest = z
        .object({
          orderId: ValueValidators.validOrderId(),
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          price: ValueValidators.validPrice(),
          userId: ValueValidators.validUserId(),
        })
        .parse(incomingPlaceOrderRequestInput) as IncomingPlaceOrderRequestProps
      return incomingPlaceOrderRequest
    } catch (error) {
      console.error('PlaceOrderApiController.buildIncomingPlaceOrderRequest error:', { error })
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }
}
