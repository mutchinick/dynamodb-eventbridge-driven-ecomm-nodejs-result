import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { OrderError } from '../../errors/OrderError'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { IPlaceOrderApiService, ServiceOutput } from '../PlaceOrderApiService/PlaceOrderApiService'
import { PlaceOrderApiController } from './PlaceOrderApiController'

const mockOrderId = 'mockOrderId'

type MockApiEventBody = {
  orderId: string
  sku: string
  units: number
  price: number
  userId: string
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockValidRequest: MockApiEventBody = {
    orderId: mockOrderId,
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingPlaceOrderRequest: IncomingPlaceOrderRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingPlaceOrderRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

function buildMockPlaceOrderApiService_placeOrder_resolves(): IPlaceOrderApiService {
  const mockApiEventBody = buildMockApiEventBody()
  const mockServiceOutput: ServiceOutput = { ...mockApiEventBody }
  return { placeOrder: jest.fn().mockResolvedValue(mockServiceOutput) }
}

function buildMockPlaceOrderApiService_placeOrder_throws(): IPlaceOrderApiService {
  return { placeOrder: jest.fn().mockRejectedValue(new Error()) }
}

function buildMockPlaceOrderApiService_placeOrder_throws_InvalidArgumentsError(): IPlaceOrderApiService {
  const error = new Error()
  OrderError.addName(error, OrderError.InvalidArgumentsError)
  return { placeOrder: jest.fn().mockRejectedValue(error) }
}

describe('Orders Service PlaceOrderApi PlaceOrderApiController tests', () => {
  //
  // Test APIGatewayProxyEventV2 edge cases
  //
  it('responds with 500 Internal Server Error if the APIGatewayProxyEventV2 is undefined', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.InternalServerError()
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2 is invalid', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body is missing', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEvent = {} as unknown as APIGatewayProxyEventV2
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body is empty', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEvent = { body: '' } as unknown as APIGatewayProxyEventV2
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body is not a valid JSON', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.orderId edge cases
  //
  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.orderId is missing', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.orderId
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.orderId is undefined', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.orderId is null', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.orderId is not a string', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.sku edge cases
  //
  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is missing', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.sku
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is undefined', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is null', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is not a string', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.units edge cases
  //
  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is missing', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.units
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is undefined', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is null', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is not a number', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = '1' as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is not an integer', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = 3.45
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.price edge cases
  //
  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.price is missing', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.price
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.price is undefined', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.price = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.price is null', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.price = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.price is not a number', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.price = '1' as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.userId edge cases
  //
  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.userId is missing', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.userId
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.userId is undefined', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.userId = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.userId is null', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.userId = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.userId is not a string', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.userId = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test internal logic
  //
  it('calls PlaceOrderApiService.placeOrder a single time', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).toHaveBeenCalledTimes(1)
  })

  it('calls PlaceOrderApiService.placeOrder with the expected input', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).toHaveBeenCalledWith(expectedServiceInput)
  })

  it('responds with 500 Internal Server Error if PlaceOrderApiService.placeOrder throws', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_throws()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedErrorResponse = HttpResponse.InternalServerError()
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if PlaceOrderApiService.placeOrder throws and InvalidArgumentsError', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_throws_InvalidArgumentsError()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test expected results
  //
  it('responds with status code 202 Accepted', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(actualResponse.statusCode).toStrictEqual(202)
  })

  it('responds with the agreed HttpResponse.Accepted response', async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_placeOrder_resolves()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedAcceptedResponse = HttpResponse.Accepted({ ...mockApiEventBody })
    expect(actualResponse).toStrictEqual(expectedAcceptedResponse)
  })
})
