import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'

export interface AllocateOrderStockCommandInput {
  incomingOrderCreatedEvent: IncomingOrderCreatedEvent
}

// TODO: Not all events provide the full Order data
// https://github.com/mutchinick/dynamodb-eventbridge-driven-ecomm-nodejs-result/issues/2
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

    const propsResult = this.buildProps(allocateOrderStockCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, allocateOrderStockCommandInput })
      return propsResult
    }

    const { allocateOrderStockData, options } = propsResult.value
    const allocateOrderStockCommand = new AllocateOrderStockCommand(allocateOrderStockData, options)
    const allocateOrderStockCommandResult = Result.makeSuccess(allocateOrderStockCommand)
    console.info(`${logContext} exit success:`, { allocateOrderStockCommandResult })
    return allocateOrderStockCommandResult
  }

  //
  //
  //
  private static buildProps(
    allocateOrderStockCommandInput: AllocateOrderStockCommandInput,
  ): Success<AllocateOrderStockCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(allocateOrderStockCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }
    const { incomingOrderCreatedEvent } = allocateOrderStockCommandInput
    const { orderId, sku, units, price, userId } = incomingOrderCreatedEvent.eventData
    const date = new Date().toISOString()
    const allocateOrderStockCommandProps: AllocateOrderStockCommandProps = {
      allocateOrderStockData: {
        orderId,
        sku,
        units,
        price,
        userId,
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
  private static validateInput(
    allocateOrderStockCommandInput: AllocateOrderStockCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'AllocateOrderStockCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      incomingOrderCreatedEvent: z.object({
        eventName: ValueValidators.validOrderCreatedEventName(),
        eventData: z.object({
          orderId: ValueValidators.validOrderId(),
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          price: ValueValidators.validPrice(),
          userId: ValueValidators.validUserId(),
        }),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      }),
    })

    try {
      schema.parse(allocateOrderStockCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, allocateOrderStockCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, allocateOrderStockCommandInput })
      return invalidArgsFailure
    }
  }
}
