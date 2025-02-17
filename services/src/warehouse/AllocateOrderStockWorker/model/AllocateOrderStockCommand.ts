import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'

export interface AllocateOrderStockCommandInput {
  incomingOrderCreatedEvent: IncomingOrderCreatedEvent
}

type AllocateOrderStockCommandData = AllocateOrderStockData

type AllocateOrderStockCommandProps = {
  readonly allocateOrderStockData: AllocateOrderStockCommandData
  readonly options?: Record<string, unknown>
}

export class AllocateOrderStockCommand implements AllocateOrderStockCommandProps {
  //
  //
  //
  private constructor(
    public readonly allocateOrderStockData: AllocateOrderStockCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    allocateOrderStockCommandInput: AllocateOrderStockCommandInput,
  ): Success<AllocateOrderStockCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'AllocateOrderStockCommand.validateAndBuild'
    console.info(`${logContext} init:`, { allocateOrderStockCommandInput })

    const propsResult = this.buildPropsSafe(allocateOrderStockCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, allocateOrderStockCommandInput })
      return propsResult
    }

    const props = propsResult.value
    const { allocateOrderStockData, options } = props
    const allocateOrderStockCommand = new AllocateOrderStockCommand(allocateOrderStockData, options)
    const allocateOrderStockCommandResult = Result.makeSuccess(allocateOrderStockCommand)
    console.info(`${logContext} exit success:`, { allocateOrderStockCommandResult })
    return allocateOrderStockCommandResult
  }

  //
  //
  //
  private static buildPropsSafe(
    allocateOrderStockCommandInput: AllocateOrderStockCommandInput,
  ): Success<AllocateOrderStockCommandProps> | Failure<'InvalidArgumentsError'> {
    try {
      this.validateInput(allocateOrderStockCommandInput)
    } catch (error) {
      const logContext = 'IncomingOrderCreatedEvent.buildPropsSafe'
      console.error(`${logContext} error:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, allocateOrderStockCommandInput })
      return invalidArgsFailure
    }

    const { incomingOrderCreatedEvent } = allocateOrderStockCommandInput
    const { sku, orderId, units } = incomingOrderCreatedEvent.eventData
    const date = new Date().toISOString()
    const allocateOrderStockCommandProps: AllocateOrderStockCommandProps = {
      allocateOrderStockData: {
        sku,
        units,
        orderId,
        createdAt: date,
        updatedAt: date,
      },
      options: {},
    }
    return Result.makeSuccess(allocateOrderStockCommandProps)
  }

  //
  //
  //
  private static validateInput(allocateOrderStockCommandInput: AllocateOrderStockCommandInput): void {
    z.object({
      incomingOrderCreatedEvent: z.object({
        eventName: ValueValidators.validOrderCreatedEventName(),
        eventData: z.object({
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          orderId: ValueValidators.validOrderId(),
        }),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      }),
    }).parse(allocateOrderStockCommandInput)
  }
}
