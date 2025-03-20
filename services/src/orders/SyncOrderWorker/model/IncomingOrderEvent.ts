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

//
//
//
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
    return this.parseValidateInput(incomingOrderEventInput)
  }

  //
  //
  //
  private static parseValidateInput(
    incomingOrderEventInput: IncomingOrderEventInput,
  ): Success<IncomingOrderEventProps> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
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
