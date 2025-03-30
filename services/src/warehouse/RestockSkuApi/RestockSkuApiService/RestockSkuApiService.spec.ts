import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { IEsRaiseSkuRestockedEventClient } from '../EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'
import { RestockSkuApiService, RestockSkuApiServiceOutput } from './RestockSkuApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

function buildMockIncomingRestockSkuRequest(): TypeUtilsMutable<IncomingRestockSkuRequest> {
  const mockClass = IncomingRestockSkuRequest.validateAndBuild({
    sku: 'mockSku',
    units: 2,
    lotId: 'mockLotId',
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingRestockSkuRequest = buildMockIncomingRestockSkuRequest()

//
// Mock clients
//
function buildMockEsRaiseSkuRestockedEventClient_succeeds(value?: unknown): IEsRaiseSkuRestockedEventClient {
  const mockResult = Result.makeSuccess(value)
  return { raiseSkuRestockedEvent: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockEsRaiseSkuRestockedEventClient_fails(
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
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequest is undefined`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const result = await restockSkuApiService.restockSku(undefined)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequest is null`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const result = await restockSkuApiService.restockSku(null)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  // SkuRestockedEvent.validateAndBuild
  it(`returns an Failure if SkuRestockedEvent.validateAndBuild returns a Failure`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const mockFailure = Result.makeFailure('InvalidArgumentsError', '', false)
    jest.spyOn(SkuRestockedEvent, 'validateAndBuild').mockReturnValueOnce(mockFailure)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    expect(Result.isFailure(result)).toBe(true)
  })

  it(`calls EsRaiseSkuRestockedEventClient.restockSku a single time`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    expect(mockEsRaiseSkuRestockedEventClient.raiseSkuRestockedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls EsRaiseSkuRestockedEventClient.restockSku with the expected input`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedSkuRestockedEventResult = SkuRestockedEvent.validateAndBuild(mockIncomingRestockSkuRequest)
    const expectedSkuRestockedEvent = Result.getSuccessValueOrThrow(expectedSkuRestockedEventResult)
    expect(mockEsRaiseSkuRestockedEventClient.raiseSkuRestockedEvent).toHaveBeenCalledWith(expectedSkuRestockedEvent)
  })

  it(`returns the same Failure if EsRaiseSkuRestockedEventClient.restockSku returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_fails(
      mockFailureKind,
      mockError,
      mockTransient,
    )
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  //
  // Test expected results
  //
  it(`returns a Success<RestockSkuApiServiceOutput> with the expected data if 
      EsRaiseSkuRestockedEventClient.restockSku returns a Failure of kind DuplicateEventRaisedError`, async () => {
    const mockEsRaiseSkuRestockedEventClient =
      buildMockEsRaiseSkuRestockedEventClient_fails('DuplicateEventRaisedError')
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedOutput: RestockSkuApiServiceOutput = {
      sku: mockIncomingRestockSkuRequest.sku,
      units: mockIncomingRestockSkuRequest.units,
      lotId: mockIncomingRestockSkuRequest.lotId,
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns a Success<RestockSkuApiServiceOutput> with the expected data`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_succeeds()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedOutput: RestockSkuApiServiceOutput = {
      sku: mockIncomingRestockSkuRequest.sku,
      units: mockIncomingRestockSkuRequest.units,
      lotId: mockIncomingRestockSkuRequest.lotId,
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
