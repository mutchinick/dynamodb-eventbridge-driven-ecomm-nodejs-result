import { marshall } from '@aws-sdk/util-dynamodb'
import { AttributeValue, EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { IDeallocateOrderPaymentRejectedWorkerService } from '../DeallocateOrderPaymentRejectedWorkerService/DeallocateOrderPaymentRejectedWorkerService'
import { IncomingOrderPaymentRejectedEvent } from '../model/IncomingOrderPaymentRejectedEvent'
import { DeallocateOrderPaymentRejectedWorkerController } from './DeallocateOrderPaymentRejectedWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingOrderPaymentRejectedEvent(id: string): TypeUtilsMutable<IncomingOrderPaymentRejectedEvent> {
  const incomingOrderPaymentRejectedEvent: TypeUtilsMutable<IncomingOrderPaymentRejectedEvent> = {
    eventName: InventoryEventName.ORDER_PAYMENT_REJECTED_EVENT,
    eventData: {
      orderId: `mockOrderId-${id}`,
      sku: `mockSku-${id}`,
      units: 2,
      price: 10.33,
      userId: `mockUserId-${id}`,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingOrderPaymentRejectedEvent
}

function buildMockIncomingOrderPaymentRejectedEvents(
  ids: string[],
): TypeUtilsMutable<IncomingOrderPaymentRejectedEvent>[] {
  return ids.map((id) => buildMockIncomingOrderPaymentRejectedEvent(id))
}

type MockEventDetail = {
  awsRegion: string
  eventID: string
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventVersion: string
  dynamodb: {
    NewImage: AttributeValue | Record<string, AttributeValue>
  }
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockEventBrideEvent(
  id: string,
  incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
): EventBridgeEvent<string, MockEventDetail> {
  const mockEventBridgeEvent: EventBridgeEvent<string, MockEventDetail> = {
    'detail-type': 'mockDetailType',
    account: 'mockAccount',
    id: `mockId-${id}`,
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
        NewImage: marshall(incomingOrderPaymentRejectedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockEventBrideEvents(
  ids: string[],
  incomingOrderPaymentRejectedEvents: IncomingOrderPaymentRejectedEvent[],
): EventBridgeEvent<string, MockEventDetail>[] {
  return ids.map((id, index) => buildMockEventBrideEvent(id, incomingOrderPaymentRejectedEvents[index]))
}

function buildMockSqsRecord(id: string, eventBridgeEvent: EventBridgeEvent<string, MockEventDetail>): SQSRecord {
  return {
    messageId: `mockMessageId-${id}`,
    body: JSON.stringify(eventBridgeEvent),
  } as unknown as SQSRecord
}

function buildMockSqsRecords(
  ids: string[],
  eventBridgeEvents: EventBridgeEvent<string, MockEventDetail>[],
): SQSRecord[] {
  return ids.map((id, index) => buildMockSqsRecord(id, eventBridgeEvents[index]))
}

function buildMockSqsEvent(sqsRecords: SQSRecord[]): SQSEvent {
  return { Records: sqsRecords }
}

function buildMockTestObjects(ids: string[]): {
  mockIncomingOrderPaymentRejectedEvents: TypeUtilsMutable<IncomingOrderPaymentRejectedEvent>[]
  mockEventBrideEvents: EventBridgeEvent<string, MockEventDetail>[]
  mockSqsRecords: SQSRecord[]
  mockSqsEvent: SQSEvent
} {
  const mockIncomingOrderPaymentRejectedEvents = buildMockIncomingOrderPaymentRejectedEvents(ids)
  const mockEventBrideEvents = buildMockEventBrideEvents(ids, mockIncomingOrderPaymentRejectedEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBrideEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockIncomingOrderPaymentRejectedEvents,
    mockEventBrideEvents,
    mockSqsRecords,
    mockSqsEvent,
  }
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds(): IDeallocateOrderPaymentRejectedWorkerService {
  return { deallocateOrderStock: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockDeallocateOrderPaymentRejectedWorkerService_failsOnData({
  transient,
}: {
  transient: boolean
}): IDeallocateOrderPaymentRejectedWorkerService {
  return {
    deallocateOrderStock: jest
      .fn()
      .mockImplementation((incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent) => {
        const shouldFail = Object.values(incomingOrderPaymentRejectedEvent.eventData).reduce(
          (acc, cur) => (acc = acc || String(cur).endsWith('-FAILURE')),
          false,
        )
        if (shouldFail) {
          const mockFailure = Result.makeFailure('mockFailureKind' as never, 'Error message', transient)
          return Promise.resolve(mockFailure)
        }
        const mockSuccess = Result.makeSuccess()
        return Promise.resolve(mockSuccess)
      }),
  }
}

describe(`Inventory Service DeallocateOrderPaymentRejectedWorker
          DeallocateOrderPaymentRejectedWorkerController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw the input SQSEvent is valid`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input SQSEvent is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = undefined as never
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = undefined as never
    const result = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input SQSEvent is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = null as never
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = null as never
    const result = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input SQSEvent records are missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = {} as never
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = {} as never
    const result = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input SQSEvent records are undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined)
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined)
    const result = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input SQSEvent records are null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null)
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null)
    const result = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input SQSEvent records are empty`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are empty`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const result = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input SQSRecord.body is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input SQSRecord.body is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input SQSRecord.body is not a valid JSON`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const result = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent is invalid`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = 'mockInvalidValue' as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingOrderPaymentRejectedEvent
      is invalid`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = 'mockInvalidValue' as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventName edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventName is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventName is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventName is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventName is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.createdAt edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.createdAt is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.createdAt is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.createdAt is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.createdAt is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.updatedAt edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.updatedAt is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.updatedAt is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData.orderId edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData.orderId is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.orderId is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData.orderId is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.orderId is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData.sku edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData.sku is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData.sku is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData.units edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData.units is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData.units is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData.price edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData.price is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.price is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData.price is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.price is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentRejectedEvent.eventData.userId edge cases
   ************************************************************/
  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData.userId is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.userId is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock
      if the input IncomingOrderPaymentRejectedEvent.eventData.userId is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.userId is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock a single
      time for an SQSEvent with a single record`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(1)
  })

  it(`calls DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock a
      multiple times for an SQSEvent with a multiple records`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(
      mockSqsRecords.length,
    )
  })

  it(`calls DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock with the
      expected input`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockIncomingOrderPaymentRejectedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenNthCalledWith(
      1,
      mockIncomingOrderPaymentRejectedEvents[0],
    )
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenNthCalledWith(
      2,
      mockIncomingOrderPaymentRejectedEvents[1],
    )
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenNthCalledWith(
      3,
      mockIncomingOrderPaymentRejectedEvents[2],
    )
  })

  /*
   *
   *
   ************************************************************
   * Test transient/non-transient edge cases
   ************************************************************/
  it(`returns no SQSBatchItemFailures if the
      DeallocateOrderPaymentRejectedWorkerService returns no Failure`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the
      DeallocateOrderPaymentRejectedWorkerService returns a non-transient Failure
      (test 1)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_failsOnData({
        transient: false,
      })
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the
      DeallocateOrderPaymentRejectedWorkerService returns a non-transient Failure
      (test 2)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_failsOnData({
        transient: false,
      })
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the
      DeallocateOrderPaymentRejectedWorkerService returns a non-transient Failure
      (test 3)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_failsOnData({
        transient: false,
      })
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the
      DeallocateOrderPaymentRejectedWorkerService returns a transient Failure (test 1)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_failsOnData({
        transient: true,
      })
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the
      DeallocateOrderPaymentRejectedWorkerService returns a transient Failure (test 2)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_failsOnData({
        transient: true,
      })
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the
      DeallocateOrderPaymentRejectedWorkerService returns a transient Failure (test 3)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_failsOnData({
        transient: true,
      })
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[2].messageId },
        { itemIdentifier: mockSqsRecords[3].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns all SQSBatchItemFailures if the
      DeallocateOrderPaymentRejectedWorkerService throws all and only transient
      Failure`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_failsOnData({
        transient: true,
      })
    const deallocateOrderStockWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderStockWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[2].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })
})
