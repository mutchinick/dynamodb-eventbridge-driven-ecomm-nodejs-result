import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IEsRaiseOrderStockAllocatedEventClient } from '../EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { IEsRaiseOrderStockDepletedEventClient } from '../EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'
import { AllocateOrderStockWorkerService } from './AllocateOrderStockWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

// COMBAK: Figure a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockIncomingOrderCreatedEvent(): TypeUtilsMutable<IncomingOrderCreatedEvent> {
  const incomingOrderEventProps: IncomingOrderCreatedEvent = {
    eventName: WarehouseEventName.ORDER_CREATED_EVENT,
    eventData: {
      orderId: 'mockOrderId',
      sku: 'mockSku',
      units: 2,
      price: 10.55,
      userId: 'mockUserId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  const mockClass = IncomingOrderCreatedEvent.validateAndBuild({
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

const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()

function buildExpectedAllocateOrderStockCommand(): TypeUtilsMutable<AllocateOrderStockCommand> {
  const mockClass = AllocateOrderStockCommand.validateAndBuild({
    incomingOrderCreatedEvent: {
      eventName: mockIncomingOrderCreatedEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderCreatedEvent.eventData.orderId,
        sku: mockIncomingOrderCreatedEvent.eventData.sku,
        units: mockIncomingOrderCreatedEvent.eventData.units,
        price: mockIncomingOrderCreatedEvent.eventData.price,
        userId: mockIncomingOrderCreatedEvent.eventData.userId,
      },
      createdAt: mockIncomingOrderCreatedEvent.createdAt,
      updatedAt: mockIncomingOrderCreatedEvent.updatedAt,
    },
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedAllocateOrderStockCommand = buildExpectedAllocateOrderStockCommand()

//
// Mock Clients
//
function buildMockDbAllocateOrderStockClient_succeeds(): IDbAllocateOrderStockClient {
  return { allocateOrderStock: jest.fn().mockResolvedValue(Result.makeSuccess(undefined)) }
}

function buildMockDbAllocateOrderStockClient_fails(
  failureKind?: FailureKind,
  message?: string,
  transient?: boolean,
): IDbAllocateOrderStockClient {
  return {
    allocateOrderStock: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', message ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

function buildMockEsRaiseOrderStockAllocatedEventClient_succeeds(
  value?: unknown,
): IEsRaiseOrderStockAllocatedEventClient {
  return { raiseOrderStockAllocatedEvent: jest.fn().mockResolvedValue(Result.makeSuccess(value)) }
}

function buildMockEsRaiseOrderStockAllocatedEventClient_fails(
  failureKind?: FailureKind,
  error?: string,
  transient?: boolean,
): IEsRaiseOrderStockAllocatedEventClient {
  return {
    raiseOrderStockAllocatedEvent: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

function buildMockEsRaiseOrderStockDepletedEventClient_succeeds(
  value?: unknown,
): IEsRaiseOrderStockDepletedEventClient {
  return { raiseOrderStockDepletedEvent: jest.fn().mockResolvedValue(Result.makeSuccess(value)) }
}

function buildMockEsRaiseOrderStockDepletedEventClient_fails(
  failureKind?: FailureKind,
  error?: string,
  transient?: boolean,
): IEsRaiseOrderStockDepletedEventClient {
  return {
    raiseOrderStockDepletedEvent: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

describe(`Warehouse Service AllocateOrderStockWorker AllocateOrderStockWorkerService tests`, () => {
  //
  // Test IncomingOrderCreatedEvent edge cases
  //
  it(`returns a Success if the input IncomingOrderCreatedEvent is valid`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if IncomingOrderCreatedEvent is undefined`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    const result = await allocateOrderStockWorkerService.allocateOrderStock(undefined)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic allocateOrderStock
  //
  it(`returns an Failure if AllocateOrderStockCommand.validateAndBuild returns a Failure`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    const mockFailure = Result.makeFailure('InvalidArgumentsError', '', false)
    jest.spyOn(AllocateOrderStockCommand, 'validateAndBuild').mockReturnValueOnce(mockFailure)
    const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    expect(Result.isFailure(result)).toBe(true)
  })

  it(`calls DbAllocateOrderStockClient.allocateOrderStock a single time`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledTimes(1)
  })

  it(`calls DbAllocateOrderStockClient.allocateOrderStock with the expected AllocateOrderStockCommand`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledWith(expectedAllocateOrderStockCommand)
  })

  it(`returns the same Failure if DbAllocateOrderStockClient.allocateOrderStock returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails(
      mockFailureKind,
      mockError,
      mockTransient,
    )
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  //
  // When DbAllocateOrderStockClient.allocateOrderStock returns a Success
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock returns a Success`, () => {
    const { eventData } = mockIncomingOrderCreatedEvent
    const orderStockAllocatedEventResult = OrderStockAllocatedEvent.validateAndBuild(eventData)
    const orderStockAllocatedEvent = Result.getSuccessValueOrThrow(orderStockAllocatedEventResult)

    it(`returns a Failure if the OrderStockAllocatedEvent.validateAndBuild returns a Failure`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailure = Result.makeFailure('InvalidArgumentsError', '', false)
      jest.spyOn(OrderStockAllocatedEvent, 'validateAndBuild').mockReturnValueOnce(mockFailure)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent a single time`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent
        with the expected OrderStockAllocatedEvent`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledWith(
        orderStockAllocatedEvent,
      )
    })

    it(`returns the same Success if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent
        returns a Success`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockValue = 'mockValue'
      const mockEsRaiseOrderStockAllocatedEventClient =
        buildMockEsRaiseOrderStockAllocatedEventClient_succeeds(mockValue)
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeSuccess(mockValue)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the same Failure if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent
        returns a Failure`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockFailureKind = 'mockFailureKind' as never
      const mockMessage = 'mockMessage' as never
      const mockTransient = 'mockTransient' as never
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_fails(
        mockFailureKind,
        mockMessage,
        mockTransient,
      )
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockMessage, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  //
  // When DbAllocateOrderStockClient.allocateOrderStock returns an DuplicateStockAllocationError Failure
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock returns an
            DuplicateStockAllocationError Failure`, () => {
    const { eventData } = mockIncomingOrderCreatedEvent
    const orderStockAllocatedEventResult = OrderStockAllocatedEvent.validateAndBuild(eventData)
    const orderStockAllocatedEvent = Result.getSuccessValueOrThrow(orderStockAllocatedEventResult)

    it(`returns a Failure if the OrderStockAllocatedEvent.validateAndBuild returns a Failure`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailure = Result.makeFailure('InvalidArgumentsError', '', false)
      jest.spyOn(OrderStockAllocatedEvent, 'validateAndBuild').mockReturnValueOnce(mockFailure)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent a single time`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent with the expected
        OrderStockAllocatedEvent`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledWith(
        orderStockAllocatedEvent,
      )
    })

    it(`returns the same Success if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent
        returns a Success`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockValue = 'mockValue'
      const mockEsRaiseOrderStockAllocatedEventClient =
        buildMockEsRaiseOrderStockAllocatedEventClient_succeeds(mockValue)
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeSuccess(mockValue)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the same Failure if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent
        returns a Failure`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockFailureKind = 'mockFailureKind' as never
      const mockMessage = 'mockMessage' as never
      const mockTransient = 'mockTransient' as never
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_fails(
        mockFailureKind,
        mockMessage,
        mockTransient,
      )
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockMessage, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  //
  // When DbAllocateOrderStockClient.allocateOrderStock returns an DepletedStockAllocationError Failure
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock returns an
            DepletedStockAllocationError Failure`, () => {
    const { eventData } = mockIncomingOrderCreatedEvent
    const orderStockDepletedEventResult = OrderStockDepletedEvent.validateAndBuild(eventData)
    const orderStockDepletedEvent = Result.getSuccessValueOrThrow(orderStockDepletedEventResult)

    it(`returns a Failure if the OrderStockDepletedEvent.validateAndBuild returns a Failure`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailure = Result.makeFailure('InvalidArgumentsError', '', false)
      jest.spyOn(OrderStockDepletedEvent, 'validateAndBuild').mockReturnValueOnce(mockFailure)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
    })

    it(`calls EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent a single time`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent the expected
        OrderStockDepletedEvent`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent).toHaveBeenCalledWith(
        orderStockDepletedEvent,
      )
    })

    it(`returns the same Success if EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent
        returns a Success`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockValue = 'mockValue'
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds(mockValue)
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeSuccess(mockValue)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the same Failure if EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent
        returns a Failure`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockFailureKind = 'MockFailure' as never
      const mockMessage = 'Mock message' as never
      const mockTransient = 'Mock transient' as never
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_fails(
        mockFailureKind,
        mockMessage,
        mockTransient,
      )
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockMessage, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  //
  // When DbAllocateOrderStockClient.allocateOrderStock returns an InvalidArgumentsError or UnrecognizedError Failure
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock returns an
            InvalidArgumentsError or UnrecognizedError Failure`, () => {
    it(`returns an InvalidArgumentsError Failure if DbAllocateOrderStockClient.allocateOrderStock
        returns an InvalidArgumentsError Failure`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('InvalidArgumentsError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    })

    it(`returns an UnrecognizedError Failure if DbAllocateOrderStockClient.allocateOrderStock
        returns an UnrecognizedError Failure`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('UnrecognizedError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    })
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<void> with the expected data`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
