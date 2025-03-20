import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { DbRestockSkuClient } from '../RestockSkuWorker/DbRestockSkuClient/DbRestockSkuClient'
import { RestockSkuWorkerController } from '../RestockSkuWorker/RestockSkuWorkerController/RestockSkuWorkerController'
import { RestockSkuWorkerService } from '../RestockSkuWorker/RestockSkuWorkerService/RestockSkuWorkerService'

function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const dbRestockSkuClient = new DbRestockSkuClient(ddbDocClient)
  const restockSkuWorkerService = new RestockSkuWorkerService(dbRestockSkuClient)
  const restockSkuWorkerController = new RestockSkuWorkerController(restockSkuWorkerService)
  return restockSkuWorkerController.restockSkus
}

export const handler = createHandler()
