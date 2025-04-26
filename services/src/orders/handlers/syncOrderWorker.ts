import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { DbCreateOrderClient } from '../SyncOrderWorker/DbCreateOrderClient/DbCreateOrderClient'
import { DbGetOrderClient } from '../SyncOrderWorker/DbGetOrderClient/DbGetOrderClient'
import { DbUpdateOrderClient } from '../SyncOrderWorker/DbUpdateOrderClient/DbUpdateOrderClient'
import { EsRaiseOrderCreatedEventClient } from '../SyncOrderWorker/EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { SyncOrderWorkerController } from '../SyncOrderWorker/SyncOrderWorkerController/SyncOrderWorkerController'
import { SyncOrderWorkerService } from '../SyncOrderWorker/SyncOrderWorkerService/SyncOrderWorkerService'

/**
 *
 */
function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const dbGetOrderClient = new DbGetOrderClient(ddbDocClient)
  const dbCreateOrderClient = new DbCreateOrderClient(ddbDocClient)
  const dbUpdateOrderClient = new DbUpdateOrderClient(ddbDocClient)
  const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(ddbDocClient)
  const syncOrderWorkerService = new SyncOrderWorkerService(
    dbGetOrderClient,
    dbCreateOrderClient,
    dbUpdateOrderClient,
    esRaiseOrderCreatedEventClient,
  )
  const syncOrderWorkerController = new SyncOrderWorkerController(syncOrderWorkerService)
  return syncOrderWorkerController.syncOrders
}

export const handler = createHandler()
