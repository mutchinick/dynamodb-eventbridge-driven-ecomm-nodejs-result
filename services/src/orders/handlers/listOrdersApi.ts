import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { DbListOrdersClient } from '../ListOrdersApi/DbListOrdersClient/DbListOrdersClient'
import { ListOrdersApiController } from '../ListOrdersApi/ListOrdersApiController/ListOrdersApiController'
import { ListOrdersApiService } from '../ListOrdersApi/ListOrdersApiService/ListOrdersApiService'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const listOrdersClient = new DbListOrdersClient(ddbDocClient)
  const listOrdersApiService = new ListOrdersApiService(listOrdersClient)
  const listOrdersApiController = new ListOrdersApiController(listOrdersApiService)
  return listOrdersApiController.listOrders
}

export const handler = createHandler()
