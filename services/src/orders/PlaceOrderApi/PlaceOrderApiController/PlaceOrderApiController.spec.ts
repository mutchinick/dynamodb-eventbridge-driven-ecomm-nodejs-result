import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { IPlaceOrderApiService, PlaceOrderApiServiceOutput } from '../PlaceOrderApiService/PlaceOrderApiService'
import { PlaceOrderApiController } from './PlaceOrderApiController'

const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 3.98
const mockUserId = 'mockUserId'

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
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingPlaceOrderRequest: IncomingPlaceOrderRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingPlaceOrderRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockPlaceOrderApiService_succeeds(): IPlaceOrderApiService {
  const mockApiEventBody = buildMockApiEventBody()
  const mockServiceOutput: PlaceOrderApiServiceOutput = mockApiEventBody
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { placeOrder: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockPlaceOrderApiService_fails(failureKind: FailureKind): IPlaceOrderApiService {
  const mockFailure = Result.makeFailure(failureKind, failureKind, false)
  return { placeOrder: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Orders Service PlaceOrderApi PlaceOrderApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(placeOrderApiController.placeOrder(mockApiEvent)).resolves.not.toThrow()
  })

  it(`fails to call PlaceOrderApiService if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call PlaceOrderApiService if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body edge cases
   ************************************************************/
  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.orderId edge cases
   ************************************************************/
  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body.orderId is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.orderId is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body.orderId is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.orderId is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.sku edge cases
   ************************************************************/
  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body.sku is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.sku is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body.sku is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.sku is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.units edge cases
   ************************************************************/
  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body.units is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.units is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body.units is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.units is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.price edge cases
   ************************************************************/
  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body.price is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.price = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.price is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.price = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body.price is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.price = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.price is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.price = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.userId edge cases
   ************************************************************/
  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body.userId is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.userId = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.userId is undefined`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.userId = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call PlaceOrderApiService.placeOrder if the input APIGatewayProxyEventV2.body.userId is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.userId = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.userId is null`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.userId = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls PlaceOrderApiService.placeOrder a single time`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).toHaveBeenCalledTimes(1)
  })

  it(`calls PlaceOrderApiService.placeOrder with the expected input`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await placeOrderApiController.placeOrder(mockApiEvent)
    expect(mockPlaceOrderApiService.placeOrder).toHaveBeenCalledWith(expectedServiceInput)
  })

  it(`responds with 500 Internal Server Error if PlaceOrderApiService.placeOrder returns a Failure of kind not accounted for`, async () => {
    const mockFailureKind = 'mockFailureKind' as FailureKind
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_fails(mockFailureKind)
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if PlaceOrderApiService.placeOrder returns a Failure of kind UnrecognizedError`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_fails('UnrecognizedError')
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if PlaceOrderApiService.placeOrder returns a Failure of kind InvalidArgumentsError`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_fails('InvalidArgumentsError')
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await placeOrderApiController.placeOrder(mockApiEvent)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`responds with status code 202 Accepted`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`responds with the expected HttpResponse.Accepted response`, async () => {
    const mockPlaceOrderApiService = buildMockPlaceOrderApiService_succeeds()
    const placeOrderApiController = new PlaceOrderApiController(mockPlaceOrderApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await placeOrderApiController.placeOrder(mockApiEvent)
    const expectedResponse = HttpResponse.Accepted(mockApiEventBody)
    expect(response).toStrictEqual(expectedResponse)
  })
})
