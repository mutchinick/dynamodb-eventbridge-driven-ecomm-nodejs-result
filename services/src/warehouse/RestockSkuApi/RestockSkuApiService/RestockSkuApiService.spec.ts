import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { IEsRaiseSkuRestockedEventClient } from '../EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'
import { RestockSkuApiService, RestockSkuServiceOutput } from './RestockSkuApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockIncomingRestockSkuRequestResult = IncomingRestockSkuRequest.validateAndBuild({
  sku: 'mockSku',
  units: 2,
  lotId: 'mockLotId',
})

const mockIncomingRestockSkuRequest = Result.getSuccessValueOrThrow(mockIncomingRestockSkuRequestResult)

//
// Mock clients
//
function buildMockDdbRestockSkuEventClient_raiseEvent_succeeds(value?: unknown): IEsRaiseSkuRestockedEventClient {
  const mockResult = Result.makeSuccess(value)
  return { raiseSkuRestockedEvent: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockDdbRestockSkuEventClient_raiseEvent_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IEsRaiseSkuRestockedEventClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? true,
  )
  return { raiseSkuRestockedEvent: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Warehouse Service RestockSkuApi RestockSkuApiService tests`, () => {
  //
  // Test IncomingRestockSkuRequest edge cases
  //
  it(`returns a Success if the input IncomingRestockSkuRequest is valid`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Failure of kind InvalidArgumentsError if the input IncomingRestockSkuRequest is undefined`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    const result = await restockSkuApiService.restockSku(undefined)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
  })

  it(`returns a Failure if the input IncomingRestockSkuRequest is null`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    const result = await restockSkuApiService.restockSku(null)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
  })

  //
  // Test internal logic
  //
  it(`calls DdbRestockSkuEventClient.restockSku a single time`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    expect(mockDdbRestockSkuEventClient.raiseSkuRestockedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls DdbRestockSkuEventClient.restockSku with the expected input`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedSkuRestockedEventResult = SkuRestockedEvent.validateAndBuild(mockIncomingRestockSkuRequest)
    const expectedSkuRestockedEvent = Result.getSuccessValueOrThrow(expectedSkuRestockedEventResult)
    expect(mockDdbRestockSkuEventClient.raiseSkuRestockedEvent).toHaveBeenCalledWith(expectedSkuRestockedEvent)
  })

  it(`returns a Failure if DdbRestockSkuEventClient.restockSku returns a Failure`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_fails()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    expect(Result.isFailure(result)).toBe(true)
  })

  it(`returns the same Failure if DdbRestockSkuEventClient.restockSku returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_fails(
      mockFailureKind,
      mockError,
      mockTransient,
    )
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns a Success if DdbRestockSkuEventClient.restockSku
      returns a Failure of kind DuplicateEventRaisedError`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_fails('DuplicateEventRaisedError')
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedValue: RestockSkuServiceOutput = {
      sku: mockIncomingRestockSkuRequest.sku,
      units: mockIncomingRestockSkuRequest.units,
      lotId: mockIncomingRestockSkuRequest.lotId,
    }
    const expectedResult = Result.makeSuccess(expectedValue)
    expect(result).toStrictEqual(expectedResult)
  })

  //
  // Test expected results
  //
  it(`returns a Success<RestockSkuServiceOutput> with the expected data`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedValue: RestockSkuServiceOutput = {
      sku: mockIncomingRestockSkuRequest.sku,
      units: mockIncomingRestockSkuRequest.units,
      lotId: mockIncomingRestockSkuRequest.lotId,
    }
    const expectedResult = Result.makeSuccess(expectedValue)
    expect(result).toStrictEqual(expectedResult)
  })
})
