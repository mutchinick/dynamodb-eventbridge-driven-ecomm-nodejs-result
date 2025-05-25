import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { SortParams } from '../../model/SortParams'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingListOrderPaymentsRequestInput = TypeUtilsPretty<
  Partial<Pick<OrderPaymentData, 'orderId'> & SortParams>
>

type IncomingListOrderPaymentsRequestProps = TypeUtilsPretty<Partial<Pick<OrderPaymentData, 'orderId'> & SortParams>>

/**
 *
 */
export class IncomingListOrderPaymentsRequest implements IncomingListOrderPaymentsRequestProps {
  /**
   *
   */
  private constructor(
    public readonly orderId?: string,
    public readonly sortDirection?: 'asc' | 'desc',
    public readonly limit?: number,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    incomingListOrderPaymentsRequestInput: IncomingListOrderPaymentsRequestInput,
  ): Success<IncomingListOrderPaymentsRequest> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingListOrderPaymentsRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingListOrderPaymentsRequestInput })

    const propsResult = this.buildProps(incomingListOrderPaymentsRequestInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingListOrderPaymentsRequestInput })
      return propsResult
    }

    const { orderId, sortDirection, limit } = propsResult.value
    const incomingListOrderPaymentsRequest = new IncomingListOrderPaymentsRequest(orderId, sortDirection, limit)
    const incomingListOrderPaymentsRequestResult = Result.makeSuccess(incomingListOrderPaymentsRequest)
    console.info(`${logContext} exit success:`, {
      incomingListOrderPaymentsRequestResult,
      incomingListOrderPaymentsRequestInput,
    })
    return incomingListOrderPaymentsRequestResult
  }

  /**
   *
   */
  private static buildProps(
    incomingListOrderPaymentsRequestInput: IncomingListOrderPaymentsRequestInput,
  ): Success<IncomingListOrderPaymentsRequestProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(incomingListOrderPaymentsRequestInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sortDirection, limit } = incomingListOrderPaymentsRequestInput
    const incomingListOrderPaymentsRequestProps: IncomingListOrderPaymentsRequestProps = {
      orderId,
      sortDirection,
      limit,
    }
    return Result.makeSuccess(incomingListOrderPaymentsRequestProps)
  }

  /**
   *
   */
  private static validateInput(
    incomingListOrderPaymentsRequestInput: IncomingListOrderPaymentsRequestInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingListOrderPaymentsRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId().optional(),
      sortDirection: ValueValidators.validSortDirection().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(incomingListOrderPaymentsRequestInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingListOrderPaymentsRequestInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, incomingListOrderPaymentsRequestInput })
      return invalidArgsFailure
    }
  }
}
