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

const mockValidExistingOrderData: OrderData = {
  orderId: 'mockOrderId',
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: 'mockSku',
  units: 2,
  price: 3.98,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: 'mockUpdatedAt',
}

const mockTestIncomingOrderEventProps: IncomingOrderEvent = {
  eventName: OrderEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
  eventData: {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
  },
  createdAt: mockDate,
  updatedAt: mockDate,
}

// COMBAK: Figure a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockIncomingOrderEvent(
  incomingOrderEventProps: IncomingOrderEvent,
): TypeUtilsMutable<IncomingOrderEvent> {
  const mockClass = IncomingOrderEvent.validateAndBuild({
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

//
// Mock Clients
//
function buildMockDbGetOrderClient_succeeds_OrderData(): IDbGetOrderClient {
  const mockResult = Result.makeSuccess(mockValidExistingOrderData)
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
  const mockResult = Result.makeSuccess(mockValidExistingOrderData)
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
  const mockResult = Result.makeSuccess(mockValidExistingOrderData)
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
  //
  // Test IncomingOrderEvent edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
      IncomingOrderEvent is undefined`, async () => {
    const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
    const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
    const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_fails()
    const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_succeeds()
    const syncOrderWorkerService = new SyncOrderWorkerService(
      mockDbGetOrderClient,
      mockDbCreateOrderClient,
      mockDbUpdateOrderClient,
      mockEsRaiseOrderCreatedEventClient,
    )
    const result = await syncOrderWorkerService.syncOrder(undefined)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input 
    IncomingOrderEvent.eventName is undefined`, async () => {
    const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
    const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
    const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_fails()
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
    IncomingOrderEvent.orderData is undefined`, async () => {
    const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
    const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
    const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_fails()
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
      IncomingOrderEvent.orderData.orderId is undefined`, async () => {
    const mockDbGetOrderClient = buildMockDbGetOrderClient_succeeds_OrderData()
    const mockDbCreateOrderClient = buildMockDbCreateOrderClient_succeeds()
    const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_fails()
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

  //
  // Test that it reads the Order from the database
  //
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
    const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
    const result = await syncOrderWorkerService.syncOrder(mockTestEvent)
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
    const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
    await syncOrderWorkerService.syncOrder(mockTestEvent)
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
    const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
    await syncOrderWorkerService.syncOrder(mockTestEvent)
    const expectedGetOrderCommandResult = GetOrderCommand.validateAndBuild({ orderId: 'mockOrderId' })
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
    const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
    const result = await syncOrderWorkerService.syncOrder(mockTestEvent)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(result).toStrictEqual(expectedResult)
  })

  //
  // when IT IS an OrderPlacedEvent and the Order DOES NOT exist
  //
  describe(`when IT IS an OrderPlacedEvent and the Order DOES NOT exist`, () => {
    const mockValidOrderPlacedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
        sku: 'mockSku',
        units: 2,
        price: 3.98,
        userId: 'mockUserId',
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    const mockValidOrderCreatedEventInput: OrderCreatedEventInput = {
      incomingEventName: OrderEventName.ORDER_PLACED_EVENT,
      orderData: mockValidExistingOrderData,
    }

    const expectedOrderCreatedEventResult = OrderCreatedEvent.validateAndBuild(mockValidOrderCreatedEventInput)
    const expectedOrderCreatedEvent = Result.getSuccessValueOrThrow(expectedOrderCreatedEventResult)

    const mockValidCreateOrderCommandInput: CreateOrderCommandInput = {
      incomingOrderEvent: mockValidOrderPlacedEvent,
    }

    const expectedCreateOrderCommandResult = CreateOrderCommand.validateAndBuild(mockValidCreateOrderCommandInput)
    const expectedCreateOrderCommand = Result.getSuccessValueOrThrow(expectedCreateOrderCommandResult)

    it(`returns the same Failure if CreateOrderCommand.validateAndBuild returns a Failure`, async () => {
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent with the expected OrderCreatedEvent`, async () => {
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledWith(expectedOrderCreatedEvent)
    })

    it(`returns the same Failure if EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent returns a Failure`, async () => {
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the expected Success<void> with the expected data`, async () => {
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  //
  // Test when IT IS an OrderPlacedEvent and the Order DOES exist
  //
  describe(`when IT IS an OrderPlacedEvent and the Order DOES exist`, () => {
    const mockValidOrderPlacedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
        sku: 'mockSku',
        units: 2,
        price: 3.98,
        userId: 'mockUserId',
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    const mockValidOrderCreatedEventInput: OrderCreatedEventInput = {
      incomingEventName: OrderEventName.ORDER_PLACED_EVENT,
      orderData: mockValidExistingOrderData,
    }

    const expectedOrderCreatedEventResult = OrderCreatedEvent.validateAndBuild(mockValidOrderCreatedEventInput)
    const expectedOrderCreatedEvent = Result.getSuccessValueOrThrow(expectedOrderCreatedEventResult)

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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledTimes(0)
    })

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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent with the expected OrderCreatedEvent`, async () => {
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledWith(expectedOrderCreatedEvent)
    })

    it(`returns the same Failure if EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent returns a Failure`, async () => {
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the expected Success<void> with the expected data`, async () => {
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  //
  // Test when IT IS NOT a OrderPlacedEvent and the Order DOES exist
  //
  describe(`when IT IS NOT a OrderPlacedEvent and the Order DOES exist`, () => {
    const mockValidOrderStockAllocatedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    const mockValidUpdateOrderCommandInput: UpdateOrderCommandInput = {
      existingOrderData: mockValidExistingOrderData,
      incomingOrderEvent: mockValidOrderStockAllocatedEvent,
    }

    const expectedUpdateOrderCommandResult = UpdateOrderCommand.validateAndBuild(mockValidUpdateOrderCommandInput)
    const expectedUpdateOrderCommand = Result.getSuccessValueOrThrow(expectedUpdateOrderCommandResult)

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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
      expect(result).toStrictEqual(expectedResult)
    })

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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(0)
    })

    it(`returns the expected Success<void> with the expected data`, async () => {
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      const expectedResult = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  //
  // Test when IT IS NOT a OrderPlacedEvent and the Order DOES NOT exist
  //
  describe(`when IT IS NOT a OrderPlacedEvent and the Order DOES NOT exist`, () => {
    const mockValidOrderStockAllocatedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledTimes(0)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(0)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(mockDbUpdateOrderClient.updateOrder).toHaveBeenCalledTimes(0)
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidOperationError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })
})
