import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { EsRaiseRawSimulatedEventClient } from '../SimulateRawEventApi/EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { SimulateRawEventApiController } from '../SimulateRawEventApi/SimulateRawEventApiController/SimulateRawEventApiController'
import { SimulateRawEventApiService } from '../SimulateRawEventApi/SimulateRawEventApiService/SimulateRawEventApiService'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(ddbDocClient)
  const simulateRawEventApiService = new SimulateRawEventApiService(esRaiseRawSimulatedEventClient)
  const simulateRawEventApiController = new SimulateRawEventApiController(simulateRawEventApiService)
  return simulateRawEventApiController.simulateRawEvent
}

export const handler = createHandler()
