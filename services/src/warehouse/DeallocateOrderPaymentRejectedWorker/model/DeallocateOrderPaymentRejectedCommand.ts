import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { AllocationStatus } from '../../model/AllocationStatus'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IncomingOrderPaymentRejectedEvent } from './IncomingOrderPaymentRejectedEvent'

export interface DeallocateOrderPaymentRejectedCommandInput {
  existingOrderAllocationData: OrderAllocationData
  incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent
}

type DeallocateOrderPaymentRejectedCommandData = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'updatedAt' | 'allocationStatus'> & {
    allocationStatus: AllocationStatus<'PAYMENT_REJECTED'>
    expectedAllocationStatus: AllocationStatus<'ALLOCATED'>
  }
>

type DeallocateOrderPaymentRejectedCommandProps = {
  readonly commandData: DeallocateOrderPaymentRejectedCommandData
  readonly options?: Record<string, unknown>
}

//
//
//
export class DeallocateOrderPaymentRejectedCommand implements DeallocateOrderPaymentRejectedCommandProps {
  //
  //
  //
  private constructor(
    public readonly commandData: DeallocateOrderPaymentRejectedCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    deallocateOrderPaymentRejectedCommandInput: DeallocateOrderPaymentRejectedCommandInput,
  ): Success<DeallocateOrderPaymentRejectedCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DeallocateOrderPaymentRejectedCommand.validateAndBuild'
    console.info(`${logContext} init:`, { deallocateOrderPaymentRejectedCommandInput })

    const propsResult = this.buildProps(deallocateOrderPaymentRejectedCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, deallocateOrderPaymentRejectedCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const deallocateOrderPaymentRejectedCommand = new DeallocateOrderPaymentRejectedCommand(commandData, options)
    const deallocateOrderPaymentRejectedCommandResult = Result.makeSuccess(deallocateOrderPaymentRejectedCommand)
    console.info(`${logContext} exit success:`, { deallocateOrderPaymentRejectedCommandResult })
    return deallocateOrderPaymentRejectedCommandResult
  }

  //
  //
  //
  private static buildProps(
    deallocateOrderPaymentRejectedCommandInput: DeallocateOrderPaymentRejectedCommandInput,
  ): Success<DeallocateOrderPaymentRejectedCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(deallocateOrderPaymentRejectedCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { existingOrderAllocationData } = deallocateOrderPaymentRejectedCommandInput
    const { incomingOrderPaymentRejectedEvent } = deallocateOrderPaymentRejectedCommandInput
    const currentDate = new Date().toISOString()
    const deallocateOrderPaymentRejectedCommandProps: DeallocateOrderPaymentRejectedCommandProps = {
      commandData: {
        orderId: incomingOrderPaymentRejectedEvent.eventData.orderId,
        sku: incomingOrderPaymentRejectedEvent.eventData.sku,
        units: existingOrderAllocationData.units,
        updatedAt: currentDate,
        allocationStatus: 'PAYMENT_REJECTED',
        expectedAllocationStatus: 'ALLOCATED',
      },
      options: {},
    }
    return Result.makeSuccess(deallocateOrderPaymentRejectedCommandProps)
  }

  //
  //
  //
  private static validateInput(
    deallocateOrderPaymentRejectedCommandInput: DeallocateOrderPaymentRejectedCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DeallocateOrderPaymentRejectedCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const existingOrderAllocationDataSchema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
      allocationStatus: ValueValidators.validAllocationStatus('ALLOCATED'),
    })

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const incomingOrderPaymentRejectedEventSchema = z.object({
      eventName: ValueValidators.validOrderEventNameGroup([WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT]),
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
      incomingOrderPaymentRejectedEvent: incomingOrderPaymentRejectedEventSchema,
    })

    try {
      schema.parse(deallocateOrderPaymentRejectedCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, deallocateOrderPaymentRejectedCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, deallocateOrderPaymentRejectedCommandInput })
      return invalidArgsFailure
    }
  }
}
