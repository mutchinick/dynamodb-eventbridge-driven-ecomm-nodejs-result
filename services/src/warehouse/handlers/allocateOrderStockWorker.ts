import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { AllocateOrderStockWorkerController } from '../AllocateOrderStockWorker/AllocateOrderStockWorkerController/AllocateOrderStockWorkerController'
import { AllocateOrderStockWorkerService } from '../AllocateOrderStockWorker/AllocateOrderStockWorkerService/AllocateOrderStockWorkerService'
import { DbAllocateOrderStockClient } from '../AllocateOrderStockWorker/DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { EsRaiseOrderStockAllocatedEventClient } from '../AllocateOrderStockWorker/EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { EsRaiseOrderStockDepletedEventClient } from '../AllocateOrderStockWorker/EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'

function createHandler() {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const allocateOrderStockClient = new DbAllocateOrderStockClient(ddbDocClient)
  const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(ddbDocClient)
  const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(ddbDocClient)
  const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
    allocateOrderStockClient,
    esRaiseOrderStockAllocatedEventClient,
    esRaiseOrderStockDepletedEventClient,
  )
  const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(allocateOrderStockWorkerService)
  return allocateOrderStockWorkerController.allocateOrdersStock
}

export const handler = createHandler()
