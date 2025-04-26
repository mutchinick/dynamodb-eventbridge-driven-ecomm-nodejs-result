import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { EsRaiseOrderPlacedEventClient } from '../PlaceOrderApi/EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { PlaceOrderApiController } from '../PlaceOrderApi/PlaceOrderApiController/PlaceOrderApiController'
import { PlaceOrderApiService } from '../PlaceOrderApi/PlaceOrderApiService/PlaceOrderApiService'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(ddbDocClient)
  const placeOrderApiService = new PlaceOrderApiService(esRaiseOrderPlacedEventClient)
  const placeOrderApiController = new PlaceOrderApiController(placeOrderApiService)
  return placeOrderApiController.placeOrder
}

export const handler = createHandler()
