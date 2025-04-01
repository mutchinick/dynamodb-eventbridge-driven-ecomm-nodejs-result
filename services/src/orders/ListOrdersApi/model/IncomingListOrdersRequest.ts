import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { SortDirection } from '../../model/SortDirection'
import { ValueValidators } from '../../model/ValueValidators'

type IncomingListOrdersRequestData = Partial<
  Pick<OrderData, 'orderId'> & { sortDirection: SortDirection } & { limit: number }
>

export type IncomingListOrdersRequestInput = IncomingListOrdersRequestData

type IncomingListOrdersRequestProps = IncomingListOrdersRequestData

export class IncomingListOrdersRequest implements IncomingListOrdersRequestProps {
  //
  //
  //
  private constructor(
    public readonly orderId?: string,
    public readonly sortDirection?: 'asc' | 'desc',
    public readonly limit?: number,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    incomingListOrdersRequestInput: IncomingListOrdersRequestInput,
  ): Success<IncomingListOrdersRequest> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingListOrdersRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingListOrdersRequestInput })

    const propsResult = this.buildProps(incomingListOrdersRequestInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingListOrdersRequestInput })
      return propsResult
    }

    const { orderId, sortDirection, limit } = propsResult.value
    const incomingListOrdersRequest = new IncomingListOrdersRequest(orderId, sortDirection, limit)
    const incomingListOrdersRequestResult = Result.makeSuccess(incomingListOrdersRequest)
    console.info(`${logContext} exit success:`, { incomingListOrdersRequestResult, incomingListOrdersRequestInput })
    return incomingListOrdersRequestResult
  }

  //
  //
  //
  private static buildProps(
    incomingListOrdersRequestInput: IncomingListOrdersRequestInput,
  ): Success<IncomingListOrdersRequestProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(incomingListOrdersRequestInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { orderId, sortDirection, limit } = incomingListOrdersRequestInput
    const incomingListOrdersRequestProps: IncomingListOrdersRequestProps = {
      orderId,
      sortDirection,
      limit,
    }
    return Result.makeSuccess(incomingListOrdersRequestProps)
  }

  //
  //
  //
  private static validateInput(
    incomingListOrdersRequestInput: IncomingListOrdersRequestInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingListOrdersRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      orderId: ValueValidators.validOrderId().optional(),
      sortDirection: ValueValidators.validSortDirection().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(incomingListOrdersRequestInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingListOrdersRequestInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, incomingListOrdersRequestInput })
      return invalidArgsFailure
    }
  }
}
