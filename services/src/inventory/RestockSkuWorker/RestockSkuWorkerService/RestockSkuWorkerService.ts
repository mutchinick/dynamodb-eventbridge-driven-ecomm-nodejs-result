import { Failure, Result, Success } from '../../errors/Result'
import { IDbRestockSkuClient } from '../DbRestockSkuClient/DbRestockSkuClient'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { RestockSkuCommand, RestockSkuCommandInput } from '../model/RestockSkuCommand'

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

    const inputValidationResult = this.validateInput(incomingSkuRestockedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingSkuRestockedEvent })
      return inputValidationResult
    }

    const restockSkuCommandInput: RestockSkuCommandInput = { incomingSkuRestockedEvent }
    const restockSkuCommandResult = RestockSkuCommand.validateAndBuild(restockSkuCommandInput)
    if (Result.isFailure(restockSkuCommandResult)) {
      console.error(`${logContext} exit failure:`, { restockSkuCommandResult, restockSkuCommandInput })
      return restockSkuCommandResult
    }

    const restockSkuCommand = restockSkuCommandResult.value
    const restockSkuResult = await this.dbRestockSkuClient.restockSku(restockSkuCommand)
    Result.isFailure(restockSkuResult)
      ? console.error(`${logContext} exit failure:`, { restockSkuResult, restockSkuCommand })
      : console.info(`${logContext} exit success:`, { restockSkuResult, restockSkuCommand })

    return restockSkuResult
  }

  //
  //
  //
  private validateInput(
    incomingSkuRestockedEvent: IncomingSkuRestockedEvent,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingSkuRestockedEvent.validateInput'
    console.info(`${logContext} init:`, { incomingSkuRestockedEvent })

    if (incomingSkuRestockedEvent instanceof IncomingSkuRestockedEvent === false) {
      const errorMessage = `Expected IncomingSkuRestockedEvent but got ${incomingSkuRestockedEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingSkuRestockedEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }
}
