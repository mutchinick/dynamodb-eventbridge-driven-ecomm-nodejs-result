import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { OrderError } from '../../errors/OrderError'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'

export interface IEsRaiseOrderPlacedEventClient {
  raiseOrderPlacedEvent: (orderPlacedEvent: OrderPlacedEvent) => Promise<void>
}

export class EsRaiseOrderPlacedEventClient implements IEsRaiseOrderPlacedEventClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async raiseOrderPlacedEvent(orderPlacedEvent: OrderPlacedEvent): Promise<void> {
    try {
      console.info('EsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent init:', { orderPlacedEvent })
      const ddbPutCommand = this.buildDdbPutCommand(orderPlacedEvent)
      await this.ddbDocClient.send(ddbPutCommand)
      console.info('EsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent exit:')
    } catch (error) {
      console.error('EsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent error:', { error })
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
  private buildDdbPutCommand(orderPlacedEvent: OrderPlacedEvent): PutCommand {
    return new PutCommand({
      TableName: process.env.EVENT_STORE_TABLE_NAME,
      Item: {
        pk: `ORDER_ID#${orderPlacedEvent.eventData.orderId}`,
        sk: `EVENT#${orderPlacedEvent.eventName}`,
        _tn: '#EVENT',
        ...orderPlacedEvent,
      },
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    })
  }
}
