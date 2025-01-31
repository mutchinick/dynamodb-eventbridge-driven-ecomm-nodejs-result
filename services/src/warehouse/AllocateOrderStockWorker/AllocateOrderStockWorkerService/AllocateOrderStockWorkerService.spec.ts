import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { AllocateOrderStockCommand, AllocateOrderStockCommandInput } from '../model/AllocateOrderStockCommand'
import { AllocateOrderStockWorkerService } from './AllocateOrderStockWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockIncomingOrderCreatedEvent: IncomingOrderCreatedEvent = {
  eventName: WarehouseEventName.ORDER_CREATED_EVENT,
  eventData: {
    sku: 'mockSku',
    units: 3,
    orderId: 'mockOrderId',
  },
  createdAt: mockDate,
  updatedAt: mockDate,
}

const mockValidAllocateOrderStockCommandInput: AllocateOrderStockCommandInput = {
  incomingOrderCreatedEvent: mockIncomingOrderCreatedEvent,
}

const expectedAllocateOrderStockCommand = AllocateOrderStockCommand.validateAndBuild(
  mockValidAllocateOrderStockCommandInput,
)

//
// Mock Clients
//
function buildMockDbAllocateOrderStockClient_allocateOrderStock_resolves(): IDbAllocateOrderStockClient {
  return { allocateOrderStock: jest.fn() }
}

function buildMockDbAllocateOrderStockClient_allocateOrderStock_throws(): IDbAllocateOrderStockClient {
  return { allocateOrderStock: jest.fn().mockRejectedValue(new Error()) }
}

describe('Warehouse Service AllocateOrderStockWorker AllocateOrderStockWorkerService tests', () => {
  //
  // Test IncomingOrderCreatedEvent edge cases
  //
  it('throws if IncomingOrderCreatedEvent is undefined', async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_allocateOrderStock_throws()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(mockDbAllocateOrderStockClient)
    await expect(allocateOrderStockWorkerService.allocateOrderStock(undefined)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DbAllocateOrderStockClient.allocateOrderStock a single time', async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_allocateOrderStock_resolves()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(mockDbAllocateOrderStockClient)
    await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledTimes(1)
  })

  it('calls DbAllocateOrderStockClient.allocateOrderStock with the expected AllocateOrderStockCommand', async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_allocateOrderStock_resolves()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(mockDbAllocateOrderStockClient)
    await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledWith(expectedAllocateOrderStockCommand)
  })

  it('throws if DbAllocateOrderStockClient.allocateOrderStock throws', async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_allocateOrderStock_throws()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(mockDbAllocateOrderStockClient)
    await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow()
  })

  //
  // Test expected results
  //
  it('returns a void promise', async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_allocateOrderStock_resolves()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(mockDbAllocateOrderStockClient)
    const serviceOutput = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    expect(serviceOutput).not.toBeDefined()
  })
})
