import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderEvent } from './IncomingOrderEvent'

export type CreateOrderCommandInput = {
  incomingOrderEvent: IncomingOrderEvent
}

type CreateOrderCommandData = OrderData

type CreateOrderCommandProps = {
  readonly commandData: CreateOrderCommandData
  readonly options?: Record<string, unknown>
}

//
//
//
export class CreateOrderCommand implements CreateOrderCommandProps {
  //
  //
  //
  private constructor(
    public readonly commandData: CreateOrderCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    createOrderCommandInput: CreateOrderCommandInput,
  ): Success<CreateOrderCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'CreateOrderCommand.validateAndBuild'
    console.info(`${logContext} init:`, { createOrderCommandInput })

    const propsResult = this.buildProps(createOrderCommandInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, createOrderCommandInput })
      return propsResult
    }

    const { commandData, options } = propsResult.value
    const createOrderCommand = new CreateOrderCommand(commandData, options)
    const createOrderCommandResult = Result.makeSuccess(createOrderCommand)
    console.info(`${logContext} exit success:`, { createOrderCommandResult, createOrderCommandInput })
    return createOrderCommandResult
  }

  //
  //
  //
  private static buildProps(
    createOrderCommandInput: CreateOrderCommandInput,
  ): Success<CreateOrderCommandProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(createOrderCommandInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { incomingOrderEvent } = createOrderCommandInput
    const { orderId, sku, units, price, userId } = incomingOrderEvent.eventData
    const currentDate = new Date().toISOString()
    const createOrderCommandProps: CreateOrderCommandProps = {
      commandData: {
        orderId,
        orderStatus: OrderStatus.ORDER_CREATED_STATUS,
        sku,
        units,
        price,
        userId,
        createdAt: currentDate,
        updatedAt: currentDate,
      },
      options: {},
    }
    return Result.makeSuccess(createOrderCommandProps)
  }

  //
  //
  //
  private static validateInput(
    createOrderCommandInput: CreateOrderCommandInput,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'CreateOrderCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      incomingOrderEvent: z.object({
        eventName: ValueValidators.validOrderPlacedEventName(),
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
      schema.parse(createOrderCommandInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, createOrderCommandInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, createOrderCommandInput })
      return invalidArgsFailure
    }
  }
}
