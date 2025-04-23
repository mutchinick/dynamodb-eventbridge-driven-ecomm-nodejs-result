import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { type SortDirection } from '../../model/SortDirection'
import { IListSkusApiService, ListSkusApiServiceOutput } from '../ListSkusApiService/ListSkusApiService'
import { IncomingListSkusRequest } from '../model/IncomingListSkusRequest'
import { ListSkusApiController } from './ListSkusApiController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockSku = 'mockSku'
const mockLimit = 10
const mockSortDirection: SortDirection = 'asc'

type MockApiEventBody = {
  sku?: string
  sortDirection?: SortDirection
  limit?: number
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockValidRequest: MockApiEventBody = {
    sku: mockSku,
    limit: mockLimit,
    sortDirection: mockSortDirection,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingListSkusRequest: IncomingListSkusRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingListSkusRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
const mockServiceOutput: ListSkusApiServiceOutput = {
  skus: [
    {
      sku: 'mockSku-1',
      units: 12,
      lotId: 'mockLotId-1',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    {
      sku: `mockSku-2`,
      units: 6,
      lotId: 'mockLotId-2',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  ],
}

function buildMockListSkusApiService_succeeds(): IListSkusApiService {
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { listSkus: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockListSkusApiService_fails(failureKind: FailureKind): IListSkusApiService {
  const mockFailure = Result.makeFailure(failureKind, failureKind, false)
  return { listSkus: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Inventory Service ListSkusApi ListSkusApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(listSkusApiController.listSkus(mockApiEvent)).resolves.not.toThrow()
  })

  it(`fails to call ListSkusApiService if the input APIGatewayProxyEventV2 is
      undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListSkusApiService if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body edge cases
   ************************************************************/
  it(`fails to call ListSkusApiService.listSkus if the input
      APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is
      undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListSkusApiService.listSkus if the input
      APIGatewayProxyEventV2.body is null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListSkusApiService.listSkus if the input
      APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is not a
      valid JSON`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.sku edge cases
   ************************************************************/
  it(`calls ListSkusApiService.listSkus if the input APIGatewayProxyEventV2.body.sku
      is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).toHaveBeenCalled()
  })

  it(`responds with 200 OK if the input APIGatewayProxyEventV2.body.sku is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`fails to call ListSkusApiService.listSkus if the input
      APIGatewayProxyEventV2.body.sku is null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.sku is
      null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.limit edge cases
   ************************************************************/
  it(`calls ListSkusApiService.listSkus if the input APIGatewayProxyEventV2.body.limit
      is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).toHaveBeenCalled()
  })

  it(`responds with 200 OK if the input APIGatewayProxyEventV2.body.limit is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`fails to call ListSkusApiService.listSkus if the input
      APIGatewayProxyEventV2.body.limit is null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.limit is
      null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.sortDirection edge cases
   ************************************************************/
  it(`calls ListSkusApiService.listSkus if the input
      APIGatewayProxyEventV2.body.sortDirection is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).toHaveBeenCalled()
  })

  it(`responds with 200 OK if the input APIGatewayProxyEventV2.body.sortDirection is
      undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`fails to call ListSkusApiService.listSkus if the input
      APIGatewayProxyEventV2.body.sortDirection is null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input
      APIGatewayProxyEventV2.body.sortDirection is null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls ListSkusApiService.listSkus a single time`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).toHaveBeenCalledTimes(1)
  })

  it(`calls ListSkusApiService.listSkus with the expected input`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await listSkusApiController.listSkus(mockApiEvent)
    expect(mockListSkusApiService.listSkus).toHaveBeenCalledWith(expectedServiceInput)
  })

  it(`responds with 500 Internal Server Error if ListSkusApiService.listSkus returns a
      Failure of kind not accounted for`, async () => {
    const mockFailureKind = 'mockFailureKind' as FailureKind
    const mockListSkusApiService = buildMockListSkusApiService_fails(mockFailureKind)
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if ListSkusApiService.listSkus returns a
      Failure of kind UnrecognizedError`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_fails('UnrecognizedError')
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if ListSkusApiService.listSkus returns a Failure
      of kind InvalidArgumentsError`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_fails('InvalidArgumentsError')
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    const response = await listSkusApiController.listSkus(mockApiEvent)
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
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`responds with the expected HttpResponse.OK response`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })
})
