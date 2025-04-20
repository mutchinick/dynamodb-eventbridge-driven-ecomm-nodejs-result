import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingPlaceOrderRequestInput = TypeUtilsPretty<
  Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type IncomingPlaceOrderRequestProps = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

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
    const inputValidationResult = this.validateInput(incomingPlaceOrderRequestInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sku, units, price, userId } = incomingPlaceOrderRequestInput
    const incomingPlaceOrderRequestProps: IncomingPlaceOrderRequestProps = {
      orderId,
      sku,
      units,
      price,
      userId,
    }
    return Result.makeSuccess(incomingPlaceOrderRequestProps)
  }

  //
  //
  //
  private static validateInput(
    incomingPlaceOrderRequestInput: IncomingPlaceOrderRequestInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingPlaceOrderRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(incomingPlaceOrderRequestInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingPlaceOrderRequestInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, incomingPlaceOrderRequestInput })
      return invalidArgsFailure
    }
  }
}
