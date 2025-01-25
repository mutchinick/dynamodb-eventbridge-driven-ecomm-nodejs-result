import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { IDbCreateOrderClient } from '../DbCreateOrderClient/DbCreateOrderClient'
import { IDbGetOrderClient } from '../DbGetOrderClient/DbGetOrderClient'
import { IDbUpdateOrderClient } from '../DbUpdateOrderClient/DbUpdateOrderClient'
import { IEsRaiseOrderCreatedEventClient } from '../EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { CreateOrderCommand, CreateOrderCommandInput } from '../model/CreateOrderCommand'
import { GetOrderCommand, GetOrderCommandInput } from '../model/GetOrderCommand'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { OrderCreatedEvent, OrderCreatedEventInput } from '../model/OrderCreatedEvent'
import { UpdateOrderCommand, UpdateOrderCommandInput } from '../model/UpdateOrderCommand'
import { SyncOrderService } from './SyncOrderService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockValidExistingOrderData: OrderData = {
  orderId: 'mockOrderId',
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: 'mockSku',
  quantity: 2,
  price: 3.98,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: 'mockUpdatedAt',
}

//
// Mock Clients
//
function buildMockDbGetOrderClient_getOrder_resolves_OrderData(): IDbGetOrderClient {
  return { getOrder: jest.fn().mockResolvedValue(mockValidExistingOrderData) }
}

function buildMockDbGetOrderClient_getOrder_throws(): IDbGetOrderClient {
  return { getOrder: jest.fn().mockRejectedValue(new Error()) }
}

function buildMockDbGetOrderClient_getOrder_resolves_null(): IDbGetOrderClient {
  return { getOrder: jest.fn().mockResolvedValue(null) }
}

function buildMockDbCreateOrderClient_createOrder_resolves(): IDbCreateOrderClient {
  return { createOrder: jest.fn().mockResolvedValue(mockValidExistingOrderData) }
}

function buildMockDbCreateOrderClient_createOrder_throws(): IDbCreateOrderClient {
  return { createOrder: jest.fn().mockResolvedValue(new Error()) }
}

function buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves(): IEsRaiseOrderCreatedEventClient {
  return { raiseOrderCreatedEvent: jest.fn() }
}

function buildMockEsRaiseOrderCreatedEventClient_raiseEvent_throws(): IEsRaiseOrderCreatedEventClient {
  return { raiseOrderCreatedEvent: jest.fn().mockRejectedValue(new Error()) }
}

function buildMockDbUpdateOrderClient_updateOrder_resolves(): IDbUpdateOrderClient {
  return { updateOrder: jest.fn().mockResolvedValue(mockValidExistingOrderData) }
}

function buildMockDbUpdateOrderClient_updateOrder_throws(): IDbUpdateOrderClient {
  return { updateOrder: jest.fn().mockRejectedValue(new Error()) }
}

const mockValidGetOrderCommandInput: GetOrderCommandInput = {
  orderId: 'mockOrderId',
}

const expectedGetOrderCommand = GetOrderCommand.validateAndBuild(mockValidGetOrderCommandInput)

describe('Orders Service SyncOrderWorker SyncOrderService tests', () => {
  //
  // Test IncomingOrderEvent edge cases
  //
  it('throws if IncomingOrderEvent is undefined', async () => {
    const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
    const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
    const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_throws()
    const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
    const syncOrderService = new SyncOrderService(
      mockDbGetOrderClient,
      mockDbCreateOrderClient,
      mockDbUpdateOrderClient,
      mockEsRaiseOrderCreatedEventClient,
    )
    await expect(syncOrderService.syncOrder(undefined)).rejects.toThrow()
  })

  //
  // When it is an OrderPlacedEvent
  //
  describe('when it is an OrderPlacedEvent', () => {
    const mockValidOrderPlacedEvent: IncomingOrderEvent = {
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
        sku: 'mockSku',
        quantity: 2,
        price: 3.98,
        userId: 'mockUserId',
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }

    const mockValidOrderCreatedEventInput: OrderCreatedEventInput = {
      incomingEventName: OrderEventName.ORDER_PLACED_EVENT,
      orderData: mockValidExistingOrderData,
    }

    const expectedOrderCreatedEvent = OrderCreatedEvent.validateAndBuild(mockValidOrderCreatedEventInput)

    it('calls DbGetOrderClient.getOrder a single time', async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
      const syncOrderService = new SyncOrderService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledTimes(1)
    })

    it('calls DbGetOrderClient.getOrder with the expected GetOrderCommand', async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
      const syncOrderService = new SyncOrderService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it('throws if DbGetOrderClient.getOrder throws', async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_throws()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
      const syncOrderService = new SyncOrderService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow()
    })

    //
    // When the Order exists
    //
    describe('when the Order exists', () => {
      it('does not call DbCreateOrderClient.createOrder', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
        expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledTimes(0)
      })

      it('calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent a single time', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
        expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(1)
      })

      it('calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent with the expected OrderCreatedEvent', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
        expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledWith(
          expectedOrderCreatedEvent,
        )
      })

      it('throws if EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent throws', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_throws()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await expect(syncOrderService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow()
      })

      it('returns a void promise', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        const serviceOutput = await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
        expect(serviceOutput).not.toBeDefined()
      })
    })

    //
    // When the Order does not exist
    //
    describe('when the Order does not exist', () => {
      const mockValidCreateOrderCommandInput: CreateOrderCommandInput = {
        incomingOrderEvent: mockValidOrderPlacedEvent,
      }

      const expectedCreateOrderCommand = CreateOrderCommand.validateAndBuild(mockValidCreateOrderCommandInput)

      it('calls DbCreateOrderClient.createOrder a single time', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
        expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledTimes(1)
      })

      it('calls DbCreateOrderClient.createOrder with the expected CreateOrderCommand', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
        expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledWith(expectedCreateOrderCommand)
      })

      it('throws if DbCreateOrderClient.createOrder throws', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_throws()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await expect(syncOrderService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow()
      })

      it('calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent a single time', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
        expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(1)
      })

      it('calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent with the expected OrderCreatedEvent', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
        expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledWith(
          expectedOrderCreatedEvent,
        )
      })

      it('throws if EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent throws', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_throws()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await expect(syncOrderService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow()
      })

      it('returns a void promise', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        const serviceOutput = await syncOrderService.syncOrder(mockValidOrderPlacedEvent)
        expect(serviceOutput).not.toBeDefined()
      })
    })
  })

  //
  // When it is not an OrderPlacedEvent
  //
  describe('when it is not an OrderPlacedEvent', () => {
    const mockValidOrderStockAllocatedEvent: IncomingOrderEvent = {
      eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }

    it('calls DbGetOrderClient.getOrder a single time', async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
      const syncOrderService = new SyncOrderService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledTimes(1)
    })

    it('calls DbGetOrderClient.getOrder with the expected GetOrderCommand', async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
      const syncOrderService = new SyncOrderService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it('throws if DbGetOrderClient.getOrder throws', async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_throws()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
      const syncOrderService = new SyncOrderService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow()
    })

    //
    // When the Order exists
    //
    describe('when the Order exists', () => {
      const mockValidUpdateOrderCommandInput: UpdateOrderCommandInput = {
        existingOrderData: mockValidExistingOrderData,
        incomingOrderEvent: mockValidOrderStockAllocatedEvent,
      }

      const expectedUpdateOrderCommand = UpdateOrderCommand.validateAndBuild(mockValidUpdateOrderCommandInput)

      it('calls DbUpdateOrderClient.updateOrder a single time', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)
        expect(mockDbUpdateOrderClient.updateOrder).toHaveBeenCalledTimes(1)
      })

      it('calls DbUpdateOrderClient.updateOrder with the expected UpdateOrderCommand', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)
        expect(mockDbUpdateOrderClient.updateOrder).toHaveBeenCalledWith(expectedUpdateOrderCommand)
      })

      it('throws if DbUpdateOrderClient.updateOrder throws', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_throws()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await expect(syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow()
      })

      it('does not call EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)
        expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(0)
      })

      it('returns a void promise', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_OrderData()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        const serviceOutput = await syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)
        expect(serviceOutput).not.toBeDefined()
      })
    })

    //
    // When the Order does not exist
    //
    describe('when the Order does not exist', () => {
      it('does not call DbUpdateOrderClient.updateOrder', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)
        expect(mockDbUpdateOrderClient.updateOrder).toHaveBeenCalledTimes(0)
      })

      it('does not call EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        await syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)
        expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(0)
      })

      it('returns a void promise', async () => {
        const mockDbGetOrderClient = buildMockDbGetOrderClient_getOrder_resolves_null()
        const mockDbCreateOrderClient = buildMockDbCreateOrderClient_createOrder_resolves()
        const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_updateOrder_resolves()
        const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_raiseEvent_resolves()
        const syncOrderService = new SyncOrderService(
          mockDbGetOrderClient,
          mockDbCreateOrderClient,
          mockDbUpdateOrderClient,
          mockEsRaiseOrderCreatedEventClient,
        )
        const serviceOutput = await syncOrderService.syncOrder(mockValidOrderStockAllocatedEvent)
        expect(serviceOutput).not.toBeDefined()
      })
    })
  })
})
