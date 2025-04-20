import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { IRestockSkuApiService, RestockSkuApiServiceOutput } from '../RestockSkuApiService/RestockSkuApiService'
import { RestockSkuApiController } from './RestockSkuApiController'

const mockSku = 'mockSku'
const mockUnits = 12
const mockLotId = 'mockLotId'

type MockApiEventBody = {
  sku: string
  units: number
  lotId: string
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockValidRequest: MockApiEventBody = {
    sku: mockSku,
    units: mockUnits,
    lotId: mockLotId,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingRestockSkuRequest: IncomingRestockSkuRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingRestockSkuRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockRestockSkuApiService_succeeds(): IRestockSkuApiService {
  const mockApiEventBody = buildMockApiEventBody()
  const mockServiceOutput: RestockSkuApiServiceOutput = mockApiEventBody
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { restockSku: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockRestockSkuApiService_fails(failureKind: FailureKind): IRestockSkuApiService {
  const mockFailure = Result.makeFailure(failureKind, failureKind, false)
  return { restockSku: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Warehouse Service RestockSkuApi RestockSkuApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockListOrdersApiService = buildMockRestockSkuApiService_succeeds()
    const listOrdersApiController = new RestockSkuApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(listOrdersApiController.restockSku(mockApiEvent)).resolves.not.toThrow()
  })

  it(`fails to call RestockSkuApiService if the input APIGatewayProxyEventV2 is
      undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call RestockSkuApiService if the input APIGatewayProxyEventV2 is
      invalid`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await restockSkuApiController.restockSku(mockApiEvent)
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
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is
      undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListSkusApiService.listSkus if the input
      APIGatewayProxyEventV2.body is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListSkusApiService.listSkus if the input
      APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is not a
      valid JSON`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.sku edge cases
   ************************************************************/
  it(`fails to call RestockSkuApiService.restockSku if the input
      APIGatewayProxyEventV2.body.sku is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.sku is
      undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call RestockSkuApiService.restockSku if the input
      APIGatewayProxyEventV2.body.sku is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.sku is
      null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.units edge cases
   ************************************************************/
  it(`fails to call RestockSkuApiService.restockSku if the input
      APIGatewayProxyEventV2.body.units is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.units is
      undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call RestockSkuApiService.restockSku if the input
      APIGatewayProxyEventV2.body.units is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.units is
      null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.lotId edge cases
   ************************************************************/
  it(`fails to call RestockSkuApiService.restockSku if the input
      APIGatewayProxyEventV2.body.lotId is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.lotId = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.lotId is
      undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.lotId = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call RestockSkuApiService.restockSku if the input
      APIGatewayProxyEventV2.body.lotId is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.lotId = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.lotId is
      null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.lotId = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
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
      returns a Failure of kind not accounted for`, async () => {
    const mockFailureKind = 'mockFailureKind' as FailureKind
    const mockRestockSkuApiService = buildMockRestockSkuApiService_fails(mockFailureKind)
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if RestockSkuApiService.restockSku
      returns a Failure of kind UnrecognizedError`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_fails('UnrecognizedError')
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if RestockSkuApiService.restockSku returns a
      Failure of kind InvalidArgumentsError`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_fails('InvalidArgumentsError')
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
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
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`responds with the expected HttpResponse.Accepted response`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_succeeds()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.Accepted(mockApiEventBody)
    expect(response).toStrictEqual(expectedResponse)
  })
})
