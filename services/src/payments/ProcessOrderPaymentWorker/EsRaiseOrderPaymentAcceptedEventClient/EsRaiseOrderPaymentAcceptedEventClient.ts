import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentAcceptedEvent } from '../model/OrderPaymentAcceptedEvent'

export interface IEsRaiseOrderPaymentAcceptedEventClient {
  raiseOrderPaymentAcceptedEvent: (
    orderPaymentAcceptedEvent: OrderPaymentAcceptedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'InvalidArgumentsError'>
    | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class EsRaiseOrderPaymentAcceptedEventClient implements IEsRaiseOrderPaymentAcceptedEventClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
  public async raiseOrderPaymentAcceptedEvent(
    orderPaymentAcceptedEvent: OrderPaymentAcceptedEvent,
  ): Promise<
    | Success<void>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'InvalidArgumentsError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent'
    console.info(`${logContext} init:`, { orderPaymentAcceptedEvent })

    const inputValidationResult = this.validateInput(orderPaymentAcceptedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, orderPaymentAcceptedEvent })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbCommand(orderPaymentAcceptedEvent)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, orderPaymentAcceptedEvent })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, orderPaymentAcceptedEvent })
      : console.info(`${logContext} exit success:`, { sendCommandResult, orderPaymentAcceptedEvent })

    return sendCommandResult
  }

  /**
   *
   */
  private validateInput(
    orderPaymentAcceptedEvent: OrderPaymentAcceptedEvent,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EsRaiseOrderPaymentAcceptedEventClient.validateInput'

    if (orderPaymentAcceptedEvent instanceof OrderPaymentAcceptedEvent === false) {
      const errorMessage = `Expected OrderPaymentAcceptedEvent but got ${orderPaymentAcceptedEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderPaymentAcceptedEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(
    orderPaymentAcceptedEvent: OrderPaymentAcceptedEvent,
  ): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EsRaiseOrderPaymentAcceptedEventClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but PutCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const { eventName, eventData, createdAt, updatedAt } = orderPaymentAcceptedEvent
      const { orderId, sku, units, price, userId } = eventData

      const eventPk = `EVENTS#ORDER_ID#${orderId}`
      const eventSk = `EVENT#${eventName}`
      const eventTn = `EVENTS#EVENT`
      const eventSn = `EVENTS`
      const eventGsi1pk = `EVENTS#EVENT`
      const eventGsi1sk = `CREATED_AT#${createdAt}`

      const ddbCommand = new PutCommand({
        TableName: tableName,
        Item: {
          pk: eventPk,
          sk: eventSk,
          eventName,
          eventData: {
            orderId,
            sku,
            units,
            price,
            userId,
          },
          createdAt,
          updatedAt,
          _tn: eventTn,
          _sn: eventSn,
          gsi1pk: eventGsi1pk,
          gsi1sk: eventGsi1sk,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, orderPaymentAcceptedEvent })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderPaymentAcceptedEvent })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(
    ddbCommand: PutCommand,
  ): Promise<Success<void> | Failure<'UnrecognizedError'> | Failure<'DuplicateEventRaisedError'>> {
    const logContext = 'EsRaiseOrderPaymentAcceptedEventClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult })
      return sendCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, ddbCommand })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Duplication Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (error instanceof ConditionalCheckFailedException) {
        const duplicationFailure = Result.makeFailure('DuplicateEventRaisedError', error, false)
        console.error(`${logContext} exit failure:`, { duplicationFailure, ddbCommand })
        return duplicationFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
    }
  }
}
