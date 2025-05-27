import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { IDbCreateOrderClient } from '../DbCreateOrderClient/DbCreateOrderClient'
import { IDbGetOrderClient } from '../DbGetOrderClient/DbGetOrderClient'
import { IDbUpdateOrderClient } from '../DbUpdateOrderClient/DbUpdateOrderClient'
import { IEsRaiseOrderCreatedEventClient } from '../EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { CreateOrderCommand, CreateOrderCommandInput } from '../model/CreateOrderCommand'
import { GetOrderCommand } from '../model/GetOrderCommand'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { OrderCreatedEvent, OrderCreatedEventInput } from '../model/OrderCreatedEvent'
import { UpdateOrderCommand, UpdateOrderCommandInput } from '../model/UpdateOrderCommand'
import { SyncOrderWorkerService } from './SyncOrderWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 3.98
const mockUserId = 'mockUserId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate

const mockOrderData: OrderData = {
  orderId: mockOrderId,
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: mockSku,
  units: mockUnits,
  price: mockPrice,
  userId: mockUserId,
  createdAt: mockCreatedAt,
  updatedAt: mockUpdatedAt,
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
function buildMockIncomingOrderEvent(
  incomingOrderEventProps: IncomingOrderEvent,
): TypeUtilsMutable<IncomingOrderEvent> {
  const mockClass = IncomingOrderEvent.validateAndBuild({
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

/*
 *
 *
 ************************************************************
 * Mock Clients
 ************************************************************/
function buildMockDbGetOrderClient_succeeds_OrderData(): IDbGetOrderClient {
  const mockResult = Result.makeSuccess(mockOrderData)
  return { getOrder: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockDbGetOrderClient_succeeds_null(): IDbGetOrderClient {
  const mockResult = Result.makeSuccess(null)
  return { getOrder: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockDbGetOrderClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IDbGetOrderClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? true,
  )
  return { getOrder: jest.fn().mockResolvedValue(mockFailure) }
}

function buildMockDbCreateOrderClient_succeeds(): IDbCreateOrderClient {
  const mockResult = Result.makeSuccess(mockOrderData)
  return { createOrder: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockDbCreateOrderClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IDbCreateOrderClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? true,
  )
  return { createOrder: jest.fn().mockResolvedValue(mockFailure) }
}

function buildMockEsRaiseOrderCreatedEventClient_succeeds(): IEsRaiseOrderCreatedEventClient {
  const mockResult = Result.makeSuccess()
  return { raiseOrderCreatedEvent: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockEsRaiseOrderCreatedEventClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IEsRaiseOrderCreatedEventClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? true,
  )
  return { raiseOrderCreatedEvent: jest.fn().mockResolvedValue(mockFailure) }
}

function buildMockDbUpdateOrderClient_succeeds(): IDbUpdateOrderClient {
  const mockResult = Result.makeSuccess(mockOrderData)
  return { updateOrder: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockDbUpdateOrderClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IDbUpdateOrderClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? true,
  )
  return { updateOrder: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Orders Service SyncOrderWorker SyncOrderWorkerService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test when it validates the IncomingOrderEvent
   ************************************************************/
  describe(`Test when it validates the IncomingOrderEvent`, () => {
    const mockTestIncomingOrderEventProps: IncomingOrderEvent = {
      // The cancellation event is applicable to any order status, so it's safe for testing
      eventName: OrderEventName.ORDER_CANCELED_EVENT,
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

    it(`does not return a Failure if the input IncomingOrderEvent is valid`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
      const result = await syncOrderWorkerService.syncOrder(mockTestEvent)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderEvent is undefined`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = undefined as never
      const result = await syncOrderWorkerService.syncOrder(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderEvent is null`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = null as never
      const result = await syncOrderWorkerService.syncOrder(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderEvent.eventName is undefined`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
      mockTestEvent.eventName = undefined
      const result = await syncOrderWorkerService.syncOrder(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderEvent.eventData is undefined`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
      mockTestEvent.eventData = undefined
      const result = await syncOrderWorkerService.syncOrder(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderEvent.eventData.orderId is undefined`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
      mockTestEvent.eventData.orderId = undefined
      const result = await syncOrderWorkerService.syncOrder(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        IncomingOrderEvent is not an instance of the class`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
      const mockTestEvent = { ...mockEvent }
      const result = await syncOrderWorkerService.syncOrder(mockTestEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when IT IS an OrderPlacedEvent and the Order DOES NOT exist
   ************************************************************/
  describe(`Test when IT IS an OrderPlacedEvent and the Order DOES NOT exist`, () => {
    const mockOrderPlacedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    /*
     *
     *
     ************************************************************
     * Test that it reads the Order from the database
     ************************************************************/
    it(`returns the same Failure if GetOrderCommand.validateAndBuild returns a Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(GetOrderCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbGetOrderClient.getOrder a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderClient.getOrder with the expected GetOrderCommand`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const expectedGetOrderCommandResult = GetOrderCommand.validateAndBuild({ orderId: mockOrderId })
      const expectedGetOrderCommand = Result.getSuccessValueOrThrow(expectedGetOrderCommandResult)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it(`returns the same Failure if DbGetOrderClient.getOrder returns a Failure`, async () => {
      const mockFailureKind = 'mockFailure' as never
      const mockError = 'mockFailure' as never
      const mockTransient = 'mockFailure' as never
      const mockDbGetOrderClient = buildMockDbGetOrderClient_fails(mockFailureKind, mockError, mockTransient)
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test that it creates the Order in the database
     ************************************************************/
    it(`returns the same Failure if CreateOrderCommand.validateAndBuild returns a
        Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(CreateOrderCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbCreateOrderClient.createOrder a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbCreateOrderClient.createOrder with the expected CreateOrderCommand`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const mockCreateOrderCommandInput: CreateOrderCommandInput = {
        incomingOrderEvent: mockOrderPlacedEvent,
      }
      const expectedCreateOrderCommandResult = CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
      const expectedCreateOrderCommand = Result.getSuccessValueOrThrow(expectedCreateOrderCommandResult)
      expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledWith(expectedCreateOrderCommand)
    })

    it(`returns the same Failure if DbCreateOrderClient.createOrder returns a Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockFailureKind = 'mockFailure' as never
      const mockError = 'mockFailure' as never
      const mockTransient = 'mockFailure' as never
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_fails(mockFailureKind, mockError, mockTransient)
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test that it raises the Order Created Event
     ************************************************************/
    it(`returns the same Failure if OrderCreatedEvent.validateAndBuild returns a Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(OrderCreatedEvent, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent with the expected
        OrderCreatedEvent`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const mockOrderCreatedEventInput: OrderCreatedEventInput = {
        orderId: mockOrderData.orderId,
        sku: mockOrderData.sku,
        units: mockOrderData.units,
        price: mockOrderData.price,
        userId: mockOrderData.userId,
      }
      const expectedOrderCreatedEventResult = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
      const expectedOrderCreatedEvent = Result.getSuccessValueOrThrow(expectedOrderCreatedEventResult)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledWith(expectedOrderCreatedEvent)
    })

    it(`returns the same Failure if
        EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent returns a Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockFailureKind = 'mockFailure' as never
      const mockError = 'mockFailure' as never
      const mockTransient = 'mockFailure' as never
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test that it DOES NOT update the Order in the database
     ************************************************************/
    it(`does not call mockDbUpdateOrderClient.updateOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbUpdateOrderClient.updateOrder).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when IT IS an OrderPlacedEvent and the Order DOES exist
   ************************************************************/
  describe(`Test when IT IS an OrderPlacedEvent and the Order DOES exist`, () => {
    const mockOrderPlacedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    /*
     *
     *
     ************************************************************
     * Test that it reads the Order from the database
     ************************************************************/
    it(`returns the same Failure if GetOrderCommand.validateAndBuild returns a Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(GetOrderCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbGetOrderClient.getOrder a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderClient.getOrder with the expected GetOrderCommand`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const expectedGetOrderCommandResult = GetOrderCommand.validateAndBuild({ orderId: mockOrderId })
      const expectedGetOrderCommand = Result.getSuccessValueOrThrow(expectedGetOrderCommandResult)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it(`returns the same Failure if DbGetOrderClient.getOrder returns a Failure`, async () => {
      const mockFailureKind = 'mockFailure' as never
      const mockError = 'mockFailure' as never
      const mockTransient = 'mockFailure' as never
      const mockDbGetOrderClient = buildMockDbGetOrderClient_fails(mockFailureKind, mockError, mockTransient)
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test that it raises the Order Created Event
     ************************************************************/
    it(`returns the same Failure if OrderCreatedEvent.validateAndBuild returns a Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(OrderCreatedEvent, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent with the expected
        OrderCreatedEvent`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const mockOrderCreatedEventInput: OrderCreatedEventInput = {
        orderId: mockOrderData.orderId,
        sku: mockOrderData.sku,
        units: mockOrderData.units,
        price: mockOrderData.price,
        userId: mockOrderData.userId,
      }
      const expectedOrderCreatedEventResult = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
      const expectedOrderCreatedEvent = Result.getSuccessValueOrThrow(expectedOrderCreatedEventResult)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledWith(expectedOrderCreatedEvent)
    })

    it(`returns the same Failure if
        EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent returns a Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockFailureKind = 'mockFailure' as never
      const mockError = 'mockFailure' as never
      const mockTransient = 'mockFailure' as never
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_fails(
        mockFailureKind,
        mockError,
        mockTransient,
      )
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test that it DOES NOT create the Order in the database
     ************************************************************/
    it(`does not call DbCreateOrderClient.createOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbCreateOrderClient.createOrder).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test that it DOES NOT update the Order in the database
     ************************************************************/
    it(`does not call mockDbUpdateOrderClient.updateOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbUpdateOrderClient.updateOrder).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when IT IS NOT a OrderPlacedEvent and the Order DOES exist
   ************************************************************/
  describe(`Test when IT IS NOT a OrderPlacedEvent and the Order DOES exist`, () => {
    const mockOrderStockAllocatedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    /*
     *
     *
     ************************************************************
     * Test that it reads the Order from the database
     ************************************************************/
    it(`returns the same Failure if GetOrderCommand.validateAndBuild returns a Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(GetOrderCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbGetOrderClient.getOrder a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderClient.getOrder with the expected GetOrderCommand`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      const expectedGetOrderCommandResult = GetOrderCommand.validateAndBuild({ orderId: mockOrderId })
      const expectedGetOrderCommand = Result.getSuccessValueOrThrow(expectedGetOrderCommandResult)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it(`returns the same Failure if DbGetOrderClient.getOrder returns a Failure`, async () => {
      const mockFailureKind = 'mockFailure' as never
      const mockError = 'mockFailure' as never
      const mockTransient = 'mockFailure' as never
      const mockDbGetOrderClient = buildMockDbGetOrderClient_fails(mockFailureKind, mockError, mockTransient)
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test that it updates the Order in the database
     ************************************************************/
    it(`returns the same Failure if UpdateOrderCommand.validateAndBuild returns a
        Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockFailureKind = 'mockFailureKind' as never
      const mockError = 'mockError'
      const mockTransient = 'mockTransient' as never
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      jest.spyOn(UpdateOrderCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
      const result = await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`calls DbUpdateOrderClient.updateOrder a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockDbUpdateOrderClient.updateOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbUpdateOrderClient.updateOrder with the expected UpdateOrderCommand`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      const mockUpdateOrderCommandInput: UpdateOrderCommandInput = {
        existingOrderData: mockOrderData,
        incomingOrderEvent: mockOrderStockAllocatedEvent,
      }
      const expectedUpdateOrderCommandResult = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
      const expectedUpdateOrderCommand = Result.getSuccessValueOrThrow(expectedUpdateOrderCommandResult)
      expect(mockDbUpdateOrderClient.updateOrder).toHaveBeenCalledWith(expectedUpdateOrderCommand)
    })

    it(`returns the same Failure if DbUpdateOrderClient.updateOrder returns a Failure`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockFailureKind = 'mockFailure' as never
      const mockError = 'mockFailure' as never
      const mockTransient = 'mockFailure' as never
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_fails(mockFailureKind, mockError, mockTransient)
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

    /*
     *
     *
     ************************************************************
     * Test that it DOES NOT create the Order in the database
     ************************************************************/
    it(`does not call DbCreateOrderClient.createOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockDbCreateOrderClient.createOrder).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test that it DOES NOT raise the Order Created Event
     ************************************************************/
    it(`does not call EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when IT IS NOT a OrderPlacedEvent and the Order DOES NOT exist
   ************************************************************/
  describe(`Test when IT IS NOT a OrderPlacedEvent and the Order DOES NOT exist`, () => {
    const mockOrderStockAllocatedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    it(`does not call DbUpdateOrderClient.createOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockDbCreateOrderClient.createOrder).not.toHaveBeenCalled()
    })

    it(`does not call EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).not.toHaveBeenCalled()
    })

    it(`does not call DbUpdateOrderClient.updateOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockDbUpdateOrderClient.updateOrder).not.toHaveBeenCalled()
    })

    it(`returns a non-transient Failure of kind InvalidOperationError`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_succeeds()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidOperationError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })
})
