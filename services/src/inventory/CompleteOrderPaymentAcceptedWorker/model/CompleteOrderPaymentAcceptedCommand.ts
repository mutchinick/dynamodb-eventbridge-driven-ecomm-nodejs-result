import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { FixedAllocationStatus } from '../../model/AllocationStatus'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderPaymentAcceptedEvent } from './IncomingOrderPaymentAcceptedEvent'

export type CompleteOrderPaymentAcceptedCommandInput = {
  existingOrderAllocationData: OrderAllocationData
  incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent
}

type CompleteOrderPaymentAcceptedCommandData = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'updatedAt' | 'allocationStatus'> & {
    allocationStatus: FixedAllocationStatus<'COMPLETED_PAYMENT_ACCEPTED'>
    expectedAllocationStatus: FixedAllocationStatus<'ALLOCATED'>
  }
>

type CompleteOrderPaymentAcceptedCommandProps = {
  readonly commandData: CompleteOrderPaymentAcceptedCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class CompleteOrderPaymentAcceptedCommand implements CompleteOrderPaymentAcceptedCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: CompleteOrderPaymentAcceptedCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    completeOrderPaymentAcceptedCommandInput: CompleteOrderPaymentAcceptedCommandInput,
  ): Success<CompleteOrderPaymentAcceptedCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'CompleteOrderPaymentAcceptedCommand.validateAndBuild'
    console.info(`${logContext} init:`, { completeOrderPaymentAcceptedCommandInput })

    const propsResult = this.buildProps(completeOrderPaymentAcceptedCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, completeOrderPaymentAcceptedCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const completeOrderPaymentAcceptedCommand = new CompleteOrderPaymentAcceptedCommand(commandData, options)
    const completeOrderPaymentAcceptedCommandResult = Result.makeSuccess(completeOrderPaymentAcceptedCommand)
    console.info(`${logContext} exit success:`, { completeOrderPaymentAcceptedCommandResult })
    return completeOrderPaymentAcceptedCommandResult
  }

  /**
   *
   */
  private static buildProps(
    completeOrderPaymentAcceptedCommandInput: CompleteOrderPaymentAcceptedCommandInput,
  ): Success<CompleteOrderPaymentAcceptedCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(completeOrderPaymentAcceptedCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { existingOrderAllocationData } = completeOrderPaymentAcceptedCommandInput
    const { incomingOrderPaymentAcceptedEvent } = completeOrderPaymentAcceptedCommandInput
    const currentDate = new Date().toISOString()
    const completeOrderPaymentAcceptedCommandProps: CompleteOrderPaymentAcceptedCommandProps = {
      commandData: {
        orderId: incomingOrderPaymentAcceptedEvent.eventData.orderId,
        sku: incomingOrderPaymentAcceptedEvent.eventData.sku,
        units: existingOrderAllocationData.units,
        updatedAt: currentDate,
        allocationStatus: 'COMPLETED_PAYMENT_ACCEPTED',
        expectedAllocationStatus: 'ALLOCATED',
      },
      options: {},
    }
    return Result.makeSuccess(completeOrderPaymentAcceptedCommandProps)
  }

  /**
   *
   */
  private static validateInput(
    completeOrderPaymentAcceptedCommandInput: CompleteOrderPaymentAcceptedCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'CompleteOrderPaymentAcceptedCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const existingOrderAllocationDataSchema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
      allocationStatus: ValueValidators.validAllocationStatus().and(z.literal('ALLOCATED')),
    })

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const incomingOrderPaymentAcceptedEventSchema = z.object({
      eventName: ValueValidators.validInventoryEventNameLiteral(InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT),
      eventData: z.object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
      }),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    })

    const schema = z.object({
      existingOrderAllocationData: existingOrderAllocationDataSchema,
      incomingOrderPaymentAcceptedEvent: incomingOrderPaymentAcceptedEventSchema,
    })

    try {
      schema.parse(completeOrderPaymentAcceptedCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, completeOrderPaymentAcceptedCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, completeOrderPaymentAcceptedCommandInput })
      return invalidArgsFailure
    }
  }
}
