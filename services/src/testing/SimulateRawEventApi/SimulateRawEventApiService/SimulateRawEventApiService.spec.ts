import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { IEsRaiseRawSimulatedEventClient } from '../EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { IncomingSimulateRawEventRequest } from '../model/IncomingSimulateRawEventRequest'
import { RawSimulatedEvent, RawSimulatedEventInput } from '../model/RawSimulatedEvent'
import { SimulateRawEventApiService, SimulateRawEventApiServiceOutput } from './SimulateRawEventApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingSimulateRawEventRequest(): TypeUtilsMutable<IncomingSimulateRawEventRequest> {
  const mockClass = IncomingSimulateRawEventRequest.validateAndBuild({
    pk: 'mockPk',
    sk: 'mockSk',
    eventName: 'mockEventName',
    eventData: {
      orderId: 'mockOrderId',
      sku: 'mockSku',
      units: 2,
      price: 3.98,
      userId: 'mockUserId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingSimulateRawEventRequest = buildMockIncomingSimulateRawEventRequest()

//
// Mock clients
//
function buildMockEsRaiseRawSimulatedEventClient_succeeds(value?: unknown): IEsRaiseRawSimulatedEventClient {
  const mockResult = Result.makeSuccess(value)
  return { raiseRawSimulatedEvent: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockEsRaiseRawSimulatedEventClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IEsRaiseRawSimulatedEventClient {
  const mockFailure = Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'mockError', transient ?? false)
  return { raiseRawSimulatedEvent: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Testing Service SimulateRawEventApi SimulateRawEventApiService tests`, () => {
  //
  // Test IncomingSimulateRawEventRequestInput edge cases
  //
  it(`returns a Success if the input SimulateRawEventApiServiceInput is valid`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_succeeds()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const result = await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SimulateRawEventApiServiceInput is undefined`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_succeeds()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const result = await simulateRawEventApiService.simulateRawEvent(undefined)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SimulateRawEventApiServiceInput is null`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_succeeds()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const result = await simulateRawEventApiService.simulateRawEvent(null)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`returns an Failure if RawSimulatedEvent.validateAndBuild returns a Failure`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_succeeds()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const mockFailure = Result.makeFailure('InvalidArgumentsError', '', false)
    jest.spyOn(RawSimulatedEvent, 'validateAndBuild').mockReturnValueOnce(mockFailure)
    const result = await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    expect(Result.isFailure(result)).toBe(true)
  })

  it(`calls EsRaiseRawSimulatedEventClient.simulateRawEvent a single time`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_succeeds()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    expect(mockEsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls EsRaiseRawSimulatedEventClient.simulateRawEvent with the expected input`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_succeeds()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    const mockRawSimulatedEventInput: RawSimulatedEventInput = { ...mockIncomingSimulateRawEventRequest }
    const expectedRawSimulatedEventResult = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    const expectedRawSimulatedEvent = Result.getSuccessValueOrThrow(expectedRawSimulatedEventResult)
    expect(mockEsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent).toHaveBeenCalledWith(expectedRawSimulatedEvent)
  })

  it(`returns the same Failure if EsRaiseRawSimulatedEventClient.simulateRawEvent returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_fails(
      mockFailureKind,
      mockError,
      mockTransient,
    )
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const result = await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  //
  // Test expected results
  //
  it(`returns a Success<SimulateRawEventApiServiceOutput> if EsRaiseRawSimulatedEventClient.simulateRawEvent
      returns a Failure of kind DuplicateEventRaisedError`, async () => {
    const failureKind: FailureKind = 'DuplicateEventRaisedError'
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_fails(failureKind)
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const result = await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    const expectedValue: SimulateRawEventApiServiceOutput = {
      pk: mockIncomingSimulateRawEventRequest.pk,
      sk: mockIncomingSimulateRawEventRequest.sk,
      eventName: mockIncomingSimulateRawEventRequest.eventName,
      eventData: mockIncomingSimulateRawEventRequest.eventData,
      createdAt: mockIncomingSimulateRawEventRequest.createdAt,
      updatedAt: mockIncomingSimulateRawEventRequest.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedValue)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns a Success<SimulateRawEventApiServiceOutput> with the expected data`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_succeeds()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const result = await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    const expectedValue: SimulateRawEventApiServiceOutput = {
      pk: mockIncomingSimulateRawEventRequest.pk,
      sk: mockIncomingSimulateRawEventRequest.sk,
      eventName: mockIncomingSimulateRawEventRequest.eventName,
      eventData: mockIncomingSimulateRawEventRequest.eventData,
      createdAt: mockIncomingSimulateRawEventRequest.createdAt,
      updatedAt: mockIncomingSimulateRawEventRequest.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedValue)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
