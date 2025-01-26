import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { EsRaiseSkuRestockedEventClient } from '../RestockSkuApi/EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { RestockSkuApiController } from '../RestockSkuApi/RestockSkuApiController/RestockSkuApiController'
import { RestockSkuApiService } from '../RestockSkuApi/RestockSkuApiService/RestockSkuApiService'

function createHandler() {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const restockSkuClient = new EsRaiseSkuRestockedEventClient(ddbDocClient)
  const restockSkuApiService = new RestockSkuApiService(restockSkuClient)
  const restockSkuApiController = new RestockSkuApiController(restockSkuApiService)
  return restockSkuApiController.restockSku
}

export const handler = createHandler()
