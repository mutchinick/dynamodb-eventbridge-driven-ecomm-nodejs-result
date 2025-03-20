import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
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

export type IncomingSkuRestockedEventInput = EventBridgeEvent<string, EventDetail>

type IncomingSkuRestockedEventData = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

type IncomingSkuRestockedEventProps = WarehouseEvent<
  WarehouseEventName.SKU_RESTOCKED_EVENT,
  IncomingSkuRestockedEventData
>

export class IncomingSkuRestockedEvent implements IncomingSkuRestockedEventProps {
  //
  //
  //
  private constructor(
    readonly eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    readonly eventData: IncomingSkuRestockedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    incomingSkuRestockedEventInput: IncomingSkuRestockedEventInput,
  ): Success<IncomingSkuRestockedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingSkuRestockedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { incomingSkuRestockedEventInput })

    const propsResult = this.buildProps(incomingSkuRestockedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingSkuRestockedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const incomingSkuRestockedEvent = new IncomingSkuRestockedEvent(eventName, eventData, createdAt, updatedAt)
    const incomingSkuRestockedEventResult = Result.makeSuccess(incomingSkuRestockedEvent)
    console.info(`${logContext} exit success:`, { incomingSkuRestockedEventResult })
    return incomingSkuRestockedEventResult
  }

  //
  //
  //
  private static buildProps(
    incomingSkuRestockedEventInput: IncomingSkuRestockedEventInput,
  ): Success<IncomingSkuRestockedEventProps> | Failure<'InvalidArgumentsError'> {
    return this.parseValidateInput(incomingSkuRestockedEventInput)
  }

  //
  //
  //
  private static parseValidateInput(
    incomingSkuRestockedEventInput: IncomingSkuRestockedEventInput,
  ): Success<IncomingSkuRestockedEventProps> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingSkuRestockedEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      eventName: ValueValidators.validSkuRestockedEventName(),
      eventData: z.object({
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        lotId: ValueValidators.validLotId(),
      }),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    })

    try {
      const eventDetail = incomingSkuRestockedEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingSkuRestockedEventProps = schema.parse(unverifiedEvent) as IncomingSkuRestockedEventProps
      return Result.makeSuccess(incomingSkuRestockedEventProps)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingSkuRestockedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingSkuRestockedEventInput })
      return invalidArgsFailure
    }
  }
}
