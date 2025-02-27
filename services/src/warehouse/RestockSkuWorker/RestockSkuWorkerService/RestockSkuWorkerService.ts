import { Failure, Result, Success } from '../../errors/Result'
import { IDbRestockSkuClient } from '../DbRestockSkuClient/DbRestockSkuClient'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { RestockSkuCommand } from '../model/RestockSkuCommand'

export interface IRestockSkuWorkerService {
  restockSku: (
    incomingSkuRestockedEvent: IncomingSkuRestockedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateRestockOperationError'>
    | Failure<'UnrecognizedError'>
  >
}

export class RestockSkuWorkerService implements IRestockSkuWorkerService {
  //
  //
  //
  constructor(private readonly dbRestockSkuClient: IDbRestockSkuClient) {}

  //
  //
  //
  public async restockSku(
    incomingSkuRestockedEvent: IncomingSkuRestockedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateRestockOperationError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'RestockSkuWorkerService.restockSku'
    console.info(`${logContext} init:`, { incomingSkuRestockedEvent })

    const restockSkuCommandResult = RestockSkuCommand.validateAndBuild({ incomingSkuRestockedEvent })
    if (Result.isFailure(restockSkuCommandResult)) {
      console.error(`${logContext} exit failure:`, { restockSkuCommandResult, incomingSkuRestockedEvent })
      return restockSkuCommandResult
    }

    const restockSkuCommand = restockSkuCommandResult.value
    const restockSkuResult = await this.dbRestockSkuClient.restockSku(restockSkuCommand)
    Result.isFailure(restockSkuResult)
      ? console.error(`${logContext} exit failure:`, { restockSkuResult, restockSkuCommand })
      : console.info(`${logContext} exit success:`, { restockSkuResult, restockSkuCommand })

    return restockSkuResult
  }
}
