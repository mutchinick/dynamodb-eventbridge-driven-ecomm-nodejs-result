import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { type SortDirection } from '../../model/SortDirection'
import {
  IListOrderPaymentsApiService,
  ListOrderPaymentsApiServiceOutput,
} from '../ListOrderPaymentsApiService/ListOrderPaymentsApiService'
import { IncomingListOrderPaymentsRequest } from '../model/IncomingListOrderPaymentsRequest'
import { ListOrderPaymentsApiController } from './ListOrderPaymentsApiController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockLimit = 10
const mockSortDirection: SortDirection = 'asc'

type MockApiEventBody = {
  orderId?: string
  sortDirection?: SortDirection
  limit?: number
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockValidRequest: MockApiEventBody = {
    orderId: mockOrderId,
    limit: mockLimit,
    sortDirection: mockSortDirection,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingListOrderPaymentsRequest: IncomingListOrderPaymentsRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingListOrderPaymentsRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
const mockServiceOutput: ListOrderPaymentsApiServiceOutput = {
  orderPayments: [
    {
      orderId: 'mockOrderId-1',
      sku: 'mockSku-1',
      units: 12,
      price: 100,
      userId: 'mockUserId-1',
      createdAt: mockDate,
      updatedAt: mockDate,
      paymentId: 'mockPaymentId-1',
      paymentStatus: 'mockPaymentStatus-1' as never,
      paymentRetries: 1,
    },
    {
      orderId: 'mockOrderId-2',
      sku: 'mockSku-2',
      units: 5,
      price: 50,
      userId: 'mockUserId-2',
      createdAt: mockDate,
      updatedAt: mockDate,
      paymentId: 'mockPaymentId-2',
      paymentStatus: 'mockPaymentStatus-2' as never,
      paymentRetries: 2,
    },
  ],
}

function buildMockListOrderPaymentsApiService_succeeds(): IListOrderPaymentsApiService {
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { listOrderPayments: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockListOrderPaymentsApiService_fails(failureKind: FailureKind): IListOrderPaymentsApiService {
  const mockFailure = Result.makeFailure(failureKind, failureKind, false)
  return { listOrderPayments: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Payments Service ListOrderPaymentsApi ListOrderPaymentsApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(listOrderPaymentsApiController.listOrderPayments(mockApiEvent)).resolves.not.toThrow()
  })

  it(`fails to call ListOrderPaymentsApiService if the input APIGatewayProxyEventV2 is
      undefined`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListOrderPaymentsApiService if the input APIGatewayProxyEventV2 is
      invalid`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body edge cases
   ************************************************************/
  it(`fails to call ListOrderPaymentsApiService.listOrderPayments if the input
      APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is
      undefined`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListOrderPaymentsApiService.listOrderPayments if the input
      APIGatewayProxyEventV2.body is null`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListOrderPaymentsApiService.listOrderPayments if the input
      APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is not a
      valid JSON`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.orderId edge cases
   ************************************************************/
  it(`calls ListOrderPaymentsApiService.listOrderPayments if the input
      APIGatewayProxyEventV2.body.orderId is undefined`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).toHaveBeenCalled()
  })

  it(`responds with 200 OK if the input APIGatewayProxyEventV2.body.orderId is
      undefined`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`fails to call ListOrderPaymentsApiService.listOrderPayments if the input
      APIGatewayProxyEventV2.body.orderId is null`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.orderId
      is null`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.limit edge cases
   ************************************************************/
  it(`calls ListOrderPaymentsApiService.listOrderPayments if the input
      APIGatewayProxyEventV2.body.limit is undefined`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).toHaveBeenCalled()
  })

  it(`responds with 200 OK if the input APIGatewayProxyEventV2.body.limit is undefined`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`fails to call ListOrderPaymentsApiService.listOrderPayments if the input
      APIGatewayProxyEventV2.body.limit is null`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.limit is
      null`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.sortDirection edge cases
   ************************************************************/
  it(`calls ListOrderPaymentsApiService.listOrderPayments if the input
      APIGatewayProxyEventV2.body.sortDirection is undefined`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).toHaveBeenCalled()
  })

  it(`responds with 200 OK if the input APIGatewayProxyEventV2.body.sortDirection is
      undefined`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`fails to call ListOrderPaymentsApiService.listOrderPayments if the input
      APIGatewayProxyEventV2.body.sortDirection is null`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input
      APIGatewayProxyEventV2.body.sortDirection is null`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls ListOrderPaymentsApiService.listOrderPayments a single time`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).toHaveBeenCalledTimes(1)
  })

  it(`calls ListOrderPaymentsApiService.listOrderPayments with the expected input`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(mockListOrderPaymentsApiService.listOrderPayments).toHaveBeenCalledWith(expectedServiceInput)
  })

  it(`responds with 500 Internal Server Error if
      ListOrderPaymentsApiService.listOrderPayments returns a Failure of kind not
      accounted for`, async () => {
    const mockFailureKind = 'mockFailureKind' as FailureKind
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_fails(mockFailureKind)
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if
      ListOrderPaymentsApiService.listOrderPayments returns a Failure of kind
      UnrecognizedError`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_fails('UnrecognizedError')
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if ListOrderPaymentsApiService.listOrderPayments
      returns a Failure of kind InvalidArgumentsError`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_fails('InvalidArgumentsError')
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`responds with status code 200 OK`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`responds with the expected HttpResponse.OK response`, async () => {
    const mockListOrderPaymentsApiService = buildMockListOrderPaymentsApiService_succeeds()
    const listOrderPaymentsApiController = new ListOrderPaymentsApiController(mockListOrderPaymentsApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrderPaymentsApiController.listOrderPayments(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })
})
