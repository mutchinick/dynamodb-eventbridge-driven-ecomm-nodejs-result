import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { Result } from '../../errors/Result'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { IRestockSkuApiService, RestockSkuServiceOutput } from '../RestockSkuApiService/RestockSkuApiService'
import { RestockSkuApiController } from './RestockSkuApiController'

const mockSku = 'mockSku'

type MockApiEventBody = {
  sku: string
  units: number
  lotId: string
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockValidRequest: MockApiEventBody = {
    sku: mockSku,
    units: 2,
    lotId: 'mockLotId',
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingRestockSkuRequest: IncomingRestockSkuRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingRestockSkuRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

//
// Mock clients
//
function buildMockRestockSkuApiService_succeeds(): IRestockSkuApiService {
  const mockApiEventBody = buildMockApiEventBody()
  const mockServiceOutput: RestockSkuServiceOutput = mockApiEventBody
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { restockSku: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockRestockSkuApiService_fails(): IRestockSkuApiService {
  const unrecognizedFailure = Result.makeFailure('UnrecognizedError', 'UnrecognizedError', true)
  return { restockSku: jest.fn().mockResolvedValue(unrecognizedFailure) }
}

function buildMockRestockSkuApiService_fails_InvalidArgumentsError(): IRestockSkuApiService {
  const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', 'InvalidArgumentsError', true)
  return { restockSku: jest.fn().mockResolvedValue(invalidArgsFailure) }
}

describe(`Warehouse Service RestockSkuApi RestockSkuApiController tests`, () => {
  //
  // Test APIGatewayProxyEventV2 edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is invalid`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is missing`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = {} as unknown as APIGatewayProxyEventV2
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is empty`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = { body: '' } as unknown as APIGatewayProxyEventV2
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.sku edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is missing`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.sku
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is not a string`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.units edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is missing`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.units
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is not a number`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = '1' as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is not an integer`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = 2.34
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.lotId edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.lotId is missing`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.lotId
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.lotId is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.lotId = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.lotId is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.lotId = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.lotId is not a string`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.lotId = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test internal logic
  //
  it(`calls RestockSkuApiService.restockSku a single time`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).toHaveBeenCalledTimes(1)
  })

  it(`calls RestockSkuApiService.restockSku with the expected input`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).toHaveBeenCalledWith(expectedServiceInput)
  })

  it(`responds with 500 Internal Server Error if RestockSkuApiService.restockSku
      returns a Failure of kind UnrecognizedError`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_fails()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if RestockSkuApiService.restockSku
      returns a Failure of kind InvalidArgumentsError`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_fails_InvalidArgumentsError()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test expected results
  //
  it(`responds with status code 202 Accepted`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    expect(response.statusCode).toStrictEqual(202)
  })

  it(`responds with the expected 202 Accepted response`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.Accepted(mockApiEventBody)
    expect(response).toStrictEqual(expectedResponse)
  })
})
