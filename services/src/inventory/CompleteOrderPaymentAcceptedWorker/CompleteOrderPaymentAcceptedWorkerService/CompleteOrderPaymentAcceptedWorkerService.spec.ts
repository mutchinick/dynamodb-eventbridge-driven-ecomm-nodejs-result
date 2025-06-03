import { marshall } from '@aws-sdk/util-dynamodb'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbCompleteOrderPaymentAcceptedClient } from '../DbCompleteOrderPaymentAcceptedClient/DbCompleteOrderPaymentAcceptedClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import { CompleteOrderPaymentAcceptedCommand } from '../model/CompleteOrderPaymentAcceptedCommand'
import { GetOrderAllocationCommand } from '../model/GetOrderAllocationCommand'
import { IncomingOrderPaymentAcceptedEvent } from '../model/IncomingOrderPaymentAcceptedEvent'
import { CompleteOrderPaymentAcceptedWorkerService } from './CompleteOrderPaymentAcceptedWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

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

function buildMockIncomingOrderPaymentAcceptedEvent(): IncomingOrderPaymentAcceptedEvent {
  const incomingOrderEventProps: IncomingOrderPaymentAcceptedEvent = {
    eventName: InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
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
  const mockClass = IncomingOrderPaymentAcceptedEvent.validateAndBuild({
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

const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()

function buildExpectedCompleteOrderPaymentAcceptedCommand(): CompleteOrderPaymentAcceptedCommand {
  const mockClass = CompleteOrderPaymentAcceptedCommand.validateAndBuild({
    existingOrderAllocationData: mockExistingOrderAllocationData,
    incomingOrderPaymentAcceptedEvent: mockIncomingOrderPaymentAcceptedEvent,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedCompleteOrderPaymentAcceptedCommand = buildExpectedCompleteOrderPaymentAcceptedCommand()

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

function buildMockDbCompleteOrderPaymentAcceptedClient_succeeds(): IDbCompleteOrderPaymentAcceptedClient {
  return { completeOrder: jest.fn().mockResolvedValue(Result.makeSuccess(undefined)) }
}

function buildMockDbCompleteOrderPaymentAcceptedClient_fails(
  failureKind?: FailureKind,
  message?: string,
  transient?: boolean,
): IDbCompleteOrderPaymentAcceptedClient {
  return {
    completeOrder: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', message ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

describe(`Inventory Service CompleteOrderPaymentAcceptedWorker
          CompleteOrderPaymentAcceptedWorkerService tests`, () => {
  // Clear all mocks before each test.
  // There is not a lot of mocking, but some for the Commands
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent edge cases
   ************************************************************/
  describe(`Test IncomingOrderPaymentAcceptedEvent edge cases`, () => {
    it(`does not return a Failure if the input IncomingOrderPaymentAcceptedEvent is
        valid`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(
        mockIncomingOrderPaymentAcceptedEvent,
      )
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderPaymentAcceptedEvent is undefined`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const mockTestEvent = undefined as never
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderPaymentAcceptedEvent is null`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const mockTestEvent = null as never
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderPaymentAcceptedEvent is not an instance of the class`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const mockTestEvent = { ...mockIncomingOrderPaymentAcceptedEvent }
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(mockTestEvent)
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
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(GetOrderAllocationCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(
        mockIncomingOrderPaymentAcceptedEvent,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbGetOrderAllocationClient.getOrderAllocation a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(mockDbGetOrderAllocationClient.getOrderAllocation).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderAllocationClient.getOrderAllocation with the expected
        GetOrderAllocationCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
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
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(
        mockIncomingOrderPaymentAcceptedEvent,
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
   * Test when the Allocation DOES exist and it completes it
   ************************************************************/
  describe(`Test when the Allocation DOES exist and it completes it`, () => {
    /*
     *
     *
     ************************************************************
     * Test when it completes the Allocation from the database
     ************************************************************/
    it(`returns the same Failure if CompleteOrderPaymentAcceptedCommand.validateAndBuild
        returns a Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(CompleteOrderPaymentAcceptedCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(
        mockIncomingOrderPaymentAcceptedEvent,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbCompleteOrderPaymentAcceptedClient.completeOrder a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(mockDbCompleteOrderPaymentAcceptedClient.completeOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbCompleteOrderPaymentAcceptedClient.completeOrder with the expected
        CompleteOrderPaymentAcceptedCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(mockDbCompleteOrderPaymentAcceptedClient.completeOrder).toHaveBeenCalledWith(
        expectedCompleteOrderPaymentAcceptedCommand,
      )
    })

    it(`returns the same Failure if DbCompleteOrderPaymentAcceptedClient.completeOrder
        returns a Failure`, async () => {
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(
        mockIncomingOrderPaymentAcceptedEvent,
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
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(
        mockIncomingOrderPaymentAcceptedEvent,
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
   * Test when the Allocation DOES NOT exist and it skips the completion
   ************************************************************/
  describe(`Test when the Allocation DOES NOT exist and it skips the completion`, () => {
    /*
     *
     *
     ************************************************************
     * Test that it skips the completion
     ************************************************************/
    it(`does not call CompleteOrderPaymentAcceptedCommand.validateAndBuild`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const spy = jest.spyOn(CompleteOrderPaymentAcceptedCommand, 'validateAndBuild')
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it(`does not call DbCompleteOrderPaymentAcceptedClient.completeOrder`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(mockDbCompleteOrderPaymentAcceptedClient.completeOrder).not.toHaveBeenCalled()
    })

    it(`does not return a Failure if DbCompleteOrderPaymentAcceptedClient.completeOrder
        returns a Failure`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_succeeds_nullItem()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_fails()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(
        mockIncomingOrderPaymentAcceptedEvent,
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
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_succeeds()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(
        mockIncomingOrderPaymentAcceptedEvent,
      )
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
