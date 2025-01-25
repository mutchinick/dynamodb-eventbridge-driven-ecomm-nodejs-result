import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TestingError } from '../../errors/TestingError'
import { RawSimulatedEvent } from '../model/RawSimulatedEvent'

export interface IEsRaiseRawSimulatedEventClient {
  raiseRawSimulatedEvent: (rawSimulatedEvent: RawSimulatedEvent) => Promise<void>
}

export class EsRaiseRawSimulatedEventClient implements IEsRaiseRawSimulatedEventClient {
  //
  //
  //
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  //
  //
  //
  public async raiseRawSimulatedEvent(rawSimulatedEvent: RawSimulatedEvent): Promise<void> {
    try {
      console.info('EsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent init:', { rawSimulatedEvent })
      const ddbPutCommand = this.buildDdbPutCommand(rawSimulatedEvent)
      await this.ddbDocClient.send(ddbPutCommand)
      console.info('EsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent exit:')
    } catch (error) {
      console.error('EsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent error:', { error })
      if (TestingError.hasName(error, TestingError.ConditionalCheckFailedException)) {
        TestingError.addName(error, TestingError.InvalidEventRaiseOperationError_Redundant)
        TestingError.addName(error, TestingError.DoNotRetryError)
      }
      throw error
    }
  }

  //
  //
  //
  private buildDdbPutCommand(rawSimulatedEvent: RawSimulatedEvent): PutCommand {
    return new PutCommand({
      TableName: process.env.EVENT_STORE_TABLE_NAME,
      Item: { ...rawSimulatedEvent },
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    })
  }
}
