import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
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

type IncomingOrderCreatedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units'>

type IncomingOrderCreatedEventProps = WarehouseEvent<
  WarehouseEventName.ORDER_CREATED_EVENT,
  IncomingOrderCreatedEventData
>

export class IncomingOrderCreatedEvent implements IncomingOrderCreatedEventProps {
  //
  //
  //
  private constructor(
    readonly eventName: WarehouseEventName.ORDER_CREATED_EVENT,
    readonly eventData: IncomingOrderCreatedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    incomingOrderCreatedEventInput: IncomingOrderCreatedEventInput,
  ): Success<IncomingOrderCreatedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderCreatedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { incomingOrderCreatedEventInput })

    const propsResult = this.buildProps(incomingOrderCreatedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingOrderCreatedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const incomingOrderCreatedEvent = new IncomingOrderCreatedEvent(eventName, eventData, createdAt, updatedAt)
    const incomingOrderCreatedEventResult = Result.makeSuccess(incomingOrderCreatedEvent)
    console.info(`${logContext} exit success:`, { incomingOrderCreatedEventResult })
    return incomingOrderCreatedEventResult
  }

  //
  //
  //
  private static buildProps(
    incomingOrderCreatedEventInput: IncomingOrderCreatedEventInput,
  ): Success<IncomingOrderCreatedEventProps> | Failure<'InvalidArgumentsError'> {
    return this.parseValidateInput(incomingOrderCreatedEventInput)
  }

  //
  //
  //
  private static parseValidateInput(
    incomingOrderCreatedEventInput: IncomingOrderCreatedEventInput,
  ): Success<IncomingOrderCreatedEventProps> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderCreatedEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      eventName: ValueValidators.validOrderCreatedEventName(),
      eventData: z.object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
      }),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    })

    try {
      const eventDetail = incomingOrderCreatedEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderCreatedEventProps = schema.parse(unverifiedEvent) as IncomingOrderCreatedEventProps
      return Result.makeSuccess(incomingOrderCreatedEventProps)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingOrderCreatedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderCreatedEventInput })
      return invalidArgsFailure
    }
  }
}
