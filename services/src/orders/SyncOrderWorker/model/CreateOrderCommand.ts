import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderEvent } from './IncomingOrderEvent'

export interface CreateOrderCommandInput {
  incomingOrderEvent: IncomingOrderEvent
}

type CreateOrderCommandProps = {
  readonly orderData: OrderData
  readonly options?: Record<string, unknown>
}

export class CreateOrderCommand implements CreateOrderCommandProps {
  //
  //
  //
  private constructor(
    public readonly orderData: OrderData,
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

    const { orderData, options } = propsResult.value
    const createOrderCommand = new CreateOrderCommand(orderData, options)
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
    try {
      this.validateInput(createOrderCommandInput)
    } catch (error) {
      const logContext = 'CreateOrderCommand.buildProps'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, createOrderCommandInput })
      return invalidArgsFailure
    }

    const { incomingOrderEvent } = createOrderCommandInput
    const { orderId, sku, units, price, userId } = incomingOrderEvent.eventData
    const date = new Date().toISOString()
    const createOrderCommandProps: CreateOrderCommandProps = {
      orderData: {
        orderId,
        orderStatus: OrderStatus.ORDER_CREATED_STATUS,
        sku,
        units,
        price,
        userId,
        createdAt: date,
        updatedAt: date,
      },
      options: {},
    }
    return Result.makeSuccess(createOrderCommandProps)
  }

  //
  //
  //
  private static validateInput(createOrderCommandInput: CreateOrderCommandInput): void {
    z.object({
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
    }).parse(createOrderCommandInput)
  }
}
