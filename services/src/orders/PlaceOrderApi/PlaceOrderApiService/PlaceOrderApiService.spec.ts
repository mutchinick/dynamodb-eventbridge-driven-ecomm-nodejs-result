import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { IEsRaiseOrderPlacedEventClient } from '../EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { OrderPlacedEvent, OrderPlacedEventInput } from '../model/OrderPlacedEvent'
import { PlaceOrderApiService, PlaceOrderServiceOutput } from './PlaceOrderApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

function buildMockIncomingPlaceOrderRequest(): TypeUtilsMutable<IncomingPlaceOrderRequest> {
  const mockClass = IncomingPlaceOrderRequest.validateAndBuild({
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingPlaceOrderRequest = buildMockIncomingPlaceOrderRequest()

//
// Mock clients
//
function buildMockEsRaiseOrderPlacedEventClient_succeeds(value?: unknown): IEsRaiseOrderPlacedEventClient {
  const mockResult = Result.makeSuccess(value)
  return { raiseOrderPlacedEvent: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockEsRaiseOrderPlacedEventClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IEsRaiseOrderPlacedEventClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? false,
  )
  return { raiseOrderPlacedEvent: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Orders Service PlaceOrderApi PlaceOrderApiService tests`, () => {
  //
  // Test IncomingPlaceOrderRequestInput edge cases
  //
  it(`returns a Success if the input PlaceOrderApiServiceInput is valid`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      PlaceOrderApiServiceInput is undefined`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const result = await placeOrderApiService.placeOrder(undefined)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      PlaceOrderApiServiceInput is null`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const result = await placeOrderApiService.placeOrder(null)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`returns an Failure if OrderPlacedEvent.validateAndBuild returns a Failure`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const mockFailure = Result.makeFailure('InvalidArgumentsError', '', false)
    jest.spyOn(OrderPlacedEvent, 'validateAndBuild').mockReturnValueOnce(mockFailure)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    expect(Result.isFailure(result)).toBe(true)
  })

  it(`calls EsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent a single time`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    expect(mockEsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls EsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent with the expected input`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    const mockOrderPlacedEventInput: OrderPlacedEventInput = { ...mockIncomingPlaceOrderRequest }
    const expectedOrderPlacedEventResult = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    const expectedOrderPlacedEvent = Result.getSuccessValueOrThrow(expectedOrderPlacedEventResult)
    expect(mockEsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent).toHaveBeenCalledWith(expectedOrderPlacedEvent)
  })

  it(`returns the same Failure if EsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_fails(
      mockFailureKind,
      mockError,
      mockTransient,
    )
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns a Success if EsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent
      returns a Failure of kind DuplicateEventRaisedError`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_fails('DuplicateEventRaisedError')
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    expect(Result.isSuccess(result)).toBe(true)
  })

  //
  // Test expected results
  //
  it(`returns a Success<PlaceOrderApiServiceOutput> with the expected data`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    const expectedOutput: PlaceOrderServiceOutput = {
      orderId: mockIncomingPlaceOrderRequest.orderId,
      sku: mockIncomingPlaceOrderRequest.sku,
      units: mockIncomingPlaceOrderRequest.units,
      price: mockIncomingPlaceOrderRequest.price,
      userId: mockIncomingPlaceOrderRequest.userId,
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(result).toStrictEqual(expectedResult)
  })
})
