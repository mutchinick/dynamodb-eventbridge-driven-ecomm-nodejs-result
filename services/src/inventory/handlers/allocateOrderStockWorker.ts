import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { AllocateOrderStockWorkerController } from '../AllocateOrderStockWorker/AllocateOrderStockWorkerController/AllocateOrderStockWorkerController'
import { AllocateOrderStockWorkerService } from '../AllocateOrderStockWorker/AllocateOrderStockWorkerService/AllocateOrderStockWorkerService'
import { DbAllocateOrderStockClient } from '../AllocateOrderStockWorker/DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { DbGetOrderAllocationClient } from '../AllocateOrderStockWorker/DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import { EsRaiseOrderStockAllocatedEventClient } from '../AllocateOrderStockWorker/EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { EsRaiseOrderStockDepletedEventClient } from '../AllocateOrderStockWorker/EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'

/**
 *
 */
function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(ddbDocClient)
  const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(ddbDocClient)
  const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(ddbDocClient)
  const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(ddbDocClient)
  const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
    dbGetOrderAllocationClient,
    dbAllocateOrderStockClient,
    esRaiseOrderStockAllocatedEventClient,
    esRaiseOrderStockDepletedEventClient,
  )
  const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(allocateOrderStockWorkerService)
  return allocateOrderStockWorkerController.allocateOrders
}

export const handler = createHandler()
