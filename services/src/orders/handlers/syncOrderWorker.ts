import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { DbGetOrderClient } from '../SyncOrderWorker/DbGetOrderClient/DbGetOrderClient'
import { DbCreateOrderClient } from '../SyncOrderWorker/DbCreateOrderClient/DbCreateOrderClient'
import { EsRaiseOrderCreatedEventClient } from '../SyncOrderWorker/EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { DbUpdateOrderClient } from '../SyncOrderWorker/DbUpdateOrderClient/DbUpdateOrderClient'
import { SyncOrderWorkerController } from '../SyncOrderWorker/SyncOrderWorkerController/SyncOrderWorkerController'
import { SyncOrderService } from '../SyncOrderWorker/SyncOrderService/SyncOrderService'

function createHandler() {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const getOrderClient = new DbGetOrderClient(ddbDocClient)
  const createOrderClient = new DbCreateOrderClient(ddbDocClient)
  const updateOrderClient = new DbUpdateOrderClient(ddbDocClient)
  const syncOrderEventClient = new EsRaiseOrderCreatedEventClient(ddbDocClient)
  const syncOrderService = new SyncOrderService(
    getOrderClient,
    createOrderClient,
    updateOrderClient,
    syncOrderEventClient,
  )
  const syncOrderWorkerController = new SyncOrderWorkerController(syncOrderService)
  return syncOrderWorkerController.syncOrders
}

export const handler = createHandler()
