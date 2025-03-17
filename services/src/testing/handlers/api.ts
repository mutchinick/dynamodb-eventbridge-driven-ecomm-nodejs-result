import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { EsRaiseRawSimulatedEventClient } from '../SimulateRawEventApi/EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { SimulateRawEventApiController } from '../SimulateRawEventApi/SimulateRawEventApiController/SimulateRawEventApiController'
import { SimulateRawEventApiService } from '../SimulateRawEventApi/SimulateRawEventApiService/SimulateRawEventApiService'

function createHandler() {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(ddbDocClient)
  const simulateRawEventApiService = new SimulateRawEventApiService(esRaiseRawSimulatedEventClient)
  const simulateRawEventApiController = new SimulateRawEventApiController(simulateRawEventApiService)
  return simulateRawEventApiController.simulateRawEvent
}

export const handler = createHandler()
