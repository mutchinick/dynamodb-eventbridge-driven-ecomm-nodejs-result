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

// TODO: Not all events provide the full Order data
// https://github.com/mutchinick/dynamodb-eventbridge-driven-ecomm-nodejs-result/issues/2
type IncomingOrderCreatedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
// type IncomingOrderCreatedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units'>

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
    const inputParsingResult = this.parseValidateInput(incomingOrderCreatedEventInput)
    if (Result.isFailure(inputParsingResult)) {
      return inputParsingResult
    }

    const validInput = inputParsingResult.value
    const incomingOrderCreatedEventProps: IncomingOrderCreatedEventProps = {
      eventName: validInput.eventName,
      eventData: {
        orderId: validInput.eventData.orderId,
        sku: validInput.eventData.sku,
        units: validInput.eventData.units,
        price: validInput.eventData.price,
        userId: validInput.eventData.userId,
      },
      createdAt: validInput.createdAt,
      updatedAt: validInput.updatedAt,
    }
    return Result.makeSuccess(incomingOrderCreatedEventProps)
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
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
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
