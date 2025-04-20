import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'

export type RestockSkuCommandInput = {
  incomingSkuRestockedEvent: IncomingSkuRestockedEvent
}

type RestockSkuCommandData = RestockSkuData

type RestockSkuCommandProps = {
  readonly commandData: RestockSkuCommandData
  readonly options?: Record<string, unknown>
}

export class RestockSkuCommand implements RestockSkuCommandProps {
  //
  //
  //
  private constructor(
    public readonly commandData: RestockSkuCommandData,
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

    const { commandData, options } = propsResult.value
    const restockSkuCommand = new RestockSkuCommand(commandData, options)
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
    const inputValidationResult = this.validateInput(restockSkuCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { incomingSkuRestockedEvent } = restockSkuCommandInput
    const { sku, units, lotId } = incomingSkuRestockedEvent.eventData
    const currentDate = new Date().toISOString()
    const restockSkuCommandProps: RestockSkuCommandProps = {
      commandData: {
        sku,
        units,
        lotId,
        createdAt: currentDate,
        updatedAt: currentDate,
      },
      options: {},
    }
    return Result.makeSuccess(restockSkuCommandProps)
  }

  //
  //
  //
  private static validateInput(
    restockSkuCommandInput: RestockSkuCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'RestockSkuCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
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
    })

    try {
      schema.parse(restockSkuCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, restockSkuCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, restockSkuCommandInput })
      return invalidArgsFailure
    }
  }
}
