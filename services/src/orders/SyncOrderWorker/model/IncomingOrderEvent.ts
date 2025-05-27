import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderEvent } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
import { ValueValidators } from '../../model/ValueValidators'

type EventDetail = {
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventID: string
  eventVersion: string
  awsRegion: string
  dynamodb: {
    NewImage: Record<string, AttributeValue>
  }
}

export type IncomingOrderEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderEventData = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

type IncomingOrderEventProps = OrderEvent<OrderEventName, IncomingOrderEventData>

/**
 *
 */
export class IncomingOrderEvent implements IncomingOrderEventProps {
  /**
   *
   */
  private constructor(
    readonly eventName: OrderEventName,
    readonly eventData: IncomingOrderEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   *
   */
  public static isOrderPlacedEvent(incomingOrderEvent: IncomingOrderEvent): boolean {
    return incomingOrderEvent.eventName === OrderEventName.ORDER_PLACED_EVENT
  }

  /**
   *
   */
  public static validateAndBuild(
    incomingOrderEventInput: IncomingOrderEventInput,
  ): Success<IncomingOrderEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderEvent.validateAndBuild'
    console.info(`${logContext} init:`, { incomingOrderEventInput })

    const propsResult = this.buildProps(incomingOrderEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingOrderEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const incomingOrderEvent = new IncomingOrderEvent(eventName, eventData, createdAt, updatedAt)
    const incomingOrderEventResult = Result.makeSuccess(incomingOrderEvent)
    console.info(`${logContext} exit success:`, { incomingOrderEventResult, incomingOrderEventInput })
    return incomingOrderEventResult
  }

  /**
   *
   */
  private static buildProps(
    incomingOrderEventInput: IncomingOrderEventInput,
  ): Success<IncomingOrderEventProps> | Failure<'InvalidArgumentsError'> {
    const inputParsingResult = this.parseValidateInput(incomingOrderEventInput)
    if (Result.isFailure(inputParsingResult)) {
      return inputParsingResult
    }

    const validInput = inputParsingResult.value
    const { eventName, eventData, createdAt, updatedAt } = validInput
    const { orderId, sku, units, price, userId } = eventData
    const incomingOrderEventProps: IncomingOrderEventProps = {
      eventName,
      eventData: { orderId, sku, units, price, userId },
      createdAt,
      updatedAt,
    }
    return Result.makeSuccess(incomingOrderEventProps)
  }

  /**
   *
   */
  private static parseValidateInput(
    incomingOrderEventInput: IncomingOrderEventInput,
  ): Success<IncomingOrderEventProps> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      eventName: ValueValidators.validOrderEventName(),
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
      const eventDetail = incomingOrderEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderEventProps = schema.parse(unverifiedEvent) as IncomingOrderEventProps
      return Result.makeSuccess(incomingOrderEventProps)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingOrderEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderEventInput })
      return invalidArgsFailure
    }
  }
}
