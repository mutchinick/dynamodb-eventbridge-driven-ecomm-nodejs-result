import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { OrderError } from '../../errors/OrderError'
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
  private constructor(
    readonly eventName: OrderEventName,
    readonly eventData: OrderEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  public static validateAndBuild(incomingOrderEventInput: IncomingOrderEventInput) {
    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildIncomingOrderEventProps(incomingOrderEventInput)
      return new IncomingOrderEvent(eventName, eventData, createdAt, updatedAt)
    } catch (error) {
      console.error('IncomingOrderEvent.validateAndBuild', { error, incomingOrderEventInput })
      throw error
    }
  }

  //
  //
  //
  private static buildIncomingOrderEventProps(
    incomingOrderEventInput: IncomingOrderEventInput,
  ): IncomingOrderEventProps {
    try {
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
    } catch (error) {
      OrderError.addName(error, OrderError.InvalidArgumentsError)
      OrderError.addName(error, OrderError.DoNotRetryError)
      throw error
    }
  }

  //
  //
  //
  public static isOrderPlacedEvent(incomingOrderEvent: IncomingOrderEvent) {
    return incomingOrderEvent.eventName === OrderEventName.ORDER_PLACED_EVENT
  }
}
