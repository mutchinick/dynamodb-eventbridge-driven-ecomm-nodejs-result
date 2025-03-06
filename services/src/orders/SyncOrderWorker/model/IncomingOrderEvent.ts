import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderEvent, OrderEventData } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
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

export type IncomingOrderEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderEventProps = OrderEvent<OrderEventName, OrderEventData>

export class IncomingOrderEvent implements IncomingOrderEventProps {
  //
  //
  //
  private constructor(
    readonly eventName: OrderEventName,
    readonly eventData: OrderEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static isOrderPlacedEvent(incomingOrderEvent: IncomingOrderEvent): boolean {
    return incomingOrderEvent.eventName === OrderEventName.ORDER_PLACED_EVENT
  }

  //
  //
  //
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

  //
  //
  //
  private static buildProps(
    incomingOrderEventInput: IncomingOrderEventInput,
  ): Success<IncomingOrderEventProps> | Failure<'InvalidArgumentsError'> {
    try {
      const validInput = this.parseValidateInput(incomingOrderEventInput)
      return Result.makeSuccess(validInput)
    } catch (error) {
      const logContext = 'IncomingOrderEvent.buildProps'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderEventInput })
      return invalidArgsFailure
    }
  }

  //
  //
  //
  private static parseValidateInput(incomingOrderEventInput: IncomingOrderEventInput): IncomingOrderEventProps {
    const eventDetail = incomingOrderEventInput.detail
    const unverifiedIncomingOrderEvent = unmarshall(eventDetail.dynamodb.NewImage) as IncomingOrderEventProps
    const incomingOrderEvent = z
      .object({
        eventName: ValueValidators.validIncomingEventName(),
        eventData: z.object({
          orderId: ValueValidators.validOrderId(),
          orderStatus: ValueValidators.validOrderStatus().optional(),
          sku: ValueValidators.validSku().optional(),
          units: ValueValidators.validUnits().optional(),
          price: ValueValidators.validPrice().optional(),
          userId: ValueValidators.validUserId().optional(),
          createdAt: ValueValidators.validCreatedAt().optional(),
          updatedAt: ValueValidators.validUpdatedAt().optional(),
        }),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      })
      .parse(unverifiedIncomingOrderEvent) as IncomingOrderEventProps
    return incomingOrderEvent
  }
}
