import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { Result } from '../../errors/Result'
import { IncomingListOrdersRequest } from '../model/IncomingListOrdersRequest'
import { IListOrdersApiService, ListOrdersApiServiceOutput } from '../ListOrdersApiService/ListOrdersApiService'
import { ListOrdersApiController } from './ListOrdersApiController'
import { type SortOrder } from '../../model/SortOrder'
import { OrderStatus } from '../../model/OrderStatus'

jest.useFakeTimers().setSystemTime(new Date('2004-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'

type MockApiEventBody = {
  orderId?: string
  sortOrder?: SortOrder
  limit?: number
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockValidRequest: MockApiEventBody = {
    orderId: mockOrderId,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingListOrdersRequest: IncomingListOrdersRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingListOrdersRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

//
// Mock services
//
const mockServiceOutput: ListOrdersApiServiceOutput = {
  orders: [
    {
      orderId: 'mockOrderId-1',
      orderStatus: OrderStatus.ORDER_DELIVERED_STATUS,
      sku: 'mockSku-1',
      units: 12,
      price: 5.55,
      userId: 'mockUserId-1',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    {
      orderId: `mockOrderId-2`,
      orderStatus: OrderStatus.ORDER_STOCK_ALLOCATED_STATUS,
      sku: 'mockSku-2',
      units: 6,
      price: 3.22,
      userId: 'mockUserId-2',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  ],
}

function buildMockListOrdersApiService_succeeds(): IListOrdersApiService {
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { listOrders: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockListOrdersApiService_fails_UnrecognizedError(): IListOrdersApiService {
  const unrecognizedFailure = Result.makeFailure('UnrecognizedError', 'UnrecognizedError', true)
  return { listOrders: jest.fn().mockResolvedValue(unrecognizedFailure) }
}

function buildMockListOrdersApiService_fails_InvalidArgumentsError(): IListOrdersApiService {
  const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', 'InvalidArgumentsError', true)
  return { listOrders: jest.fn().mockResolvedValue(invalidArgsFailure) }
}

describe(`Orders Service ListOrdersApi ListOrdersApiController tests`, () => {
  //
  // Test APIGatewayProxyEventV2 edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is invalid`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is missing`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = {} as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is empty`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = { body: '' } as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2 edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is invalid`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is missing`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = {} as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is empty`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = { body: '' } as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.orderId edge cases
  //
  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.orderId is missing`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.orderId
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.orderId is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.orderId is null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.orderId is not a string`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.sortOrder edge cases
  //
  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.sortOrder is missing`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.sortOrder
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.sortOrder is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortOrder = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sortOrder is null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortOrder = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sortOrder is not a string`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortOrder = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.units edge cases
  //
  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.limit is missing`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.limit
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.limit is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.limit is null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.limit is not a number`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = '1' as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.limit is not an integer`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = 3.45
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test internal logic
  //
  it(`calls ListOrdersApiService.listOrders a single time`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).toHaveBeenCalledTimes(1)
  })

  it(`calls ListOrdersApiService.listOrders with the expected input`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).toHaveBeenCalledWith(expectedServiceInput)
  })

  it(`responds with 500 Internal Server Error if ListOrdersApiService.listOrders
      returns a Failure of kind UnrecognizedError`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_fails_UnrecognizedError()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrdersApiController.listOrders(mockApiEvent)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if ListOrdersApiService.listOrders
      returns a Failure of kind InvalidArgumentsError`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_fails_InvalidArgumentsError()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrdersApiController.listOrders(mockApiEvent)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test expected results
  //
  it(`responds with status code 200 OK`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    expect(response.statusCode).toStrictEqual(200)
  })

  it(`responds with the expected 200 OK response`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_succeeds()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })
})
