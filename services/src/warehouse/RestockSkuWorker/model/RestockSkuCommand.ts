import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'

export interface RestockSkuCommandInput {
  incomingSkuRestockedEvent: IncomingSkuRestockedEvent
}

type RestockSkuCommandData = RestockSkuData

type RestockSkuCommandProps = {
  readonly restockSkuData: RestockSkuCommandData
  readonly options?: Record<string, unknown>
}

export class RestockSkuCommand implements RestockSkuCommandProps {
  //
  //
  //
  private constructor(
    public readonly restockSkuData: RestockSkuCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    restockSkuCommandInput: RestockSkuCommandInput,
  ): Success<RestockSkuCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'RestockSkuCommand.validateAndBuild'
    console.info(`${logContext} init:`, { restockSkuCommandInput })

    const propsResult = this.buildProps(restockSkuCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, restockSkuCommandInput })
      return propsResult
    }

    const { restockSkuData, options } = propsResult.value
    const restockSkuCommand = new RestockSkuCommand(restockSkuData, options)
    const restockSkuCommandResult = Result.makeSuccess(restockSkuCommand)
    console.info(`${logContext} exit success:`, { restockSkuCommandResult })
    return restockSkuCommandResult
  }

  //
  //
  //
  private static buildProps(
    restockSkuCommandInput: RestockSkuCommandInput,
  ): Success<RestockSkuCommandProps> | Failure<'InvalidArgumentsError'> {
    try {
      this.validateInput(restockSkuCommandInput)
    } catch (error) {
      const logContext = 'RestockSkuCommand.buildProps'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, restockSkuCommandInput })
      return invalidArgsFailure
    }

    const { incomingSkuRestockedEvent } = restockSkuCommandInput
    const { sku, units, lotId } = incomingSkuRestockedEvent.eventData
    const date = new Date().toISOString()
    const restockSkuCommandProps: RestockSkuCommandProps = {
      restockSkuData: { sku, units, lotId, createdAt: date, updatedAt: date },
      options: {},
    }
    return Result.makeSuccess(restockSkuCommandProps)
  }

  //
  //
  //
  private static validateInput(restockSkuCommandInput: RestockSkuCommandInput): void {
    z.object({
      incomingSkuRestockedEvent: z.object({
        eventName: ValueValidators.validSkuRestockedEventName(),
        eventData: z.object({
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          lotId: ValueValidators.validLotId(),
        }),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      }),
    }).parse(restockSkuCommandInput)
  }
}
