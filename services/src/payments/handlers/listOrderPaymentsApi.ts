import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { DbListOrderPaymentsClient } from '../ListOrderPaymentsApi/DbListOrderPaymentsClient/DbListOrderPaymentsClient'
import { ListOrderPaymentsApiController } from '../ListOrderPaymentsApi/ListOrderPaymentsApiController/ListOrderPaymentsApiController'
import { ListOrderPaymentsApiService } from '../ListOrderPaymentsApi/ListOrderPaymentsApiService/ListOrderPaymentsApiService'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const listOrderPaymentsClient = new DbListOrderPaymentsClient(ddbDocClient)
  const listOrderPaymentsApiService = new ListOrderPaymentsApiService(listOrderPaymentsClient)
  const listOrderPaymentsApiController = new ListOrderPaymentsApiController(listOrderPaymentsApiService)
  return listOrderPaymentsApiController.listOrderPayments
}

export const handler = createHandler()
