import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IDbRestockSkuClient } from '../DbRestockSkuClient/DbRestockSkuClient'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { RestockSkuCommand } from '../model/RestockSkuCommand'
import { RestockSkuWorkerService } from './RestockSkuWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

// COMBAK: Figure a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockIncomingSkuRestockedEvent(): TypeUtilsMutable<IncomingSkuRestockedEvent> {
  const incomingOrderEventProps: IncomingSkuRestockedEvent = {
    eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    eventData: {
      sku: 'mockSku',
      units: 2,
      lotId: 'mockLotId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  const mockClass = IncomingSkuRestockedEvent.validateAndBuild({
    'detail-type': 'mockDetailType',
    id: 'mockId',
    account: 'mockAccount',
    region: 'mockRegion',
    resources: [],
    source: 'mockSource',
    time: 'mockTime',
    version: 'mockVersion',
    detail: {
      awsRegion: 'mockAwsRegion',
      eventID: 'mockEventId',
      eventName: 'INSERT',
      eventSource: 'aws:dynamodb',
      eventVersion: 'mockEventVersion',
      dynamodb: {
        NewImage: marshall(incomingOrderEventProps),
      },
    },
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()

function buildExpectedRestockSkuCommand(): TypeUtilsMutable<RestockSkuCommand> {
  const mockClass = RestockSkuCommand.validateAndBuild({
    incomingSkuRestockedEvent: {
      eventName: mockIncomingSkuRestockedEvent.eventName,
      eventData: {
        sku: mockIncomingSkuRestockedEvent.eventData.sku,
        units: mockIncomingSkuRestockedEvent.eventData.units,
        lotId: mockIncomingSkuRestockedEvent.eventData.lotId,
      },
      createdAt: mockIncomingSkuRestockedEvent.createdAt,
      updatedAt: mockIncomingSkuRestockedEvent.updatedAt,
    },
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedRestockSkuCommand = buildExpectedRestockSkuCommand()

//
// Mock Clients
//
function buildMockDbRestockSkuClient_succeeds(value?: unknown): IDbRestockSkuClient {
  return { restockSku: jest.fn().mockResolvedValue(Result.makeSuccess(value)) }
}

function buildMockDbRestockSkuClient_fails(
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
  it(`returns a Success if the input IncomingSkuRestockedEvent is valid`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if 
      IncomingSkuRestockedEvent is undefined`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(undefined)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`returns the same Failure if RestockSkuCommand.validateAndBuild returns a Failure`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(RestockSkuCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
    const result = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls DbRestockSkuClient.restockSku a single time`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(mockDbRestockSkuClient.restockSku).toHaveBeenCalledTimes(1)
  })

  it(`calls DbRestockSkuClient.restockSku with the expected RestockSkuCommand`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(mockDbRestockSkuClient.restockSku).toHaveBeenCalledWith(expectedRestockSkuCommand)
  })

  it(`returns the same Failure if DbRestockSkuClient.restockSku returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError' as never
    const mockTransient = 'mockTransient' as never
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_fails(mockFailureKind, mockError, mockTransient)
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the same Success if DbRestockSkuClient.restockSku returns a Success`, async () => {
    const mockValue = 'mockValue'
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_succeeds(mockValue)
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    const expectedResult = Result.makeSuccess(mockValue)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<void> with the expected data`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_succeeds()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const result = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
