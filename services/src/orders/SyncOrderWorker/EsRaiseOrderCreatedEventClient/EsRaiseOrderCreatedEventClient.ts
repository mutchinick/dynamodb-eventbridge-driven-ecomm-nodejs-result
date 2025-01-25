import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { OrderError } from '../../errors/OrderError'
import { OrderCreatedEvent } from '../model/OrderCreatedEvent'

export interface IEsRaiseOrderCreatedEventClient {
  raiseOrderCreatedEvent: (orderCreatedEvent: OrderCreatedEvent) => Promise<void>
}

export class EsRaiseOrderCreatedEventClient implements IEsRaiseOrderCreatedEventClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async raiseOrderCreatedEvent(orderCreatedEvent: OrderCreatedEvent): Promise<void> {
    try {
      console.info('EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent init:', { orderCreatedEvent })
      const ddbPutCommand = this.buildDdbPutCommand(orderCreatedEvent)
      await this.ddbDocClient.send(ddbPutCommand)
      console.info('EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent exit:')
    } catch (error) {
      console.error('EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent error:', { error })
      if (OrderError.hasName(error, OrderError.ConditionalCheckFailedException)) {
        OrderError.addName(error, OrderError.InvalidEventRaiseOperationError_Redundant)
        OrderError.addName(error, OrderError.DoNotRetryError)
      }
      throw error
    }
  }

  //
  //
  //
  private buildDdbPutCommand(orderCreatedEvent: OrderCreatedEvent): PutCommand {
    return new PutCommand({
      TableName: process.env.EVENT_STORE_TABLE_NAME,
      Item: {
        pk: `ORDER_ID#${orderCreatedEvent.eventData.orderId}`,
        sk: `EVENT#${orderCreatedEvent.eventName}`,
        _tn: 'EVENT',
        ...orderCreatedEvent,
      },
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    })
  }
}
