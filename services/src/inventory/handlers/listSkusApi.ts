import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { DbListSkusClient } from '../ListSkusApi/DbListSkusClient/DbListSkusClient'
import { ListSkusApiController } from '../ListSkusApi/ListSkusApiController/ListSkusApiController'
import { ListSkusApiService } from '../ListSkusApi/ListSkusApiService/ListSkusApiService'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const listSkusClient = new DbListSkusClient(ddbDocClient)
  const listSkusApiService = new ListSkusApiService(listSkusClient)
  const listSkusApiController = new ListSkusApiController(listSkusApiService)
  return listSkusApiController.listSkus
}

export const handler = createHandler()
