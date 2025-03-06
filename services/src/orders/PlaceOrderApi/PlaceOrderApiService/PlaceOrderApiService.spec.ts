import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { IEsRaiseOrderPlacedEventClient } from '../EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { OrderPlacedEvent, OrderPlacedEventInput } from '../model/OrderPlacedEvent'
import { PlaceOrderApiService, PlaceOrderServiceOutput } from './PlaceOrderApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockIncomingPlaceOrderRequestResult = IncomingPlaceOrderRequest.validateAndBuild({
  orderId: 'mockOrderId',
  sku: 'mockSku',
  units: 2,
  price: 3.98,
  userId: 'mockUserId',
})

const mockIncomingPlaceOrderRequest = Result.getSuccessValueOrThrow(mockIncomingPlaceOrderRequestResult)

function buildMockDdbPlaceOrderEventClient_raiseEvent_succeeds(value?: unknown): IEsRaiseOrderPlacedEventClient {
  const mockResult = Result.makeSuccess(value)
  return { raiseOrderPlacedEvent: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockDdbPlaceOrderEventClient_raiseEvent_fails(
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
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Failure of kind InvalidArgumentsError if the input PlaceOrderApiServiceInput is undefined`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const result = await placeOrderApiService.placeOrder(undefined)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
  })

  it(`returns a Failure of kind InvalidArgumentsError if the input PlaceOrderApiServiceInput is null`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const result = await placeOrderApiService.placeOrder(null)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
  })

  //
  // Test internal logic
  //
  it(`calls DdbPlaceOrderEventClient.placeOrder a single time`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    expect(mockDdbPlaceOrderEventClient.raiseOrderPlacedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls DdbPlaceOrderEventClient.placeOrder with the expected input`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    const mockOrderPlacedEventInput: OrderPlacedEventInput = { ...mockIncomingPlaceOrderRequest }
    const expectedOrderPlacedEventResult = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    const expectedOrderPlacedEvent = Result.getSuccessValueOrThrow(expectedOrderPlacedEventResult)
    expect(mockDdbPlaceOrderEventClient.raiseOrderPlacedEvent).toHaveBeenCalledWith(expectedOrderPlacedEvent)
  })

  it(`returns a Failure if DdbPlaceOrderEventClient.placeOrder returns a Failure`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_fails()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    expect(Result.isFailure(result)).toBe(true)
  })

  it(`returns the same Failure if DdbPlaceOrderEventClient.placeOrder returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_fails(
      mockFailureKind,
      mockError,
      mockTransient,
    )
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns a Success if DdbPlaceOrderEventClient.placeOrder
      returns a Failure of kind DuplicateEventRaisedError`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_fails('DuplicateEventRaisedError')
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    expect(Result.isSuccess(result)).toBe(true)
  })

  //
  // Test expected results
  //
  it(`returns a Success<PlaceOrderApiServiceOutput> with the expected data`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_succeeds()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    const expectedValue: PlaceOrderServiceOutput = {
      orderId: mockIncomingPlaceOrderRequest.orderId,
      sku: mockIncomingPlaceOrderRequest.sku,
      units: mockIncomingPlaceOrderRequest.units,
      price: mockIncomingPlaceOrderRequest.price,
      userId: mockIncomingPlaceOrderRequest.userId,
    }
    const expectedResult = Result.makeSuccess(expectedValue)
    expect(result).toStrictEqual(expectedResult)
  })
})
