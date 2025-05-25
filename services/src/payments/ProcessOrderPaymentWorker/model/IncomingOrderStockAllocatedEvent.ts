import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentsEvent } from '../../model/PaymentsEvent'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { ValueValidators } from '../../model/ValueValidators'

type EventDetail = {
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventID: string
  eventVersion: string
  awsRegion: string
  dynamodb: {
    NewImage: AttributeValue | Record<string, AttributeValue>
  }
}

export type IncomingOrderStockAllocatedEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderStockAllocatedEventData = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type IncomingOrderStockAllocatedEventProps = PaymentsEvent<
  PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT,
  IncomingOrderStockAllocatedEventData
>

/**
 *
 */
export class IncomingOrderStockAllocatedEvent implements IncomingOrderStockAllocatedEventProps {
  /**
   *
   */
  private constructor(
    readonly eventName: PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT,
    readonly eventData: IncomingOrderStockAllocatedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    incomingOrderStockAllocatedEventInput: IncomingOrderStockAllocatedEventInput,
  ): Success<IncomingOrderStockAllocatedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderStockAllocatedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEventInput })

    const propsResult = this.buildProps(incomingOrderStockAllocatedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingOrderStockAllocatedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const incomingOrderStockAllocatedEvent = new IncomingOrderStockAllocatedEvent(
      eventName,
      eventData,
      createdAt,
      updatedAt,
    )
    const incomingOrderStockAllocatedEventResult = Result.makeSuccess(incomingOrderStockAllocatedEvent)
    console.info(`${logContext} exit success:`, {
      incomingOrderStockAllocatedEventResult,
      incomingOrderStockAllocatedEventInput,
    })
    return incomingOrderStockAllocatedEventResult
  }

  /**
   *
   */
  private static buildProps(
    incomingOrderStockAllocatedEventInput: IncomingOrderStockAllocatedEventInput,
  ): Success<IncomingOrderStockAllocatedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputParsingResult = this.parseValidateInput(incomingOrderStockAllocatedEventInput)
    if (Result.isFailure(inputParsingResult)) {
      return inputParsingResult
    }

    const validInput = inputParsingResult.value
    const { eventName, eventData, createdAt, updatedAt } = validInput
    const { orderId, sku, units, price, userId } = eventData
    const incomingOrderStockAllocatedEventProps: IncomingOrderStockAllocatedEventProps = {
      eventName,
      eventData: { orderId, sku, units, price, userId },
      createdAt,
      updatedAt,
    }
    return Result.makeSuccess(incomingOrderStockAllocatedEventProps)
  }

  /**
   *
   */
  private static parseValidateInput(
    incomingOrderStockAllocatedEventInput: IncomingOrderStockAllocatedEventInput,
  ): Success<IncomingOrderStockAllocatedEventProps> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderStockAllocatedEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      eventName: ValueValidators.validPaymentsEventNameLiteral(PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT),
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

    try {
      const eventDetail = incomingOrderStockAllocatedEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderStockAllocatedEventProps = schema.parse(
        unverifiedEvent,
      ) as IncomingOrderStockAllocatedEventProps
      return Result.makeSuccess(incomingOrderStockAllocatedEventProps)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingOrderStockAllocatedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderStockAllocatedEventInput })
      return invalidArgsFailure
    }
  }
}
