import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
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
  public static validateAndBuild(
    incomingPlaceOrderRequestInput: IncomingPlaceOrderRequestInput,
  ): Success<IncomingPlaceOrderRequest> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingPlaceOrderRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingPlaceOrderRequestInput })

    const propsResult = this.buildProps(incomingPlaceOrderRequestInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingPlaceOrderRequestInput })
      return propsResult
    }

    const { orderId, sku, units, price, userId } = propsResult.value
    const incomingPlaceOrderRequest = new IncomingPlaceOrderRequest(orderId, sku, units, price, userId)
    const incomingPlaceOrderRequestResult = Result.makeSuccess(incomingPlaceOrderRequest)
    console.info(`${logContext} exit success:`, { incomingPlaceOrderRequestResult, incomingPlaceOrderRequestInput })
    return incomingPlaceOrderRequestResult
  }

  //
  //
  //
  private static buildProps(
    incomingPlaceOrderRequestInput: IncomingPlaceOrderRequestInput,
  ): Success<IncomingPlaceOrderRequestProps> | Failure<'InvalidArgumentsError'> {
    try {
      const validInput = this.parseValidateInput(incomingPlaceOrderRequestInput)
      return Result.makeSuccess(validInput)
    } catch (error) {
      const logContext = 'IncomingPlaceOrderRequest.buildProps'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, incomingPlaceOrderRequestInput })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private static parseValidateInput(
    incomingPlaceOrderRequestInput: IncomingPlaceOrderRequestInput,
  ): IncomingPlaceOrderRequestProps {
    return z
      .object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
      })
      .parse(incomingPlaceOrderRequestInput) as IncomingPlaceOrderRequestProps
  }
}
