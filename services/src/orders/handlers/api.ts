import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { EsRaiseOrderPlacedEventClient } from '../PlaceOrderApi/EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { PlaceOrderApiController } from '../PlaceOrderApi/PlaceOrderApiController/PlaceOrderApiController'
import { PlaceOrderApiService } from '../PlaceOrderApi/PlaceOrderApiService/PlaceOrderApiService'

function createHandler() {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const placeOrderClient = new EsRaiseOrderPlacedEventClient(ddbDocClient)
  const placeOrderApiService = new PlaceOrderApiService(placeOrderClient)
  const placeOrderApiController = new PlaceOrderApiController(placeOrderApiService)
  return placeOrderApiController.placeOrder
}

export const handler = createHandler()
