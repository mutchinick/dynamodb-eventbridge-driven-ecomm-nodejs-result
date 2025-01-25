import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { EsRaiseOrderPlacedEventClient } from '../PlaceOrderApi/EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { PlaceOrderController } from '../PlaceOrderApi/PlaceOrderController/PlaceOrderController'
import { PlaceOrderService } from '../PlaceOrderApi/PlaceOrderService/PlaceOrderService'

function createHandler() {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const placeOrderClient = new EsRaiseOrderPlacedEventClient(ddbDocClient)
  const placeOrderService = new PlaceOrderService(placeOrderClient)
  const placeOrderController = new PlaceOrderController(placeOrderService)
  return placeOrderController.placeOrder
}

export const handler = createHandler()
