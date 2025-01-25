import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { TestingError } from '../../errors/TestingError'
import { IncomingSimulateRawEventRequest } from '../model/IncomingSimulateRawEventRequest'
import { ISimulateRawEventService } from '../SimulateRawEventService/SimulateRawEventService'
import { SimulateRawEventController } from './SimulateRawEventController'

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

function buildMockSimulateRawEventService_simulateRawEvent_resolves(): ISimulateRawEventService {
  const mockServiceOutput = buildMockApiEventBody()
  return { simulateRawEvent: jest.fn().mockResolvedValue(mockServiceOutput) }
}

function buildMockSimulateRawEventService_simulateRawEvent_throws(): ISimulateRawEventService {
  return { simulateRawEvent: jest.fn().mockRejectedValue(new Error()) }
}

function buildMockSimulateRawEventService_simulateRawEvent_throws_InvalidArgumentsError(): ISimulateRawEventService {
  const error = new Error()
  TestingError.addName(error, TestingError.InvalidArgumentsError)
  return { simulateRawEvent: jest.fn().mockRejectedValue(error) }
}

describe('Testing Service SimulateRawEventApi SimulateRawEventController tests', () => {
  //
  // Test APIGatewayProxyEventV2 edge cases
  //
  it('responds with 500 Internal Server Error if the APIGatewayProxyEventV2 is undefined', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.InternalServerError()
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2 is invalid', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body is missing', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEvent = {} as unknown as APIGatewayProxyEventV2
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body is empty', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEvent = { body: '' } as unknown as APIGatewayProxyEventV2
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body is not a valid JSON', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.pk edge cases
  //
  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.pk is missing', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.pk
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.pk is undefined', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.pk = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.pk is null', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.pk = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.pk is not a string', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.pk = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.sk edge cases
  //
  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sk is missing', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.sk
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sk is undefined', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sk = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sk is null', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sk = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sk is not a string', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sk = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.eventName edge cases
  //
  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.eventName is missing', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.eventName
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.eventName is undefined', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventName = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.eventName is null', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventName = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.eventName is not a string', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventName = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.createdAt edge cases
  //
  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.createdAt is null', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.createdAt = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.createdAt is not a string', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.createdAt = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.updatedAt edge cases
  //
  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.updatedAt is null', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.updatedAt = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if the APIGatewayProxyEventV2.body.updatedAt is not a string', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.updatedAt = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test internal logic
  //
  it('calls SimulateRawEventService.simulateRawEvent a single time', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventService.simulateRawEvent).toHaveBeenCalledTimes(1)
  })

  it('calls SimulateRawEventService.simulateRawEvent with the expected input', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventService.simulateRawEvent).toHaveBeenCalledWith(expectedServiceInput)
  })

  it('responds with 500 Internal Server Error if SimulateRawEventService.simulateRawEvent throws', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_throws()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventController.simulateRawEvent(mockApiEvent)
    const expectedErrorResponse = HttpResponse.InternalServerError()
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  it('responds with 400 Bad Request if SimulateRawEventService.simulateRawEvent throws and InvalidArgumentsError', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_throws_InvalidArgumentsError()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventController.simulateRawEvent(mockApiEvent)
    const expectedErrorResponse = HttpResponse.BadRequestError()
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedErrorResponse)
  })

  //
  // Test expected results
  //
  it('responds with status code 202 Accepted', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    expect(actualResponse.statusCode).toStrictEqual(202)
  })

  it('responds with the agreed HttpResponse.Accepted response', async () => {
    const mockSimulateRawEventService = buildMockSimulateRawEventService_simulateRawEvent_resolves()
    const simulateRawEventController = new SimulateRawEventController(mockSimulateRawEventService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await simulateRawEventController.simulateRawEvent(mockApiEvent)
    const expectedAcceptedResponse = HttpResponse.Accepted(mockApiEventBody)
    expect(actualResponse).toStrictEqual(expectedAcceptedResponse)
  })
})
