import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { IncomingSimulateRawEventRequest } from '../model/IncomingSimulateRawEventRequest'
import { ISimulateRawEventApiService } from '../SimulateRawEventApiService/SimulateRawEventApiService'
import { SimulateRawEventApiController } from './SimulateRawEventApiController'

type MockApiEventBody = {
  pk: string
  sk: string
  eventName: string
  eventData: unknown
  createdAt: string
  updatedAt: string
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockApiEventBody: MockApiEventBody = {
    pk: 'mockPk',
    sk: 'mockSk',
    eventName: 'mockEventName',
    eventData: {},
    createdAt: 'mockCreatedAt',
    updatedAt: 'mockUpdatedAt',
  }
  return mockApiEventBody
}

function buildMockApiEvent(incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingSimulateRawEventRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

function buildMockSimulateRawEventApiService_succeeds(): ISimulateRawEventApiService {
  const mockServiceOutput = buildMockApiEventBody()
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { simulateRawEvent: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockSimulateRawEventApiService_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): ISimulateRawEventApiService {
  const mockFailure = Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'mockError', transient ?? true)
  return { simulateRawEvent: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Testing Service SimulateRawEventApi SimulateRawEventApiController tests`, () => {
  //
  // Test APIGatewayProxyEventV2 edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is invalid`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is missing`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEvent = {} as unknown as APIGatewayProxyEventV2
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is empty`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEvent = { body: '' } as unknown as APIGatewayProxyEventV2
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.pk edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.pk is missing`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.pk
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.pk is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.pk = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.pk is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.pk = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.pk is not a string`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.pk = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.sk edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sk is missing`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.sk
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sk is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sk = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sk is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sk = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sk is not a string`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sk = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.eventName edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.eventName is missing`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.eventName
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.eventName is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventName = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.eventName is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventName = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.eventName is not a string`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventName = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.createdAt edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.createdAt is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.createdAt = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.createdAt is not a string`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.createdAt = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.updatedAt edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.updatedAt is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.updatedAt = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.updatedAt is not a string`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.updatedAt = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test internal logic
  //
  it(`calls SimulateRawEventApiService.simulateRawEvent a single time`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls SimulateRawEventApiService.simulateRawEvent with the expected input`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedServiceInput = { ...mockApiEventBody }
    expect(mockSimulateRawEventApiService.simulateRawEvent).toHaveBeenCalledWith(expectedServiceInput)
  })

  it(`responds with 500 Internal Server Error if SimulateRawEventApiService.simulateRawEvent fails`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_fails()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if SimulateRawEventApiService.simulateRawEvent throws and InvalidArgumentsError`, async () => {
    const mockFailure: FailureKind = 'InvalidArgumentsError'
    const mockError = 'mockError'
    const mockTransient = false
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_fails(
      mockFailure,
      mockError,
      mockTransient,
    )
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test expected results
  //
  it(`responds with status code 202 Accepted`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response.statusCode).toStrictEqual(202)
  })

  it(`responds with the agreed HttpResponse.Accepted response`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_succeeds()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.Accepted(mockApiEventBody)
    expect(response).toStrictEqual(expectedResponse)
  })
})
