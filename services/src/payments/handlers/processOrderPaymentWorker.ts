import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { SdkPaymentGatewayClient } from '../ProcessOrderPaymentWorker/__external/SdkPaymentGatewayClient/SdkPaymentGatewayClient'
import { AxSubmitOrderPaymentClient } from '../ProcessOrderPaymentWorker/AxSubmitOrderPaymentClient/AxSubmitOrderPaymentClient'
import { DbGetOrderPaymentClient } from '../ProcessOrderPaymentWorker/DbGetOrderPaymentClient/DbGetOrderPaymentClient'
import { DbRecordOrderPaymentClient } from '../ProcessOrderPaymentWorker/DbRecordOrderPaymentClient/DbRecordOrderPaymentClient'
import { EsRaiseOrderPaymentAcceptedEventClient } from '../ProcessOrderPaymentWorker/EsRaiseOrderPaymentAcceptedEventClient/EsRaiseOrderPaymentAcceptedEventClient'
import { EsRaiseOrderPaymentRejectedEventClient } from '../ProcessOrderPaymentWorker/EsRaiseOrderPaymentRejectedEventClient/EsRaiseOrderPaymentRejectedEventClient'
import { ProcessOrderPaymentWorkerController } from '../ProcessOrderPaymentWorker/ProcessOrderPaymentWorkerController/ProcessOrderPaymentWorkerController'
import { ProcessOrderPaymentWorkerService } from '../ProcessOrderPaymentWorker/ProcessOrderPaymentWorkerService/ProcessOrderPaymentWorkerService'

/**
 *
 */
function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const getOrderPaymentClient = new DbGetOrderPaymentClient(ddbDocClient)
  const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(new SdkPaymentGatewayClient())
  const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(ddbDocClient)
  const esRaiseOrderPaymentAcceptedEventClient = new EsRaiseOrderPaymentAcceptedEventClient(ddbDocClient)
  const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(ddbDocClient)
  const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
    getOrderPaymentClient,
    axSubmitOrderPaymentClient,
    dbRecordOrderPaymentClient,
    esRaiseOrderPaymentAcceptedEventClient,
    esRaiseOrderPaymentRejectedEventClient,
  )
  const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(processOrderPaymentWorkerService)
  return processOrderPaymentWorkerController.processOrderPayments
}

export const handler = createHandler()
