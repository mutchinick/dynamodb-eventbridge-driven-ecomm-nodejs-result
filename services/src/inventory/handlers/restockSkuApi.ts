import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { EsRaiseSkuRestockedEventClient } from '../RestockSkuApi/EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { RestockSkuApiController } from '../RestockSkuApi/RestockSkuApiController/RestockSkuApiController'
import { RestockSkuApiService } from '../RestockSkuApi/RestockSkuApiService/RestockSkuApiService'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(ddbDocClient)
  const restockSkuApiService = new RestockSkuApiService(esRaiseSkuRestockedEventClient)
  const restockSkuApiController = new RestockSkuApiController(restockSkuApiService)
  return restockSkuApiController.restockSku
}

export const handler = createHandler()
