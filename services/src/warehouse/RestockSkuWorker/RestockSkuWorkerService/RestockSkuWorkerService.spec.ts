import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
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

const expectedRestockSkuCommandResult = RestockSkuCommand.validateAndBuild(mockValidRestockSkuCommandInput)

const expectedRestockSkuCommand = Result.getSuccessValueOrThrow(expectedRestockSkuCommandResult)

//
// Mock Clients
//
function buildMockDbRestockSkuClient_restockSku_succeeds(value?: unknown): IDbRestockSkuClient {
  return { restockSku: jest.fn().mockResolvedValue(Result.makeSuccess(value)) }
}

function buildMockDbRestockSkuClient_restockSku_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IDbRestockSkuClient {
  return {
    restockSku: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

describe(`Warehouse Service RestockSkuWorker RestockSkuWorkerService tests`, () => {
  //
  // Test IncomingSkuRestockedEvent edge cases
  //
  it(`returns a Failure if IncomingSkuRestockedEvent is undefined`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(undefined)
    expect(Result.isFailure(result)).toBe(true)
  })

  //
  // Test internal logic
  //
  it(`calls DbRestockSkuClient.restockSku a single time`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(mockDbRestockSkuClient.restockSku).toHaveBeenCalledTimes(1)
  })

  it(`calls DbRestockSkuClient.restockSku with the expected RestockSkuCommand`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(mockDbRestockSkuClient.restockSku).toHaveBeenCalledWith(expectedRestockSkuCommand)
  })

  it(`returns a Failure if DbRestockSkuClient.restockSku returns a failure`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_fails()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(undefined)
    expect(Result.isFailure(result)).toBe(true)
  })

  it(`returns the same Success if DbRestockSkuClient.restockSku returns a Success`, async () => {
    const mockValue = 'mockValue'
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_succeeds(mockValue)
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    const expectedResult = Result.makeSuccess(mockValue)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the same Failure if DbRestockSkuClient.restockSku returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError' as never
    const mockTransient = 'mockTransient' as never
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_fails(
      mockFailureKind,
      mockError,
      mockTransient,
    )
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  //
  // Test expected results
  //
  it(`returns a Success when all components return a Success`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns the expected Success<void> when all components return a Success<void>`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_restockSku_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    const expectedResult = Result.makeSuccess()
    expect(result).toStrictEqual(expectedResult)
  })
})
