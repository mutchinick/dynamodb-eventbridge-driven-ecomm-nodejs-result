import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { WarehouseError } from '../../errors/WarehouseError'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'

export interface IEsRaiseSkuRestockedEventClient {
  raiseSkuRestockedEvent: (skuRestockedEvent: SkuRestockedEvent) => Promise<void>
}

export class EsRaiseSkuRestockedEventClient implements IEsRaiseSkuRestockedEventClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async raiseSkuRestockedEvent(skuRestockedEvent: SkuRestockedEvent): Promise<void> {
    try {
      console.info('EsRaiseSkuRestockedEventClient.raiseSkuRestockedEvent init:', { skuRestockedEvent })
      const ddbPutCommand = this.buildDdbPutCommand(skuRestockedEvent)
      await this.ddbDocClient.send(ddbPutCommand)
      console.info('EsRaiseSkuRestockedEventClient.raiseSkuRestockedEvent exit:')
    } catch (error) {
      console.error('EsRaiseSkuRestockedEventClient.raiseSkuRestockedEvent error:', { error })
      if (WarehouseError.hasName(error, WarehouseError.ConditionalCheckFailedException)) {
        WarehouseError.addName(error, WarehouseError.InvalidEventRaiseOperationError_Redundant)
        WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      }
      throw error
    }
  }

  //
  //
  //
  private buildDdbPutCommand(skuRestockedEvent: SkuRestockedEvent): PutCommand {
    return new PutCommand({
      TableName: process.env.EVENT_STORE_TABLE_NAME,
      Item: {
        pk: `SKU#${skuRestockedEvent.eventData.sku}`,
        sk: `EVENT#${skuRestockedEvent.eventName}#LOT_ID#${skuRestockedEvent.eventData.lotId}`,
        _tn: 'EVENT',
        ...skuRestockedEvent,
      },
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    })
  }
}
