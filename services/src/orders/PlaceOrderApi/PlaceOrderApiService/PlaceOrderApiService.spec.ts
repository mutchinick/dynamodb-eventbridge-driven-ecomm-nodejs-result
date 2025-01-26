import { OrderError } from '../../errors/OrderError'
import { IEsRaiseOrderPlacedEventClient } from '../EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'
import { IncomingPlaceOrderRequest as IncomingPlaceOrderRequestInput } from '../model/IncomingPlaceOrderRequest'
import { PlaceOrderApiService, ServiceOutput } from './PlaceOrderApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockValidIncomingPlaceOrderRequestInput: IncomingPlaceOrderRequestInput = {
  orderId: 'mockOrderId',
  sku: 'mockSku',
  quantity: 2,
  price: 3.98,
  userId: 'mockUserId',
}

const expectedOrderPlacedEvent = OrderPlacedEvent.validateAndBuild(mockValidIncomingPlaceOrderRequestInput)

const expectedValidOutput: ServiceOutput = {
  ...mockValidIncomingPlaceOrderRequestInput,
}

function buildMockDdbPlaceOrderEventClient_raiseEvent_resolves(): IEsRaiseOrderPlacedEventClient {
  return { raiseOrderPlacedEvent: jest.fn() }
}

function buildMockDdbPlaceOrderEventClient_raiseEvent_throws(): IEsRaiseOrderPlacedEventClient {
  return { raiseOrderPlacedEvent: jest.fn().mockRejectedValue(new Error()) }
}

function buildMockDdbPlaceOrderEventClient_raiseEvent_throws_InvalidEventRaiseOperationError_Redundant(): IEsRaiseOrderPlacedEventClient {
  const error = new Error()
  OrderError.addName(error, OrderError.InvalidEventRaiseOperationError_Redundant)
  return { raiseOrderPlacedEvent: jest.fn().mockRejectedValue(error) }
}

describe('Orders Service PlaceOrderApi PlaceOrderApiService tests', () => {
  //
  // Test IncomingPlaceOrderRequestInput edge cases
  //
  it('does not throw if the input PlaceOrderApiServiceInput is valid', async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await expect(placeOrderApiService.placeOrder(mockValidIncomingPlaceOrderRequestInput)).resolves.not.toThrow()
  })

  it('throws if the input PlaceOrderApiServiceInput is undefined', async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await expect(placeOrderApiService.placeOrder(undefined)).rejects.toThrow()
  })

  it('throws if the input PlaceOrderApiServiceInput is null', async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await expect(placeOrderApiService.placeOrder(null)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DdbPlaceOrderEventClient.placeOrder a single time', async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await placeOrderApiService.placeOrder(mockValidIncomingPlaceOrderRequestInput)
    expect(mockDdbPlaceOrderEventClient.raiseOrderPlacedEvent).toHaveBeenCalledTimes(1)
  })

  it('calls DdbPlaceOrderEventClient.placeOrder with the expected input', async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await placeOrderApiService.placeOrder(mockValidIncomingPlaceOrderRequestInput)
    expect(mockDdbPlaceOrderEventClient.raiseOrderPlacedEvent).toHaveBeenCalledWith(expectedOrderPlacedEvent)
  })

  it('throws if DdbPlaceOrderEventClient.placeOrder throws', async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_throws()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await expect(placeOrderApiService.placeOrder(mockValidIncomingPlaceOrderRequestInput)).rejects.toThrow()
  })

  it('returns a PlaceOrderApiServiceOutput with the expected orderId if DdbPlaceOrderEventClient.placeOrder throws InvalidEventRaiseOperationError_Redundant', async () => {
    const mockDdbPlaceOrderEventClient =
      buildMockDdbPlaceOrderEventClient_raiseEvent_throws_InvalidEventRaiseOperationError_Redundant()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const actualOutput = await placeOrderApiService.placeOrder(mockValidIncomingPlaceOrderRequestInput)
    expect(actualOutput).toStrictEqual(expectedValidOutput)
  })

  //
  // Test expected results
  //
  it('returns a PlaceOrderApiServiceOutput with the expected orderId', async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const actualOutput = await placeOrderApiService.placeOrder(mockValidIncomingPlaceOrderRequestInput)
    expect(actualOutput).toStrictEqual(expectedValidOutput)
  })
})
