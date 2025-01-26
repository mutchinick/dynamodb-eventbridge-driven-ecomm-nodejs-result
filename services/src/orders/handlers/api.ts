import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { EsRaiseOrderPlacedEventClient } from '../PlaceOrderApi/EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { PlaceOrderApiController } from '../PlaceOrderApi/PlaceOrderApiController/PlaceOrderApiController'
import { PlaceOrderService } from '../PlaceOrderApi/PlaceOrderService/PlaceOrderService'

function createHandler() {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const placeOrderClient = new EsRaiseOrderPlacedEventClient(ddbDocClient)
  const placeOrderService = new PlaceOrderService(placeOrderClient)
  const placeOrderApiController = new PlaceOrderApiController(placeOrderService)
  return placeOrderApiController.placeOrder
}

export const handler = createHandler()
