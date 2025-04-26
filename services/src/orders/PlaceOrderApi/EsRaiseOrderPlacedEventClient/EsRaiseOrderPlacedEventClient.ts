import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'

export interface IEsRaiseOrderPlacedEventClient {
  raiseOrderPlacedEvent: (
    orderPlacedEvent: OrderPlacedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class EsRaiseOrderPlacedEventClient implements IEsRaiseOrderPlacedEventClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
  public async raiseOrderPlacedEvent(
    orderPlacedEvent: OrderPlacedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'EsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent'
    console.info(`${logContext} init:`, { orderPlacedEvent })

    const inputValidationResult = this.validateInput(orderPlacedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, orderPlacedEvent })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbCommand(orderPlacedEvent)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, orderPlacedEvent })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, orderPlacedEvent })
      : console.info(`${logContext} exit success:`, { sendCommandResult, orderPlacedEvent })

    return sendCommandResult
  }

  /**
   *
   */
  private validateInput(orderPlacedEvent: OrderPlacedEvent): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EsRaiseOrderPlacedEventClient.validateInput'

    if (orderPlacedEvent instanceof OrderPlacedEvent === false) {
      const errorMessage = `Expected OrderPlacedEvent but got ${orderPlacedEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, orderPlacedEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(orderPlacedEvent: OrderPlacedEvent): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EsRaiseOrderPlacedEventClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but PutCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const { eventName, eventData, createdAt, updatedAt } = orderPlacedEvent
      const { orderId, sku, units, price, userId } = eventData

      const eventPk = `EVENTS#ORDER_ID#${orderPlacedEvent.eventData.orderId}`
      const eventSk = `EVENT#${orderPlacedEvent.eventName}`
      const eventTn = `EVENTS#EVENT`
      const eventSn = `EVENTS`
      const eventGsi1pk = `EVENTS#EVENT`
      const eventGsi1sk = `CREATED_AT#${orderPlacedEvent.createdAt}`

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
      console.error(`${logContext} error caught:`, { error, orderPlacedEvent })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} failure exit:`, { invalidArgsFailure, orderPlacedEvent })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(
    ddbCommand: PutCommand,
  ): Promise<Success<void> | Failure<'DuplicateEventRaisedError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'EsRaiseOrderPlacedEventClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult, ddbCommand })
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
