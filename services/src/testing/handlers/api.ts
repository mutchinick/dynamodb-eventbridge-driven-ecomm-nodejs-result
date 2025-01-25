import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { EsRaiseRawSimulatedEventClient } from '../SimulateRawEventApi/EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { SimulateRawEventController } from '../SimulateRawEventApi/SimulateRawEventController/SimulateRawEventController'
import { SimulateRawEventService } from '../SimulateRawEventApi/SimulateRawEventService/SimulateRawEventService'

function createHandler() {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const simulateRawEventClient = new EsRaiseRawSimulatedEventClient(ddbDocClient)
  const simulateRawEventService = new SimulateRawEventService(simulateRawEventClient)
  const simulateRawEventController = new SimulateRawEventController(simulateRawEventService)
  return simulateRawEventController.simulateRawEvent
}

export const handler = createHandler()
