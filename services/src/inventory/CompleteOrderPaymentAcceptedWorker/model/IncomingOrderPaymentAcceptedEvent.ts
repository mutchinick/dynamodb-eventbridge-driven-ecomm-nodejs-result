import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { InventoryEvent } from '../../model/InventoryEvent'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderAllocationData } from '../../model/OrderAllocationData'
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

export type IncomingOrderPaymentAcceptedEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderPaymentAcceptedEventData = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type IncomingOrderPaymentAcceptedEventProps = InventoryEvent<
  InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
  IncomingOrderPaymentAcceptedEventData
>

/**
 *
 */
export class IncomingOrderPaymentAcceptedEvent implements IncomingOrderPaymentAcceptedEventProps {
  /**
   *
   */
  private constructor(
    readonly eventName: InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
    readonly eventData: IncomingOrderPaymentAcceptedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   *
   */
  public static validateAndBuild(
    incomingOrderPaymentAcceptedEventInput: IncomingOrderPaymentAcceptedEventInput,
  ): Success<IncomingOrderPaymentAcceptedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderPaymentAcceptedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { incomingOrderPaymentAcceptedEventInput })

    const propsResult = this.buildProps(incomingOrderPaymentAcceptedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, incomingOrderPaymentAcceptedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const incomingOrderPaymentAcceptedEvent = new IncomingOrderPaymentAcceptedEvent(
      eventName,
      eventData,
      createdAt,
      updatedAt,
    )
    const incomingOrderPaymentAcceptedEventResult = Result.makeSuccess(incomingOrderPaymentAcceptedEvent)
    console.info(`${logContext} exit success:`, { incomingOrderPaymentAcceptedEventResult })
    return incomingOrderPaymentAcceptedEventResult
  }

  /**
   *
   */
  private static buildProps(
    incomingOrderPaymentAcceptedEventInput: IncomingOrderPaymentAcceptedEventInput,
  ): Success<IncomingOrderPaymentAcceptedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputParsingResult = this.parseValidateInput(incomingOrderPaymentAcceptedEventInput)
    if (Result.isFailure(inputParsingResult)) {
      return inputParsingResult
    }

    const validInput = inputParsingResult.value
    const { eventName, eventData, createdAt, updatedAt } = validInput
    const { orderId, sku, units, price, userId } = eventData
    const incomingOrderPaymentAcceptedEventProps: IncomingOrderPaymentAcceptedEventProps = {
      eventName,
      eventData: { orderId, sku, units, price, userId },
      createdAt,
      updatedAt,
    }
    return Result.makeSuccess(incomingOrderPaymentAcceptedEventProps)
  }

  /**
   *
   */
  private static parseValidateInput(
    incomingOrderPaymentAcceptedEventInput: IncomingOrderPaymentAcceptedEventInput,
  ): Success<IncomingOrderPaymentAcceptedEventProps> | Failure<'InvalidArgumentsError'> {
    const logContext = 'IncomingOrderPaymentAcceptedEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      eventName: ValueValidators.validInventoryEventNameLiteral(InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT),
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
      const eventDetail = incomingOrderPaymentAcceptedEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderPaymentAcceptedEventProps = schema.parse(
        unverifiedEvent,
      ) as IncomingOrderPaymentAcceptedEventProps
      return Result.makeSuccess(incomingOrderPaymentAcceptedEventProps)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, incomingOrderPaymentAcceptedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderPaymentAcceptedEventInput })
      return invalidArgsFailure
    }
  }
}
