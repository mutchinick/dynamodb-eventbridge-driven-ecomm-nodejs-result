import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { RestockSkuWorkerController } from '../RestockSkuWorker/RestockSkuWorkerController/RestockSkuWorkerController'
import { RestockSkuWorkerService } from '../RestockSkuWorker/RestockSkuWorkerService/RestockSkuWorkerService'
import { DbRestockSkuClient } from '../RestockSkuWorker/DbRestockSkuClient/DbRestockSkuClient'

function createHandler() {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const restockSkuClient = new DbRestockSkuClient(ddbDocClient)
  const restockSkuWorkerService = new RestockSkuWorkerService(restockSkuClient)
  const restockSkuWorkerController = new RestockSkuWorkerController(restockSkuWorkerService)
  return restockSkuWorkerController.restockSkus
}

export const handler = createHandler()
