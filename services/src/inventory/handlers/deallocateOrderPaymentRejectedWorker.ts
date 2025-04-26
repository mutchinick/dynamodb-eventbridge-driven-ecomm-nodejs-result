import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { DbDeallocateOrderPaymentRejectedClient } from '../DeallocateOrderPaymentRejectedWorker/DbDeallocateOrderPaymentRejectedClient/DbDeallocateOrderPaymentRejectedClient'
import { DbGetOrderAllocationClient } from '../DeallocateOrderPaymentRejectedWorker/DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import { DeallocateOrderPaymentRejectedWorkerController } from '../DeallocateOrderPaymentRejectedWorker/DeallocateOrderPaymentRejectedWorkerController/DeallocateOrderPaymentRejectedWorkerController'
import { DeallocateOrderPaymentRejectedWorkerService } from '../DeallocateOrderPaymentRejectedWorker/DeallocateOrderPaymentRejectedWorkerService/DeallocateOrderPaymentRejectedWorkerService'

/**
 *
 */
function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(ddbDocClient)
  const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(ddbDocClient)
  const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
    dbGetOrderAllocationClient,
    dbDeallocateOrderPaymentRejectedClient,
  )
  const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
    deallocateOrderPaymentRejectedWorkerService,
  )
  return deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock
}

export const handler = createHandler()
