import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { IProcessOrderPaymentWorkerService } from '../ProcessOrderPaymentWorkerService/ProcessOrderPaymentWorkerService'
import { IncomingOrderStockAllocatedEvent } from '../model/IncomingOrderStockAllocatedEvent'
import { ProcessOrderPaymentWorkerController } from './ProcessOrderPaymentWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()

function buildMockIncomingOrderStockAllocatedEvent(id: string): TypeUtilsMutable<IncomingOrderStockAllocatedEvent> {
  const incomingOrderStockAllocatedEvent: TypeUtilsMutable<IncomingOrderStockAllocatedEvent> = {
    eventName: PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT,
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
  return incomingOrderStockAllocatedEvent
}

function buildMockIncomingOrderStockAllocatedEvents(
  ids: string[],
): TypeUtilsMutable<IncomingOrderStockAllocatedEvent>[] {
  return ids.map((id) => buildMockIncomingOrderStockAllocatedEvent(id))
}

type MockEventDetail = {
  awsRegion: string
  eventID: string
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventVersion: string
  dynamodb: {
    NewImage: Record<string, AttributeValue>
  }
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
function buildMockEventBridgeEvent(
  id: string,
  incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
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
        NewImage: marshall(incomingOrderStockAllocatedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockEventBridgeEvents(
  ids: string[],
  incomingOrderStockAllocatedEvents: IncomingOrderStockAllocatedEvent[],
): EventBridgeEvent<string, MockEventDetail>[] {
  return ids.map((id, index) => buildMockEventBridgeEvent(id, incomingOrderStockAllocatedEvents[index]))
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
  mockIncomingOrderStockAllocatedEvents: TypeUtilsMutable<IncomingOrderStockAllocatedEvent>[]
  mockEventBridgeEvents: EventBridgeEvent<string, MockEventDetail>[]
  mockSqsRecords: SQSRecord[]
  mockSqsEvent: SQSEvent
} {
  const mockIncomingOrderStockAllocatedEvents = buildMockIncomingOrderStockAllocatedEvents(ids)
  const mockEventBridgeEvents = buildMockEventBridgeEvents(ids, mockIncomingOrderStockAllocatedEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBridgeEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockIncomingOrderStockAllocatedEvents,
    mockEventBridgeEvents,
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
function buildMockProcessOrderPaymentWorkerService_succeeds(): IProcessOrderPaymentWorkerService {
  return { processOrderPayment: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockProcessOrderPaymentWorkerService_failsOnData({
  transient,
}: {
  transient: boolean
}): IProcessOrderPaymentWorkerService {
  return {
    processOrderPayment: jest
      .fn()
      .mockImplementation((incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent) => {
        const shouldFail = Object.values(incomingOrderStockAllocatedEvent.eventData).reduce(
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

describe(`Payments Service ProcessOrderPaymentWorker ProcessOrderPaymentWorkerController
          tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw if the input SQSEvent is valid`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      SQSEvent is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = undefined as never
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = undefined as never
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      SQSEvent is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = null as never
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = null as never
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      SQSEvent records are missing`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = {} as never
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are missing`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = {} as never
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      SQSEvent records are undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined)
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined)
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      SQSEvent records are null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null)
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null)
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      SQSEvent records are empty`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are empty`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      SQSRecord.body is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      SQSRecord.body is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      SQSRecord.body is not a valid JSON`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent is invalid`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = 'mockInvalidValue' as unknown as IncomingOrderStockAllocatedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingOrderStockAllocatedEvent is
      invalid`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = 'mockInvalidValue' as unknown as IncomingOrderStockAllocatedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventName edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventName is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventName is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventName is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventName is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.createdAt edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.createdAt is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.createdAt is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.createdAt is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.createdAt is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.updatedAt edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.updatedAt is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.updatedAt is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.updatedAt is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.updatedAt is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData.orderId edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData.orderId is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData.orderId is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData.orderId is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData.orderId is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData.sku edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData.sku is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData.sku is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData.sku is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData.sku is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData.units edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData.units is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData.units is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData.units is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData.units is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData.price edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData.price is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData.price is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData.price is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData.price is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderStockAllocatedEvent.eventData.userId edge cases
   ************************************************************/
  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData.userId is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData.userId is undefined`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ProcessOrderPaymentWorkerService.processOrderPayment if the input
      IncomingOrderStockAllocatedEvent.eventData.userId is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderStockAllocatedEvent.eventData.userId is null`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent(mockId)
    mockIncomingOrderStockAllocatedEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderStockAllocatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls ProcessOrderPaymentWorkerService.processOrderPayment a single time for an
      SQSEvent with a single record`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(1)
  })

  it(`calls ProcessOrderPaymentWorkerService.processOrderPayment a multiple times for
      an SQSEvent with a multiple records`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it(`calls ProcessOrderPaymentWorkerService.processOrderPayment with the expected
      input`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockIncomingOrderStockAllocatedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenNthCalledWith(
      1,
      mockIncomingOrderStockAllocatedEvents[0],
    )
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenNthCalledWith(
      2,
      mockIncomingOrderStockAllocatedEvents[1],
    )
    expect(mockProcessOrderPaymentWorkerService.processOrderPayment).toHaveBeenNthCalledWith(
      3,
      mockIncomingOrderStockAllocatedEvents[2],
    )
  })

  /*
   *
   *
   ************************************************************
   * Test transient/non-transient edge cases
   ************************************************************/
  it(`returns no SQSBatchItemFailures if the ProcessOrderPaymentWorkerService returns
      no Failure`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_succeeds()
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ProcessOrderPaymentWorkerService returns
      a non-transient Failure (test 1)`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_failsOnData({
      transient: false,
    })
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ProcessOrderPaymentWorkerService returns
      a non-transient Failure (test 2)`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_failsOnData({
      transient: false,
    })
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ProcessOrderPaymentWorkerService returns
      a non-transient Failure (test 3)`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_failsOnData({
      transient: false,
    })
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ProcessOrderPaymentWorkerService
      returns a transient Failure (test 1)`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_failsOnData({
      transient: true,
    })
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ProcessOrderPaymentWorkerService
      returns a transient Failure (test 2)`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_failsOnData({
      transient: true,
    })
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ProcessOrderPaymentWorkerService
      returns a transient Failure (test 3)`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_failsOnData({
      transient: true,
    })
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
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

  it(`returns all SQSBatchItemFailures if the ProcessOrderPaymentWorkerService throws
      all and only transient Failure`, async () => {
    const mockProcessOrderPaymentWorkerService = buildMockProcessOrderPaymentWorkerService_failsOnData({
      transient: true,
    })
    const processOrderPaymentWorkerController = new ProcessOrderPaymentWorkerController(
      mockProcessOrderPaymentWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processOrderPaymentWorkerController.processOrderPayments(mockSqsEvent)
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
