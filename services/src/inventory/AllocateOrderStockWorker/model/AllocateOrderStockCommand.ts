import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { AllocationStatus } from '../../model/AllocationStatus'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'

export type AllocateOrderStockCommandInput = {
  incomingOrderCreatedEvent: IncomingOrderCreatedEvent
}

type AllocateOrderStockCommandData = TypeUtilsPretty<
  OrderAllocationData & {
    allocationStatus: AllocationStatus<'ALLOCATED'>
  }
>

type AllocateOrderStockCommandProps = {
  readonly commandData: AllocateOrderStockCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class AllocateOrderStockCommand implements AllocateOrderStockCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: AllocateOrderStockCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   *
   */
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

    const { commandData, options } = propsResult.value
    const allocateOrderStockCommand = new AllocateOrderStockCommand(commandData, options)
    const allocateOrderStockCommandResult = Result.makeSuccess(allocateOrderStockCommand)
    console.info(`${logContext} exit success:`, { allocateOrderStockCommandResult })
    return allocateOrderStockCommandResult
  }

  /**
   *
   */
  private static buildProps(
    allocateOrderStockCommandInput: AllocateOrderStockCommandInput,
  ): Success<AllocateOrderStockCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(allocateOrderStockCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { incomingOrderCreatedEvent } = allocateOrderStockCommandInput
    const { orderId, sku, units, price, userId } = incomingOrderCreatedEvent.eventData
    const currentDate = new Date().toISOString()
    const allocateOrderStockCommandProps: AllocateOrderStockCommandProps = {
      commandData: {
        orderId,
        sku,
        units,
        price,
        userId,
        createdAt: currentDate,
        updatedAt: currentDate,
        allocationStatus: 'ALLOCATED',
      },
      options: {},
    }
    return Result.makeSuccess(allocateOrderStockCommandProps)
  }

  /**
   *
   */
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
