import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { IDbListSkusClient } from '../DbListSkusClient/DbListSkusClient'
import { IncomingListSkusRequest } from '../model/IncomingListSkusRequest'
import { ListSkusCommand } from '../model/ListSkusCommand'

export interface IListSkusApiService {
  listSkus: (
    incomingListSkusRequest: IncomingListSkusRequest,
  ) => Promise<Success<ListSkusApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export type ListSkusApiServiceOutput = { skus: RestockSkuData[] }

export class ListSkusApiService implements IListSkusApiService {
  //
  //
  //
  constructor(private readonly dbListSkusClient: IDbListSkusClient) {}

  //
  //
  //
  public async listSkus(
    incomingListSkusRequest: IncomingListSkusRequest,
  ): Promise<Success<ListSkusApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'ListSkusApiService.listSkus'
    console.info(`${logContext} init:`, { incomingListSkusRequest })

    const inputValidationResult = this.validateInput(incomingListSkusRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingListSkusRequest })
      return inputValidationResult
    }

    const skusResult = await this.queryDatabase(incomingListSkusRequest)
    if (Result.isFailure(skusResult)) {
      console.error(`${logContext} exit failure:`, { skusResult, incomingListSkusRequest })
      return skusResult
    }

    const skus = skusResult.value
    const serviceOutput: ListSkusApiServiceOutput = { skus }
    const serviceOutputResult = Result.makeSuccess(serviceOutput)
    console.info(`${logContext} exit success:`, { serviceOutputResult, incomingListSkusRequest })
    return serviceOutputResult
  }

  //
  //
  //
  private validateInput(
    incomingListSkusRequest: IncomingListSkusRequest,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ListSkusApiService.validateInput'
    console.info(`${logContext} init:`, { incomingListSkusRequest })

    if (incomingListSkusRequest instanceof IncomingListSkusRequest === false) {
      const errorMessage = `Expected IncomingListSkusRequest but got ${incomingListSkusRequest}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingListSkusRequest })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  //
  //
  //
  private async queryDatabase(
    incomingListSkusRequest: IncomingListSkusRequest,
  ): Promise<Success<RestockSkuData[]> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'ListSkusApiService.queryDatabase'
    console.info(`${logContext} init:`, { incomingListSkusRequest })

    const listSkusCommandResult = ListSkusCommand.validateAndBuild(incomingListSkusRequest)
    if (Result.isFailure(listSkusCommandResult)) {
      console.error(`${logContext} exit failure:`, { listSkusCommandResult, incomingListSkusRequest })
      return listSkusCommandResult
    }

    const listSkusCommand = listSkusCommandResult.value
    const skusResult = await this.dbListSkusClient.listSkus(listSkusCommand)
    Result.isFailure(skusResult)
      ? console.error(`${logContext} exit failure:`, { skusResult, incomingListSkusRequest })
      : console.info(`${logContext} exit success:`, { skusResult, incomingListSkusRequest })

    return skusResult
  }
}
