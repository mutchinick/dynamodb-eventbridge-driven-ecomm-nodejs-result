import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderAllocationData } from '../../model/OrderAllocationData'
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

export type IncomingOrderPaymentRejectedEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderPaymentRejectedEventData = Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>

type IncomingOrderPaymentRejectedEventProps = WarehouseEvent<
  WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT,
  IncomingOrderPaymentRejectedEventData
>

export class IncomingOrderPaymentRejectedEvent implements IncomingOrderPaymentRejectedEventProps {
  //
  //
  //
  private constructor(
    readonly eventName: WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT,
    readonly eventData: IncomingOrderPaymentRejectedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    incomingOrderPaymentRejectedEventInput: IncomingOrderPaymentRejectedEventInput,
  ): Success<IncomingOrderPaymentRejectedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderPaymentRejectedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { incomingOrderPaymentRejectedEventInput })

    const propsResult = this.buildProps(incomingOrderPaymentRejectedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingOrderPaymentRejectedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const incomingOrderPaymentRejectedEvent = new IncomingOrderPaymentRejectedEvent(
      eventName,
      eventData,
      createdAt,
      updatedAt,
    )
    const incomingOrderPaymentRejectedEventResult = Result.makeSuccess(incomingOrderPaymentRejectedEvent)
    console.info(`${logContext} exit success:`, { incomingOrderPaymentRejectedEventResult })
    return incomingOrderPaymentRejectedEventResult
  }

  //
  //
  //
  private static buildProps(
    incomingOrderPaymentRejectedEventInput: IncomingOrderPaymentRejectedEventInput,
  ): Success<IncomingOrderPaymentRejectedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputParsingResult = this.parseValidateInput(incomingOrderPaymentRejectedEventInput)
    if (Result.isFailure(inputParsingResult)) {
      return inputParsingResult
    }

    const validInput = inputParsingResult.value
    const incomingOrderPaymentRejectedEventProps: IncomingOrderPaymentRejectedEventProps = {
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
    return Result.makeSuccess(incomingOrderPaymentRejectedEventProps)
  }

  //
  //
  //
  private static parseValidateInput(
    incomingOrderPaymentRejectedEventInput: IncomingOrderPaymentRejectedEventInput,
  ): Success<IncomingOrderPaymentRejectedEventProps> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderPaymentRejectedEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      eventName: ValueValidators.validOrderEventNameGroup([WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT]),
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
      const eventDetail = incomingOrderPaymentRejectedEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderPaymentRejectedEventProps = schema.parse(
        unverifiedEvent,
      ) as IncomingOrderPaymentRejectedEventProps
      return Result.makeSuccess(incomingOrderPaymentRejectedEventProps)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingOrderPaymentRejectedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderPaymentRejectedEventInput })
      return invalidArgsFailure
    }
  }
}
