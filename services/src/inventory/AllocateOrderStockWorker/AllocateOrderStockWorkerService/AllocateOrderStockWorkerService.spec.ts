import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import { IEsRaiseOrderStockAllocatedEventClient } from '../EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { IEsRaiseOrderStockDepletedEventClient } from '../EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'
import { GetOrderAllocationCommand } from '../model/GetOrderAllocationCommand'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'
import { AllocateOrderStockWorkerService } from './AllocateOrderStockWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate

function buildMockIncomingOrderCreatedEvent(): TypeUtilsMutable<IncomingOrderCreatedEvent> {
  const incomingOrderEventProps: IncomingOrderCreatedEvent = {
    eventName: InventoryEventName.ORDER_CREATED_EVENT,
    eventData: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  // COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
  const mockClass = IncomingOrderCreatedEvent.validateAndBuild({
    'detail-type': 'mockDetailType',
    account: 'mockAccount',
    id: 'mockId',
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
        NewImage: marshall(incomingOrderEventProps, { removeUndefinedValues: true }),
      },
    },
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()

function buildMockGetOrderAllocationCommand(): GetOrderAllocationCommand {
  const mockClass = GetOrderAllocationCommand.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedGetOrderAllocationCommand = buildMockGetOrderAllocationCommand()

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

/*
 *
 *
 ************************************************************
 * Mock Clients
 ************************************************************/
const existingOrderAllocationData: OrderAllocationData = {
  orderId: mockOrderId,
  sku: mockSku,
  units: mockUnits,
  price: mockPrice,
  userId: mockUserId,
  createdAt: mockCreatedAt,
  updatedAt: mockUpdatedAt,
  allocationStatus: 'ALLOCATED',
}

function buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation(): IDbGetOrderAllocationClient {
  return { getOrderAllocation: jest.fn().mockResolvedValue(Result.makeSuccess(existingOrderAllocationData)) }
}

function buildMockDbGetOrderAllocationClient_succeeds_nullItem(): IDbGetOrderAllocationClient {
  return { getOrderAllocation: jest.fn().mockResolvedValue(Result.makeSuccess(null)) }
}

function buildMockDbGetOrderAllocationClient_fails(
  failureKind?: FailureKind,
  message?: string,
  transient?: boolean,
): IDbGetOrderAllocationClient {
  return {
    getOrderAllocation: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', message ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

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

describe(`Inventory Service AllocateOrderStockWorker AllocateOrderStockWorkerService tests`, () => {
  // Clear all mocks before each test.
  // There is not a lot of mocking, but some for the Commands
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /*
   *
   *
   ************************************************************
   * Test when it validates the IncomingOrderCreatedEvent
   ************************************************************/
  describe(`Test when it validates the IncomingOrderCreatedEvent`, () => {
    it(`does not return a Failure if the input IncomingOrderCreatedEvent is valid`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderCreatedEvent is undefined`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockTestEvent = undefined as never
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderCreatedEvent is null`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockTestEvent = null as never
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderCreatedEvent is not an instance of the class`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockTestEvent = { ...mockIncomingOrderCreatedEvent }
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when it reads the Allocation from the database
   ************************************************************/
  describe(`Test when it reads the Allocation from the database`, () => {
    it(`returns the same Failure if GetOrderAllocationCommand.validateAndBuild returns a
        Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(GetOrderAllocationCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbGetOrderAllocationClient.getOrderAllocation a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbGetOrderAllocationClient.getOrderAllocation).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderAllocationClient.getOrderAllocation with the expected
        GetOrderAllocationCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbGetOrderAllocationClient.getOrderAllocation).toHaveBeenCalledWith(expectedGetOrderAllocationCommand)
    })

    it(`returns the same Failure if DbGetOrderAllocationClient.getOrderAllocation
        returns a Failure`, async () => {
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Allocation DOES NOT exist and it creates it and raises the Allocated event
   ************************************************************/
  describe(`Test when the Allocation DOES NOT exist and it creates it and raises the
            Allocated event`, () => {
    /*
     *
     *
     ************************************************************
     * Test when it creates the Allocation in the database
     ************************************************************/
    it(`returns the same Failure if AllocateOrderStockCommand.validateAndBuild returns a
        Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(AllocateOrderStockCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbAllocateOrderStockClient.allocateOrderStock a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledTimes(1)
    })

    it(`calls DbAllocateOrderStockClient.allocateOrderStock with the expected
        AllocateOrderStockCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledWith(expectedAllocateOrderStockCommand)
    })

    it(`returns the same Failure if DbAllocateOrderStockClient.allocateOrderStock
        returns a Failure not accounted for`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
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
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Allocated event
     ************************************************************/
    it(`returns the same Failure if the OrderStockAllocatedEvent.validateAndBuild
        returns a Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(OrderStockAllocatedEvent, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent a
        single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent with
        the expected OrderStockAllocatedEvent`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const { eventData } = mockIncomingOrderCreatedEvent
      const expectedOrderStockAllocatedEventResult = OrderStockAllocatedEvent.validateAndBuild(eventData)
      const expectedOrderStockAllocatedEvent = Result.getSuccessValueOrThrow(expectedOrderStockAllocatedEventResult)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledWith(
        expectedOrderStockAllocatedEvent,
      )
    })

    it(`returns the same Failure if
        EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent returns a
        Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
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
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockMessage, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected Success<void> if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

  /*
   *
   *
   ************************************************************
   * Test when the Allocation DOES exist and it only raises the Allocated event
   ************************************************************/
  describe(`Test when the Allocation DOES exist and it only raises the Allocated event`, () => {
    /*
     *
     *
     ************************************************************
     * Test that it skips creating the Allocation
     ************************************************************/
    it(`does not call AllocateOrderStockCommand.validateAndBuild`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const spy = jest.spyOn(AllocateOrderStockCommand, 'validateAndBuild')
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(spy).not.toHaveBeenCalled()
    })

    it(`does not call DbAllocateOrderStockClient.allocateOrderStock`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).not.toHaveBeenCalled()
    })

    it(`does not return a Failure if DbAllocateOrderStockClient.allocateOrderStock
        returns a Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Allocated event
     ************************************************************/
    it(`returns the same Failure if the OrderStockAllocatedEvent.validateAndBuild
        returns a Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(OrderStockAllocatedEvent, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent a
        single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent with
        the expected OrderStockAllocatedEvent`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const { eventData } = mockIncomingOrderCreatedEvent
      const expectedOrderStockAllocatedEventResult = OrderStockAllocatedEvent.validateAndBuild(eventData)
      const expectedOrderStockAllocatedEvent = Result.getSuccessValueOrThrow(expectedOrderStockAllocatedEventResult)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledWith(
        expectedOrderStockAllocatedEvent,
      )
    })

    it(`returns the same Failure if
        EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent returns a
        Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
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
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockMessage, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected Success<void> if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_succeeds()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

  /*
   *
   *
   ************************************************************
   * Test when the Allocation DOES NOT exist WHEN READ but was created by another instance/race condition
   ************************************************************/
  describe(`Test when the Allocation DOES NOT exist WHEN READ but was created by another
            instance/race condition`, () => {
    /*
     *
     *
     ************************************************************
     * Test when it tries to create the Allocation but it already exists
     ************************************************************/
    it(`returns the same Failure if AllocateOrderStockCommand.validateAndBuild returns a
        Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(AllocateOrderStockCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbAllocateOrderStockClient.allocateOrderStock a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledTimes(1)
    })

    it(`calls DbAllocateOrderStockClient.allocateOrderStock with the expected
        AllocateOrderStockCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledWith(expectedAllocateOrderStockCommand)
    })

    it(`does not return a Failure if DbAllocateOrderStockClient.allocateOrderStock
        returns a Failure of kind DuplicateStockAllocationError`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Allocated event
     ************************************************************/
    it(`returns the same Failure if the OrderStockAllocatedEvent.validateAndBuild
        returns a Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(OrderStockAllocatedEvent, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent a
        single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent with
        the expected OrderStockAllocatedEvent`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const { eventData } = mockIncomingOrderCreatedEvent
      const expectedOrderStockAllocatedEventResult = OrderStockAllocatedEvent.validateAndBuild(eventData)
      const expectedOrderStockAllocatedEvent = Result.getSuccessValueOrThrow(expectedOrderStockAllocatedEventResult)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledWith(
        expectedOrderStockAllocatedEvent,
      )
    })

    it(`returns the same Failure if
        EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent returns a
        Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
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
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockMessage, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the expected Success<void> if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DuplicateStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

  /*
   *
   *
   ************************************************************
   * Test when the Allocation DOES NOT exist and there is not enough stock and it raises the Depleted event
   ************************************************************/
  describe(`Test when the Allocation DOES NOT exist and there is not enough stock and it
            raises the Depleted event`, () => {
    /*
     *
     *
     ************************************************************
     * Test when it creates the Allocation but there is not enough stock
     ************************************************************/
    it(`returns the same Failure if AllocateOrderStockCommand.validateAndBuild returns a
        Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(AllocateOrderStockCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbAllocateOrderStockClient.allocateOrderStock a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledTimes(1)
    })

    it(`calls DbAllocateOrderStockClient.allocateOrderStock with the expected
        AllocateOrderStockCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledWith(expectedAllocateOrderStockCommand)
    })

    it(`does not return a Failure if DbAllocateOrderStockClient.allocateOrderStock
        returns a Failure of kind DepletedStockAllocationError`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Depleted event
     ************************************************************/
    it(`returns the same Failure if the OrderStockDepletedEvent.validateAndBuild returns
        a Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(OrderStockDepletedEvent, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent a single
        time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent the
        expected OrderStockDepletedEvent`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const { eventData } = mockIncomingOrderCreatedEvent
      const expectedOrderStockDepletedEventResult = OrderStockDepletedEvent.validateAndBuild(eventData)
      const expectedOrderStockDepletedEvent = Result.getSuccessValueOrThrow(expectedOrderStockDepletedEventResult)
      expect(mockEsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent).toHaveBeenCalledWith(
        expectedOrderStockDepletedEvent,
      )
    })

    it(`returns the same Failure if
        EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent returns a
        Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
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
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockMessage, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected Success<void> if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_fails('DepletedStockAllocationError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_succeeds()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_succeeds()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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
})
