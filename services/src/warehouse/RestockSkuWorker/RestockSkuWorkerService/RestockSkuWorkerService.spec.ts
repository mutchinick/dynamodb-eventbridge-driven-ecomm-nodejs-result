import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IDbRestockSkuClient } from '../DbRestockSkuClient/DbRestockSkuClient'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { RestockSkuCommand, RestockSkuCommandInput } from '../model/RestockSkuCommand'
import { RestockSkuWorkerService } from './RestockSkuWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockIncomingSkuRestockedEvent: IncomingSkuRestockedEvent = {
  eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
  eventData: {
    sku: 'mockSku',
    units: 3,
    lotId: 'mockLotId',
  },
  createdAt: mockDate,
  updatedAt: mockDate,
}

const mockValidRestockSkuCommandInput: RestockSkuCommandInput = {
  incomingSkuRestockedEvent: mockIncomingSkuRestockedEvent,
}

const expectedRestockSkuCommand = RestockSkuCommand.validateAndBuild(mockValidRestockSkuCommandInput)

//
// Mock Clients
//
function buildMockDbRestockSkuClient_restockSku_resolves(): IDbRestockSkuClient {
  return { restockSku: jest.fn() }
}

function buildMockDbRestockSkuClient_restockSku_throws(): IDbRestockSkuClient {
  return { restockSku: jest.fn().mockRejectedValue(new Error()) }
}

describe('Warehouse Service RestockSkuWorker RestockSkuWorkerService tests', () => {
  //
  // Test IncomingSkuRestockedEvent edge cases
  //
  it('throws if IncomingSkuRestockedEvent is undefined', async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_throws()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await expect(restockSkuWorkerService.restockSku(undefined)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DbRestockSkuClient.restockSku a single time', async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(mockDbRestockSkuClient.restockSku).toHaveBeenCalledTimes(1)
  })

  it('calls DbRestockSkuClient.restockSku with the expected RestockSkuCommand', async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(mockDbRestockSkuClient.restockSku).toHaveBeenCalledWith(expectedRestockSkuCommand)
  })

  it('throws if DbRestockSkuClient.restockSku throws', async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_throws()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await expect(restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)).rejects.toThrow()
  })

  //
  // Test expected results
  //
  it('returns a void promise', async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const serviceOutput = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(serviceOutput).not.toBeDefined()
  })
})
