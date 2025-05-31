import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { PaymentStatus } from '../../model/PaymentStatus'
import {
  AxSubmitOrderPaymentClientOutput,
  IAxSubmitOrderPaymentClient,
} from '../AxSubmitOrderPaymentClient/AxSubmitOrderPaymentClient'
import { IDbGetOrderPaymentClient } from '../DbGetOrderPaymentClient/DbGetOrderPaymentClient'
import { IDbRecordOrderPaymentClient } from '../DbRecordOrderPaymentClient/DbRecordOrderPaymentClient'
import { IEsRaiseOrderPaymentAcceptedEventClient } from '../EsRaiseOrderPaymentAcceptedEventClient/EsRaiseOrderPaymentAcceptedEventClient'
import { IEsRaiseOrderPaymentRejectedEventClient } from '../EsRaiseOrderPaymentRejectedEventClient/EsRaiseOrderPaymentRejectedEventClient'
import { GetOrderPaymentCommand, GetOrderPaymentCommandInput } from '../model/GetOrderPaymentCommand'
import { IncomingOrderStockAllocatedEvent } from '../model/IncomingOrderStockAllocatedEvent'
import { OrderPaymentAcceptedEvent, OrderPaymentAcceptedEventInput } from '../model/OrderPaymentAcceptedEvent'
import { OrderPaymentRejectedEvent, OrderPaymentRejectedEventInput } from '../model/OrderPaymentRejectedEvent'
import { RecordOrderPaymentCommand, RecordOrderPaymentCommandInput } from '../model/RecordOrderPaymentCommand'
import { SubmitOrderPaymentCommand, SubmitOrderPaymentCommandInput } from '../model/SubmitOrderPaymentCommand'
import { MAX_ALLOWED_PAYMENT_RETRIES, ProcessOrderPaymentWorkerService } from './ProcessOrderPaymentWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate
const mockPaymentId = 'mockPaymentId'

function buildMockIncomingOrderStockAllocatedEvent(): TypeUtilsMutable<IncomingOrderStockAllocatedEvent> {
  const incomingOrderEventProps: IncomingOrderStockAllocatedEvent = {
    eventName: PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT,
    eventData: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
    },
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }

  // COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
  const mockClass = IncomingOrderStockAllocatedEvent.validateAndBuild({
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

const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()

/*
 *
 *
 ************************************************************
 * Mock Clients
 ************************************************************/
function buildMockOrderPaymentData(
  paymentId: string,
  paymentStatus: PaymentStatus,
  paymentRetries: number,
): OrderPaymentData {
  return {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
    paymentId,
    paymentStatus,
    paymentRetries,
  }
}

function buildMockDbGetOrderPaymentClient_succeeds(paymentData: OrderPaymentData): IDbGetOrderPaymentClient {
  return { getOrderPayment: jest.fn().mockResolvedValue(Result.makeSuccess(paymentData)) }
}

function buildMockDbGetOrderPaymentClient_succeeds_nullItem(): IDbGetOrderPaymentClient {
  return { getOrderPayment: jest.fn().mockResolvedValue(Result.makeSuccess(null)) }
}

function buildMockDbGetOrderPaymentClient_fails(
  failureKind?: FailureKind,
  message?: string,
  transient?: boolean,
): IDbGetOrderPaymentClient {
  return {
    getOrderPayment: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', message ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

function buildMockAxSubmitOrderPaymentClient_succeeds(
  paymentOutput?: AxSubmitOrderPaymentClientOutput,
): IAxSubmitOrderPaymentClient {
  const acceptedPaymentOutput: AxSubmitOrderPaymentClientOutput = {
    orderId: mockOrderId,
    paymentId: mockPaymentId,
    paymentStatus: 'PAYMENT_ACCEPTED',
  }

  return {
    submitOrderPayment: jest.fn().mockResolvedValue(Result.makeSuccess(paymentOutput ?? acceptedPaymentOutput)),
  }
}

function buildMockAxSubmitOrderPaymentClient_fails(
  failureKind?: FailureKind,
  message?: string,
  transient?: boolean,
): IAxSubmitOrderPaymentClient {
  return {
    submitOrderPayment: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', message ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

function buildMockDbRecordOrderPaymentClient_succeeds(): IDbRecordOrderPaymentClient {
  return { recordOrderPayment: jest.fn().mockResolvedValue(Result.makeSuccess(undefined)) }
}

function buildMockDbRecordOrderPaymentClient_fails(
  failureKind?: FailureKind,
  message?: string,
  transient?: boolean,
): IDbRecordOrderPaymentClient {
  return {
    recordOrderPayment: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', message ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

function buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds(
  value?: unknown,
): IEsRaiseOrderPaymentAcceptedEventClient {
  return { raiseOrderPaymentAcceptedEvent: jest.fn().mockResolvedValue(Result.makeSuccess(value)) }
}

function buildMockEsRaiseOrderPaymentAcceptedEventClient_fails(
  failureKind?: FailureKind,
  error?: string,
  transient?: boolean,
): IEsRaiseOrderPaymentAcceptedEventClient {
  return {
    raiseOrderPaymentAcceptedEvent: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

function buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds(
  value?: unknown,
): IEsRaiseOrderPaymentRejectedEventClient {
  return { raiseOrderPaymentRejectedEvent: jest.fn().mockResolvedValue(Result.makeSuccess(value)) }
}

function buildMockEsRaiseOrderPaymentRejectedEventClient_fails(
  failureKind?: FailureKind,
  error?: string,
  transient?: boolean,
): IEsRaiseOrderPaymentRejectedEventClient {
  return {
    raiseOrderPaymentRejectedEvent: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

describe(`Payments Service ProcessOrderPaymentWorker ProcessOrderPaymentWorkerService
          tests`, () => {
  // Clear all mocks before each test.
  // There is not a lot of mocking, but some for the Commands
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /*
   *
   *
   ************************************************************
   * Test when it validates the IncomingOrderStockAllocatedEvent
   ************************************************************/
  describe(`Test when it validates the IncomingOrderStockAllocatedEvent`, () => {
    //
    it(`does not return a Failure if the input IncomingOrderEvent is valid`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderEvent is undefined`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockTestEvent = undefined as never
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderEvent is null`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockTestEvent = null as never
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderEvent is not an instance of the class`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockTestEvent = { ...mockIncomingOrderStockAllocatedEvent }
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when it reads the Payment from the database
   ************************************************************/
  describe(`Test when it reads the Payment from the database`, () => {
    it(`returns the same Failure if GetOrderPaymentCommand.validateAndBuild returns a
        Failure`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(GetOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbGetOrderPaymentClient.getOrderPayment a single time`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbGetOrderPaymentClient.getOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderPaymentClient.getOrderPayment with the expected
        GetOrderPaymentCommand`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockGetOrderPaymentCommandInput: GetOrderPaymentCommandInput = { orderId }
      const expectedGetOrderPaymentCommandResult = GetOrderPaymentCommand.validateAndBuild(
        mockGetOrderPaymentCommandInput,
      )
      const expectedGetOrderPaymentCommand = Result.getSuccessValueOrThrow(expectedGetOrderPaymentCommandResult)
      expect(mockDbGetOrderPaymentClient.getOrderPayment).toHaveBeenCalledWith(expectedGetOrderPaymentCommand)
    })

    it(`returns the same Failure if DbGetOrderPaymentClient.getOrderPayment returns a
        Failure`, async () => {
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Payment DOES exist as Failed and when it exceeds the retry limit and it rejects the Payment
   ************************************************************/
  describe(`Test when the Payment DOES exist as Failed and when it exceeds the retry limit
            and it rejects the Payment`, () => {
    // Use the same existing OrderPaymentData for all the tests in this scenario
    const mockExistingOrderPaymentData: OrderPaymentData = {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
      paymentId: 'mockPaymentFailedId',
      paymentStatus: 'PAYMENT_FAILED',
      paymentRetries: MAX_ALLOWED_PAYMENT_RETRIES,
    }

    // TODO: Add tests for when the Payment already exists as Accepted or Rejected
    // It will be much easier once we migrate to a single EventStore client.

    it(`does not call AxSubmitOrderPaymentClient.submitOrderPayment when it exceeds the
        retry limit and it rejects the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockAxSubmitOrderPaymentClient.submitOrderPayment).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test when it updates the Payment in the database
     ************************************************************/
    it(`returns the same Failure if RecordOrderPaymentCommand.validateAndBuild returns a
        Failure when it exceeds the retry limit and it rejects the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(RecordOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment a single time when it
        exceeds the retry limit and it rejects the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment with the expected
        RecordOrderPaymentCommand when it exceeds the retry limit and it rejects the
        Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { eventData } = mockIncomingOrderStockAllocatedEvent
      const mockRecordOrderPaymentCommandInput: RecordOrderPaymentCommandInput = {
        existingOrderPaymentData: mockExistingOrderPaymentData,
        newOrderPaymentFields: {
          orderId: eventData.orderId,
          sku: eventData.sku,
          units: eventData.units,
          price: eventData.price,
          userId: eventData.userId,
          paymentId: mockExistingOrderPaymentData.paymentId,
          paymentStatus: 'PAYMENT_REJECTED',
        },
      }
      const expectedRecordOrderPaymentCommandResult = RecordOrderPaymentCommand.validateAndBuild(
        mockRecordOrderPaymentCommandInput,
      )
      const expectedRecordOrderPaymentCommand = Result.getSuccessValueOrThrow(expectedRecordOrderPaymentCommandResult)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledWith(expectedRecordOrderPaymentCommand)
    })

    it(`returns the same Failure if DbRecordOrderPaymentClient.recordOrderPayment
        returns a Failure not accounted for when it exceeds the retry limit and it
        rejects the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Payment Rejected event
     ************************************************************/
    it(`returns the same Failure if OrderPaymentRejectedEvent.validateAndBuild returns a
        Failure when it exceeds the retry limit and it rejects the Payment`, async () => {
      const mockExistingOrderPaymentData = buildMockOrderPaymentData(
        undefined,
        'PAYMENT_FAILED',
        MAX_ALLOWED_PAYMENT_RETRIES,
      )
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(OrderPaymentRejectedEvent, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent a
        single time when it exceeds the retry limit and it rejects the Payment`, async () => {
      const mockExistingOrderPaymentData = buildMockOrderPaymentData(
        undefined,
        'PAYMENT_FAILED',
        MAX_ALLOWED_PAYMENT_RETRIES,
      )
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent the
        expected OrderPaymentRejectedEvent when it exceeds the retry limit and it
        rejects the Payment`, async () => {
      const mockExistingOrderPaymentData = buildMockOrderPaymentData(
        undefined,
        'PAYMENT_FAILED',
        MAX_ALLOWED_PAYMENT_RETRIES,
      )
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockOrderPaymentRejectedEventInput: OrderPaymentRejectedEventInput = {
        orderId,
        sku,
        units,
        price,
        userId,
      }
      const expectedOrderPaymentRejectedEventResult = OrderPaymentRejectedEvent.validateAndBuild(
        mockOrderPaymentRejectedEventInput,
      )
      const expectedOrderPaymentRejectedEvent = Result.getSuccessValueOrThrow(expectedOrderPaymentRejectedEventResult)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledWith(
        expectedOrderPaymentRejectedEvent,
      )
    })

    it(`returns the same Failure if
        EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent returns a
        Failure when it exceeds the retry limit and it rejects the Payment`, async () => {
      const mockExistingOrderPaymentData = buildMockOrderPaymentData(
        undefined,
        'PAYMENT_FAILED',
        MAX_ALLOWED_PAYMENT_RETRIES,
      )
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
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
    it(`returns the expected Success<void> if the execution path is successful when it
        exceeds the retry limit and it rejects the Payment`, async () => {
      const mockExistingOrderPaymentData = buildMockOrderPaymentData(
        undefined,
        'PAYMENT_FAILED',
        MAX_ALLOWED_PAYMENT_RETRIES,
      )
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeSuccess(undefined)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Payment DOES NOT exist or DOES exist as Failed and it submits the Payment
   ************************************************************/
  describe.each([
    {
      paymentState: 'DOES NOT exist',
      mockExistingOrderPaymentData: null,
    },
    {
      paymentState: 'DOES exist as Failed',
      mockExistingOrderPaymentData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
        createdAt: mockCreatedAt,
        updatedAt: mockUpdatedAt,
        paymentId: undefined,
        paymentStatus: 'PAYMENT_FAILED',
        paymentRetries: 0,
      } satisfies OrderPaymentData,
    },
  ])(`Test when the Payment $paymentState and it submits the Payment`, ({ mockExistingOrderPaymentData }) => {
    /*
     *
     *
     ************************************************************
     * Test when it submits the Payment
     ************************************************************/
    it(`returns the same Failure if SubmitOrderPaymentCommand.validateAndBuild returns a
        Failure when it submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(SubmitOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls AxSubmitOrderPaymentClient.submitOrderPayment a single time when it
        submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockAxSubmitOrderPaymentClient.submitOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls AxSubmitOrderPaymentClient.submitOrderPayment with the expected
        RecordOrderPaymentCommand when it submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds_nullItem()
      const submitOrderPaymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient =
        buildMockAxSubmitOrderPaymentClient_succeeds(submitOrderPaymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockSubmitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput = {
        orderId,
        sku,
        units,
        price,
        userId,
        existingPaymentStatus: mockExistingOrderPaymentData?.paymentStatus,
      }
      const expectedSubmitOrderPaymentCommandResult = SubmitOrderPaymentCommand.validateAndBuild(
        mockSubmitOrderPaymentCommandInput,
      )
      const expectedSubmitOrderPaymentCommand = Result.getSuccessValueOrThrow(expectedSubmitOrderPaymentCommandResult)
      expect(mockAxSubmitOrderPaymentClient.submitOrderPayment).toHaveBeenCalledWith(expectedSubmitOrderPaymentCommand)
    })

    it(`returns the same Failure if AxSubmitOrderPaymentClient.submitOrderPayment
        returns a Failure not accounted for when it submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test when it updates the Payment in the database
     ************************************************************/
    it(`returns the same Failure if RecordOrderPaymentCommand.validateAndBuild returns a
        Failure when it submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(RecordOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment a single time when it
        submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment with the expected
        RecordOrderPaymentCommand when it submits the Payment and the new Payment is
        Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockRecordOrderPaymentCommandInput: RecordOrderPaymentCommandInput = {
        existingOrderPaymentData: mockExistingOrderPaymentData ?? undefined,
        newOrderPaymentFields: {
          orderId,
          sku,
          units,
          price,
          userId,
          paymentId: mockPaymentId,
          paymentStatus: 'PAYMENT_ACCEPTED',
        },
      }
      const expectedRecordOrderPaymentCommandResult = RecordOrderPaymentCommand.validateAndBuild(
        mockRecordOrderPaymentCommandInput,
      )
      const expectedRecordOrderPaymentCommand = Result.getSuccessValueOrThrow(expectedRecordOrderPaymentCommandResult)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledWith(expectedRecordOrderPaymentCommand)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment a single time when it
        submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment with the expected
        RecordOrderPaymentCommand when it submits the Payment and the new Payment is
        Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockRecordOrderPaymentCommandInput: RecordOrderPaymentCommandInput = {
        existingOrderPaymentData: mockExistingOrderPaymentData ?? undefined,
        newOrderPaymentFields: {
          orderId,
          sku,
          units,
          price,
          userId,
          paymentId: mockPaymentId,
          paymentStatus: 'PAYMENT_REJECTED',
        },
      }
      const expectedRecordOrderPaymentCommandResult = RecordOrderPaymentCommand.validateAndBuild(
        mockRecordOrderPaymentCommandInput,
      )
      const expectedRecordOrderPaymentCommand = Result.getSuccessValueOrThrow(expectedRecordOrderPaymentCommandResult)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledWith(expectedRecordOrderPaymentCommand)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment a single time when it
        submits the Payment and the new Payment is Failed`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockFailureKind: FailureKind = 'PaymentFailedError'
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment with the expected
        RecordOrderPaymentCommand when it submits the Payment and the new Payment is
        Failed`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockFailureKind: FailureKind = 'PaymentFailedError'
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockRecordOrderPaymentCommandInput: RecordOrderPaymentCommandInput = {
        existingOrderPaymentData: mockExistingOrderPaymentData ?? undefined,
        newOrderPaymentFields: {
          orderId,
          sku,
          units,
          price,
          userId,
          paymentId: mockPaymentId,
          paymentStatus: 'PAYMENT_FAILED',
        },
      }
      const expectedRecordOrderPaymentCommandResult = RecordOrderPaymentCommand.validateAndBuild(
        mockRecordOrderPaymentCommandInput,
      )
      const expectedRecordOrderPaymentCommand = Result.getSuccessValueOrThrow(expectedRecordOrderPaymentCommandResult)
      expectedRecordOrderPaymentCommand.commandData.paymentId = expect.any(String)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledWith(expectedRecordOrderPaymentCommand)
    })

    it(`returns the same Failure if DbRecordOrderPaymentClient.recordOrderPayment
        returns a Failure not accounted for when it submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Accepted event
     ************************************************************/
    it(`returns the same Failure if the OrderPaymentAcceptedEvent.validateAndBuild
        returns a Failure when it submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(OrderPaymentAcceptedEvent, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent a
        single time when it submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent with
        the expected OrderPaymentAcceptedEvent when it submits the Payment and the new
        Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockOrderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput = {
        orderId,
        sku,
        units,
        price,
        userId,
      }
      const expectedOrderPaymentAcceptedEventResult = OrderPaymentAcceptedEvent.validateAndBuild(
        mockOrderPaymentAcceptedEventInput,
      )
      const expectedOrderPaymentAcceptedEvent = Result.getSuccessValueOrThrow(expectedOrderPaymentAcceptedEventResult)
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).toHaveBeenCalledWith(
        expectedOrderPaymentAcceptedEvent,
      )
    })

    it(`returns the same Failure if
        EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent returns a
        Failure when it submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`does not call
        EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent when it
        submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Rejected event
     ************************************************************/
    it(`returns the same Failure if the OrderPaymentRejectedEvent.validateAndBuild
        returns a Failure when it submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(OrderPaymentRejectedEvent, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent a
        single time when it submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent with
        the expected OrderPaymentRejectedEvent when it submits the Payment and the new
        Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockOrderPaymentRejectedEventInput: OrderPaymentRejectedEventInput = { orderId, sku, units, price, userId }
      const expectedOrderPaymentRejectedEventResult = OrderPaymentRejectedEvent.validateAndBuild(
        mockOrderPaymentRejectedEventInput,
      )
      const expectedOrderPaymentRejectedEvent = Result.getSuccessValueOrThrow(expectedOrderPaymentRejectedEventResult)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledWith(
        expectedOrderPaymentRejectedEvent,
      )
    })

    it(`returns the same Failure if
        EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent returns a
        Failure when it submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`does not call
        EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent when it
        submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected Success<void> if the execution path is successful when it
        submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the expected Success<void> if the execution path is successful when it
        submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the expected Failure of kind PaymentFailedError if the execution path is
        successful when it submits the Payment and the new Payment is Failed`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockFailureKind: FailureKind = 'PaymentFailedError'
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Payment DOES exist as Accepted and it DOES NOT submit the Payment
   ************************************************************/
  describe(`Test when the Payment DOES exist as Accepted and it DOES NOT submit the Payment`, () => {
    // Use the same existing OrderPaymentData for all the tests in this scenario
    const mockExistingOrderPaymentData: OrderPaymentData = {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
      paymentId: mockPaymentId,
      paymentStatus: 'PAYMENT_ACCEPTED',
      paymentRetries: 1,
    }

    it(`does not call AxSubmitOrderPaymentClient.submitOrderPayment when the existing
        Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockAxSubmitOrderPaymentClient.submitOrderPayment).not.toHaveBeenCalled()
    })

    it(`does not call DbRecordOrderPaymentClient.recordOrderPayment when the existing
        Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).not.toHaveBeenCalled()
    })

    it(`calls EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent a
        single time when the existing Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent with
        the expected OrderPaymentAcceptedEvent when the existing Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockOrderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput = { orderId, sku, units, price, userId }
      const expectedOrderPaymentAcceptedEventResult = OrderPaymentAcceptedEvent.validateAndBuild(
        mockOrderPaymentAcceptedEventInput,
      )
      const expectedOrderPaymentAcceptedEvent = Result.getSuccessValueOrThrow(expectedOrderPaymentAcceptedEventResult)
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).toHaveBeenCalledWith(
        expectedOrderPaymentAcceptedEvent,
      )
    })

    it(`returns the same Failure if
        EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent returns a
        Failure when the existing Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`does not call
        EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent when the
        existing Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected Success<void> if the execution path is successful when the
        existing Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the expected Success<void> if the execution path is successful when the
        existing Payment is Accepted and there is a race condition that reached
        DbRecordOrderPaymentClient.recordOrderPayment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockFailureKind: FailureKind = 'PaymentAlreadyAcceptedError'
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      jest.spyOn(SubmitOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce(
        Result.makeSuccess({
          commandData: {
            orderId: mockOrderId,
            sku: mockSku,
            units: mockUnits,
            price: mockPrice,
            userId: mockUserId,
          },
          options: {},
        }),
      )
      jest.spyOn(RecordOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce(
        Result.makeSuccess({
          commandData: {
            orderId: mockOrderId,
            sku: mockSku,
            units: mockUnits,
            price: mockPrice,
            userId: mockUserId,
            createdAt: mockCreatedAt,
            updatedAt: mockUpdatedAt,
            paymentId: mockPaymentId,
            paymentStatus: 'PAYMENT_ACCEPTED',
            paymentRetries: 1,
          },
          options: {},
        }),
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeSuccess(undefined)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Payment DOES exist as Rejected and it DOES NOT submit the Payment
   ************************************************************/
  describe(`Test when the Payment DOES exist as Rejected and it DOES NOT submit the Payment`, () => {
    // Use the same existing OrderPaymentData for all the tests in this scenario
    const mockExistingOrderPaymentData: OrderPaymentData = {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
      paymentId: mockPaymentId,
      paymentStatus: 'PAYMENT_REJECTED',
      paymentRetries: 1,
    }

    it(`does not call AxSubmitOrderPaymentClient.submitOrderPayment when the existing
        Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockAxSubmitOrderPaymentClient.submitOrderPayment).not.toHaveBeenCalled()
    })

    it(`does not call DbRecordOrderPaymentClient.recordOrderPayment when the existing
        Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).not.toHaveBeenCalled()
    })

    it(`does not call
        EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent when the
        existing Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).not.toHaveBeenCalled()
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent a
        single time when the existing Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent with
        the expected OrderPaymentRejectedEvent when the existing Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockOrderPaymentRejectedEventInput: OrderPaymentRejectedEventInput = { orderId, sku, units, price, userId }
      const expectedOrderPaymentRejectedEventResult = OrderPaymentRejectedEvent.validateAndBuild(
        mockOrderPaymentRejectedEventInput,
      )
      const expectedOrderPaymentRejectedEvent = Result.getSuccessValueOrThrow(expectedOrderPaymentRejectedEventResult)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledWith(
        expectedOrderPaymentRejectedEvent,
      )
    })

    it(`returns the same Failure if
        EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent returns a
        Failure when the existing Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
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
    it(`returns the expected Success<void> if the execution path is successful when the
        existing Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_succeeds()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the expected Success<void> if the execution path is successful when the
        existing Payment is Rejected and there is a race condition that reached
        DbRecordOrderPaymentClient.recordOrderPayment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_succeeds(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_succeeds()
      const mockFailureKind: FailureKind = 'PaymentAlreadyRejectedError'
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_succeeds()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_succeeds()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      jest.spyOn(SubmitOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce(
        Result.makeSuccess({
          commandData: {
            orderId: mockOrderId,
            sku: mockSku,
            units: mockUnits,
            price: mockPrice,
            userId: mockUserId,
          },
          options: {},
        }),
      )
      jest.spyOn(RecordOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce(
        Result.makeSuccess({
          commandData: {
            orderId: mockOrderId,
            sku: mockSku,
            units: mockUnits,
            price: mockPrice,
            userId: mockUserId,
            createdAt: mockCreatedAt,
            updatedAt: mockUpdatedAt,
            paymentId: mockPaymentId,
            paymentStatus: 'PAYMENT_REJECTED',
            paymentRetries: 1,
          },
          options: {},
        }),
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const expectedResult = Result.makeSuccess(undefined)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
