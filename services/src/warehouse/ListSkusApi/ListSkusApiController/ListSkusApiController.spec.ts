import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { Result } from '../../errors/Result'
import { type SortDirection } from '../../model/SortDirection'
import { IListSkusApiService, ListSkusApiServiceOutput } from '../ListSkusApiService/ListSkusApiService'
import { IncomingListSkusRequest } from '../model/IncomingListSkusRequest'
import { ListSkusApiController } from './ListSkusApiController'

jest.useFakeTimers().setSystemTime(new Date('2004-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockSku = 'mockSku'

type MockApiEventBody = {
  sku?: string
  sortDirection?: SortDirection
  limit?: number
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockValidRequest: MockApiEventBody = {
    sku: mockSku,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingListSkusRequest: IncomingListSkusRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingListSkusRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

//
// Mock services
//
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

function buildMockListSkusApiService_fails_UnrecognizedError(): IListSkusApiService {
  const unrecognizedFailure = Result.makeFailure('UnrecognizedError', 'UnrecognizedError', true)
  return { listSkus: jest.fn().mockResolvedValue(unrecognizedFailure) }
}

function buildMockListSkusApiService_fails_InvalidArgumentsError(): IListSkusApiService {
  const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', 'InvalidArgumentsError', true)
  return { listSkus: jest.fn().mockResolvedValue(invalidArgsFailure) }
}

describe(`Warehouse Service ListSkusApi ListSkusApiController tests`, () => {
  //
  // Test APIGatewayProxyEventV2 edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is invalid`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is missing`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = {} as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is empty`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = { body: '' } as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2 edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is invalid`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is missing`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = {} as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is empty`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = { body: '' } as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.sku edge cases
  //
  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.sku is missing`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.sku
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.sku is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is not a string`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.sortDirection edge cases
  //
  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.sortDirection is missing`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.sortDirection
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.sortDirection is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sortDirection is null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sortDirection is not a string`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.units edge cases
  //
  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.limit is missing`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.limit
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 200 OK if the APIGatewayProxyEventV2.body.limit is undefined`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.limit is null`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.limit is not a number`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = '1' as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.limit is not an integer`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = 3.45
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test internal logic
  //
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

  it(`responds with 500 Internal Server Error if ListSkusApiService.listSkus
      returns a Failure of kind UnrecognizedError`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_fails_UnrecognizedError()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if ListSkusApiService.listSkus
      returns a Failure of kind InvalidArgumentsError`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_fails_InvalidArgumentsError()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listSkusApiController.listSkus(mockApiEvent)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test expected results
  //
  it(`responds with status code 200 OK`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    expect(response.statusCode).toStrictEqual(200)
  })

  it(`responds with the expected 200 OK response`, async () => {
    const mockListSkusApiService = buildMockListSkusApiService_succeeds()
    const listSkusApiController = new ListSkusApiController(mockListSkusApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listSkusApiController.listSkus(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })
})
