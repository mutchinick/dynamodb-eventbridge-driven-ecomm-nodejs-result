import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { CompleteOrderPaymentAcceptedWorkerController } from '../CompleteOrderPaymentAcceptedWorker/CompleteOrderPaymentAcceptedWorkerController/CompleteOrderPaymentAcceptedWorkerController'
import { CompleteOrderPaymentAcceptedWorkerService } from '../CompleteOrderPaymentAcceptedWorker/CompleteOrderPaymentAcceptedWorkerService/CompleteOrderPaymentAcceptedWorkerService'
import { DbCompleteOrderPaymentAcceptedClient } from '../CompleteOrderPaymentAcceptedWorker/DbCompleteOrderPaymentAcceptedClient/DbCompleteOrderPaymentAcceptedClient'
import { DbGetOrderAllocationClient } from '../CompleteOrderPaymentAcceptedWorker/DbGetOrderAllocationClient/DbGetOrderAllocationClient'

/**
 *
 */
function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(ddbDocClient)
  const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(ddbDocClient)
  const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
    dbGetOrderAllocationClient,
    dbCompleteOrderPaymentAcceptedClient,
  )
  const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
    completeOrderPaymentAcceptedWorkerService,
  )
  return completeOrderPaymentAcceptedWorkerController.completeOrders
}

export const handler = createHandler()
