import { marshall } from '@aws-sdk/util-dynamodb'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbDeallocateOrderPaymentRejectedClient } from '../DbDeallocateOrderPaymentRejectedClient/DbDeallocateOrderPaymentRejectedClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import { DeallocateOrderPaymentRejectedCommand } from '../model/DeallocateOrderPaymentRejectedCommand'
import { GetOrderAllocationCommand } from '../model/GetOrderAllocationCommand'
import { IncomingOrderPaymentRejectedEvent } from '../model/IncomingOrderPaymentRejectedEvent'
import { DeallocateOrderPaymentRejectedWorkerService } from './DeallocateOrderPaymentRejectedWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.55
const mockUserId = 'mockUserId'

function buildMockExistingOrderAllocationData(): OrderAllocationData {
  const mockClass: OrderAllocationData = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
    createdAt: mockDate,
    updatedAt: mockDate,
    allocationStatus: 'ALLOCATED',
  }
  return mockClass
}

const mockExistingOrderAllocationData = buildMockExistingOrderAllocationData()

function buildMockGetOrderAllocationCommand(): GetOrderAllocationCommand {
  const mockClass = GetOrderAllocationCommand.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedGetOrderAllocationCommand = buildMockGetOrderAllocationCommand()

function buildMockIncomingOrderPaymentRejectedEvent(): IncomingOrderPaymentRejectedEvent {
  const incomingOrderEventProps: IncomingOrderPaymentRejectedEvent = {
    eventName: InventoryEventName.ORDER_PAYMENT_REJECTED_EVENT,
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

  // COMBAK: Work a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
  const mockClass = IncomingOrderPaymentRejectedEvent.validateAndBuild({
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

const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()

function buildExpectedDeallocateOrderPaymentRejectedCommand(): DeallocateOrderPaymentRejectedCommand {
  const mockClass = DeallocateOrderPaymentRejectedCommand.validateAndBuild({
    existingOrderAllocationData: mockExistingOrderAllocationData,
    incomingOrderPaymentRejectedEvent: mockIncomingOrderPaymentRejectedEvent,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedDeallocateOrderPaymentRejectedCommand = buildExpectedDeallocateOrderPaymentRejectedCommand()

/*
 *
 *
 ************************************************************
 * Mock Clients
 ************************************************************/
function buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation(): IDbGetOrderAllocationClient {
  return {
    getOrderAllocation: jest.fn().mockResolvedValue(Result.makeSuccess(mockExistingOrderAllocationData)),
  }
}

function buildMockDbGetOrderAllocationClient_succeeds_nullItem(): IDbGetOrderAllocationClient {
  return {
    getOrderAllocation: jest.fn().mockResolvedValue(Result.makeSuccess(null)),
  }
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

function buildMockDbDeallocateOrderPaymentRejectedClient_succeeds(): IDbDeallocateOrderPaymentRejectedClient {
  return { deallocateOrderStock: jest.fn().mockResolvedValue(Result.makeSuccess(undefined)) }
}

function buildMockDbDeallocateOrderPaymentRejectedClient_fails(
  failureKind?: FailureKind,
  message?: string,
  transient?: boolean,
): IDbDeallocateOrderPaymentRejectedClient {
  return {
    deallocateOrderStock: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', message ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

describe(`Inventory Service DeallocateOrderPaymentRejectedWorker
          DeallocateOrderPaymentRejectedWorkerService tests`, () => {
  // Clear all mocks before each test.
  // There is not a lot of mocking, but some for the Commands
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent edge cases
   ************************************************************/
  describe(`Test IncomingOrderPaymentRejectedEvent edge cases`, () => {
    it(`does not return a Failure if the input IncomingOrderPaymentRejectedEvent is
        valid`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(
        mockIncomingOrderPaymentRejectedEvent,
      )
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderPaymentRejectedEvent is undefined`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const mockTestEvent = undefined as never
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderPaymentRejectedEvent is null`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const mockTestEvent = null as never
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderPaymentRejectedEvent is not an instance of the class`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const mockTestEvent = { ...mockIncomingOrderPaymentRejectedEvent }
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockTestEvent)
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
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(GetOrderAllocationCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(
        mockIncomingOrderPaymentRejectedEvent,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbGetOrderAllocationClient.getOrderAllocation a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent)
      expect(mockDbGetOrderAllocationClient.getOrderAllocation).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderAllocationClient.getOrderAllocation with the expected
        GetOrderAllocationCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent)
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
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(
        mockIncomingOrderPaymentRejectedEvent,
      )
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Allocation DOES exist and it deallocates it
   ************************************************************/
  describe(`Test when the Allocation DOES exist and it deallocates it`, () => {
    /*
     *
     *
     ************************************************************
     * Test when it deallocates the Allocation from the database
     ************************************************************/
    it(`returns the same Failure if
        DeallocateOrderPaymentRejectedCommand.validateAndBuild returns a Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(DeallocateOrderPaymentRejectedCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(
        mockIncomingOrderPaymentRejectedEvent,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbDeallocateOrderPaymentRejectedClient.deallocateOrderStock a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent)
      expect(mockDbDeallocateOrderPaymentRejectedClient.deallocateOrderStock).toHaveBeenCalledTimes(1)
    })

    it(`calls DbDeallocateOrderPaymentRejectedClient.deallocateOrderStock with the
        expected DeallocateOrderPaymentRejectedCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent)
      expect(mockDbDeallocateOrderPaymentRejectedClient.deallocateOrderStock).toHaveBeenCalledWith(
        expectedDeallocateOrderPaymentRejectedCommand,
      )
    })

    it(`returns the same Failure if
        DbDeallocateOrderPaymentRejectedClient.deallocateOrderStock returns a Failure`, async () => {
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(
        mockIncomingOrderPaymentRejectedEvent,
      )
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
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
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(
        mockIncomingOrderPaymentRejectedEvent,
      )
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Allocation DOES NOT exist and it skips the deallocation
   ************************************************************/
  describe(`Test when the Allocation DOES NOT exist and it skips the deallocation`, () => {
    /*
     *
     *
     ************************************************************
     * Test that it skips the deallocation
     ************************************************************/
    it(`does not call DeallocateOrderPaymentRejectedCommand.validateAndBuild`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const spy = jest.spyOn(DeallocateOrderPaymentRejectedCommand, 'validateAndBuild')
      await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent)
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it(`does not call DbDeallocateOrderPaymentRejectedClient.deallocateOrderStock`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent)
      expect(mockDbDeallocateOrderPaymentRejectedClient.deallocateOrderStock).not.toHaveBeenCalled()
    })

    it(`does not return a Failure if
        DbDeallocateOrderPaymentRejectedClient.deallocateOrderStock returns a Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_fails()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(
        mockIncomingOrderPaymentRejectedEvent,
      )
      expect(Result.isFailure(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected Success<void> if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_succeeds()
      const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbDeallocateOrderPaymentRejectedClient,
      )
      const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(
        mockIncomingOrderPaymentRejectedEvent,
      )
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
