import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { WarehouseError } from '../../errors/WarehouseError'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

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

export type IncomingOrderCreatedEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderCreatedEventData = Pick<AllocateOrderStockData, 'sku' | 'units' | 'orderId'>

type IncomingOrderCreatedEventProps = WarehouseEvent<
  WarehouseEventName.ORDER_CREATED_EVENT,
  IncomingOrderCreatedEventData
>

export class IncomingOrderCreatedEvent implements IncomingOrderCreatedEventProps {
  private constructor(
    readonly eventName: WarehouseEventName.ORDER_CREATED_EVENT,
    readonly eventData: IncomingOrderCreatedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  public static validateAndBuild(incomingOrderCreatedEventInput: IncomingOrderCreatedEventInput) {
    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(incomingOrderCreatedEventInput)
      return new IncomingOrderCreatedEvent(eventName, eventData, createdAt, updatedAt)
    } catch (error) {
      console.error('IncomingOrderCreatedEvent.validateAndBuild', { error, incomingOrderCreatedEventInput })
      throw error
    }
  }

  //
  //
  //
  private static buildProps(
    incomingOrderCreatedEventInput: IncomingOrderCreatedEventInput,
  ): IncomingOrderCreatedEventProps {
    try {
      const eventDetail = incomingOrderCreatedEventInput.detail
      const unverifiedIncomingOrderCreatedEvent = unmarshall(
        eventDetail.dynamodb.NewImage,
      ) as IncomingOrderCreatedEventProps
      const incomingOrderCreatedEvent = z
        .object({
          eventName: ValueValidators.validOrderCreatedEventName(),
          eventData: z.object({
            sku: ValueValidators.validSku(),
            units: ValueValidators.validUnits(),
            orderId: ValueValidators.validOrderId(),
          }),
          createdAt: ValueValidators.validCreatedAt(),
          updatedAt: ValueValidators.validUpdatedAt(),
        })
        .parse(unverifiedIncomingOrderCreatedEvent) as IncomingOrderCreatedEventProps
      return incomingOrderCreatedEvent
    } catch (error) {
      WarehouseError.addName(error, WarehouseError.InvalidArgumentsError)
      WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      throw error
    }
  }
}
