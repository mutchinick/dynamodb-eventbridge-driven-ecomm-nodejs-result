import { TestingError } from '../../errors/TestingError'
import { IEsRaiseRawSimulatedEventClient } from '../EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { IncomingSimulateRawEventRequest as IncomingSimulateRawEventRequestInput } from '../model/IncomingSimulateRawEventRequest'
import { RawSimulatedEvent } from '../model/RawSimulatedEvent'
import { SimulateRawEventService } from './SimulateRawEventService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockValidIncomingSimulateRawEventRequestInput: IncomingSimulateRawEventRequestInput = {
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
}

const expectedRawSimulatedEvent = RawSimulatedEvent.validateAndBuild(mockValidIncomingSimulateRawEventRequestInput)

const expectedValidOutput = mockValidIncomingSimulateRawEventRequestInput

function buildMockDdbSimulateRawEventEventClient_raiseEvent_resolves(): IEsRaiseRawSimulatedEventClient {
  return { raiseRawSimulatedEvent: jest.fn() }
}

function buildMockDdbSimulateRawEventEventClient_raiseEvent_throws(): IEsRaiseRawSimulatedEventClient {
  return { raiseRawSimulatedEvent: jest.fn().mockRejectedValue(new Error()) }
}

function buildMockDdbSimulateRawEventEventClient_raiseEvent_throws_InvalidEventRaiseOperationError_Redundant(): IEsRaiseRawSimulatedEventClient {
  const error = new Error()
  TestingError.addName(error, TestingError.InvalidEventRaiseOperationError_Redundant)
  return { raiseRawSimulatedEvent: jest.fn().mockRejectedValue(error) }
}

describe('Testing Service SimulateRawEventApi SimulateRawEventService tests', () => {
  //
  // Test IncomingSimulateRawEventRequestInput edge cases
  //
  it('does not throw if the input SimulateRawEventServiceInput is valid', async () => {
    const mockDdbSimulateRawEventEventClient = buildMockDdbSimulateRawEventEventClient_raiseEvent_resolves()
    const simulateRawEventService = new SimulateRawEventService(mockDdbSimulateRawEventEventClient)
    await expect(
      simulateRawEventService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput),
    ).resolves.not.toThrow()
  })

  it('throws if the input SimulateRawEventServiceInput is undefined', async () => {
    const mockDdbSimulateRawEventEventClient = buildMockDdbSimulateRawEventEventClient_raiseEvent_resolves()
    const simulateRawEventService = new SimulateRawEventService(mockDdbSimulateRawEventEventClient)
    await expect(simulateRawEventService.simulateRawEvent(undefined)).rejects.toThrow()
  })

  it('throws if the input SimulateRawEventServiceInput is null', async () => {
    const mockDdbSimulateRawEventEventClient = buildMockDdbSimulateRawEventEventClient_raiseEvent_resolves()
    const simulateRawEventService = new SimulateRawEventService(mockDdbSimulateRawEventEventClient)
    await expect(simulateRawEventService.simulateRawEvent(null)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DdbSimulateRawEventEventClient.simulateRawEvent a single time', async () => {
    const mockDdbSimulateRawEventEventClient = buildMockDdbSimulateRawEventEventClient_raiseEvent_resolves()
    const simulateRawEventService = new SimulateRawEventService(mockDdbSimulateRawEventEventClient)
    await simulateRawEventService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput)
    expect(mockDdbSimulateRawEventEventClient.raiseRawSimulatedEvent).toHaveBeenCalledTimes(1)
  })

  it('calls DdbSimulateRawEventEventClient.simulateRawEvent with the expected input', async () => {
    const mockDdbSimulateRawEventEventClient = buildMockDdbSimulateRawEventEventClient_raiseEvent_resolves()
    const simulateRawEventService = new SimulateRawEventService(mockDdbSimulateRawEventEventClient)
    await simulateRawEventService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput)
    expect(mockDdbSimulateRawEventEventClient.raiseRawSimulatedEvent).toHaveBeenCalledWith(expectedRawSimulatedEvent)
  })

  it('throws if DdbSimulateRawEventEventClient.simulateRawEvent throws', async () => {
    const mockDdbSimulateRawEventEventClient = buildMockDdbSimulateRawEventEventClient_raiseEvent_throws()
    const simulateRawEventService = new SimulateRawEventService(mockDdbSimulateRawEventEventClient)
    await expect(
      simulateRawEventService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput),
    ).rejects.toThrow()
  })

  it('returns a SimulateRawEventServiceOutput with the expected orderId if DdbSimulateRawEventEventClient.simulateRawEvent throws InvalidEventRaiseOperationError_Redundant', async () => {
    const mockDdbSimulateRawEventEventClient =
      buildMockDdbSimulateRawEventEventClient_raiseEvent_throws_InvalidEventRaiseOperationError_Redundant()
    const simulateRawEventService = new SimulateRawEventService(mockDdbSimulateRawEventEventClient)
    const actualOutput = await simulateRawEventService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput)
    expect(actualOutput).toStrictEqual(expectedValidOutput)
  })

  //
  // Test expected results
  //
  it('returns a SimulateRawEventServiceOutput with the expected orderId', async () => {
    const mockDdbSimulateRawEventEventClient = buildMockDdbSimulateRawEventEventClient_raiseEvent_resolves()
    const simulateRawEventService = new SimulateRawEventService(mockDdbSimulateRawEventEventClient)
    const actualOutput = await simulateRawEventService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput)
    expect(actualOutput).toStrictEqual(expectedValidOutput)
  })
})
