import { marshall } from '@aws-sdk/util-dynamodb'
import { AttributeValue, EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IDeallocateOrderPaymentRejectedWorkerService } from '../DeallocateOrderPaymentRejectedWorkerService/DeallocateOrderPaymentRejectedWorkerService'
import { IncomingOrderPaymentRejectedEvent } from '../model/IncomingOrderPaymentRejectedEvent'
import { DeallocateOrderPaymentRejectedWorkerController } from './DeallocateOrderPaymentRejectedWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingOrderPaymentRejectedEvent(id: string): TypeUtilsMutable<IncomingOrderPaymentRejectedEvent> {
  const incomingOrderPaymentRejectedEvent: TypeUtilsMutable<IncomingOrderPaymentRejectedEvent> = {
    eventName: WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT,
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
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  dynamodb: {
    NewImage: AttributeValue | Record<string, AttributeValue>
  }
}

// COMBAK: Figure a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockEventBrideEvent(
  id: string,
  incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
): EventBridgeEvent<string, MockEventDetail> {
  const mockEventBridgeEvent: EventBridgeEvent<string, MockEventDetail> = {
    id: `mockId-${id}`,
    version: 'mockVersion',
    'detail-type': 'mockDetailType',
    source: 'mockSource',
    account: 'mockAccount',
    time: 'mockTime',
    region: 'mockRegion',
    resources: [],
    detail: {
      eventName: 'INSERT',
      eventSource: 'aws:dynamodb',
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

//
// Mock services
//
function buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds(): IDeallocateOrderPaymentRejectedWorkerService {
  return { deallocateOrderStock: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockDeallocateOrderPaymentRejectedWorkerService_fails(
  transient: boolean,
): IDeallocateOrderPaymentRejectedWorkerService {
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

describe(`Warehouse Service DeallocateOrderPaymentRejectedWorker DeallocateOrderPaymentRejectedWorkerController tests`, () => {
  //
  // Test SQSEvent edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      SQSEvent is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = undefined as never
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      SQSEvent records are missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = {} as never
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      SQSEvent records are empty`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      SQSRecord.body is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      SQSRecord.body is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      SQSRecord.body is not a valid JSON`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = ''
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test EventBridgeEvent edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent is invalid`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockEventBridgeEvent = 'mockInvalidValue' as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test EventBridgeEvent.detail edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent.detail is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = {} as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    delete mockEventBridgeEvent.detail
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent.detail is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = {} as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail = undefined
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent.detail is invalid`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = {} as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent.detail.dynamodb is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = {} as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    delete mockEventBridgeEvent.detail
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent.detail.dynamodb is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = {} as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent.detail.dynamodb is invalid`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = {} as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb.newImage edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent.detail.dynamodb.newImage is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = {} as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent.detail.dynamodb.newImage is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = {} as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input 
      EventBridgeEvent.detail.dynamodb.newImage is invalid`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = {} as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent is invalid`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = 'mockInvalidValue' as unknown as IncomingOrderPaymentRejectedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventName edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventName is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    delete mockIncomingOrderPaymentRejectedEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventName is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventName is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventData edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    delete mockIncomingOrderPaymentRejectedEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventData.orderId edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.orderId is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    delete mockIncomingOrderPaymentRejectedEvent.eventData.orderId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.orderId is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.orderId is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventData.sku edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    delete mockIncomingOrderPaymentRejectedEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.sku is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventData.units edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    delete mockIncomingOrderPaymentRejectedEvent.eventData.units
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.units is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventData.price edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.price is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    delete mockIncomingOrderPaymentRejectedEvent.eventData.price
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.price is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.price is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.eventData.userId edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.userId is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    delete mockIncomingOrderPaymentRejectedEvent.eventData.userId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.userId is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.eventData.userId is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.createdAt edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.createdAt is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    delete mockIncomingOrderPaymentRejectedEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.createdAt is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.createdAt is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingOrderPaymentRejectedEvent.updatedAt edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is missing`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    delete mockIncomingOrderPaymentRejectedEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is undefined`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input
      IncomingOrderPaymentRejectedEvent.updatedAt is null`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent(mockId)
    mockIncomingOrderPaymentRejectedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderPaymentRejectedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test internal logic
  //
  it(`calls DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock a single time
      for an SQSEvent with a single record`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(1)
  })

  it(`calls DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock a multiple times
      for an SQSEvent with a multiple records`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    expect(mockDeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock).toHaveBeenCalledTimes(
      mockSqsRecords.length,
    )
  })

  it(`calls DeallocateOrderPaymentRejectedWorkerService.deallocateOrderStock with the expected input`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockIncomingOrderPaymentRejectedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
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

  //
  // Test transient vs non-transient edge cases
  //
  it(`returns an empty SQSBatchResponse.batchItemFailures if the DeallocateOrderPaymentRejectedWorkerService return no Failure`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_succeeds()
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the DeallocateOrderPaymentRejectedWorkerService
      returns a non-transient Failure (test 1)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_fails(false)
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the DeallocateOrderPaymentRejectedWorkerService
      returns a non-transient Failure (test 2)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_fails(false)
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the DeallocateOrderPaymentRejectedWorkerService
      returns a non-transient Failure (test 3)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_fails(false)
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns the expected SQSBatchResponse.batchItemFailures if the DeallocateOrderPaymentRejectedWorkerService
      returns a transient Failure (test 1)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_fails(true)
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns the expected SQSBatchResponse.batchItemFailures if the DeallocateOrderPaymentRejectedWorkerService
      returns a transient Failure (test 2)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_fails(true)
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns the expected SQSBatchResponse.batchItemFailures if the DeallocateOrderPaymentRejectedWorkerService
      returns a transient Failure (test 3)`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_fails(true)
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
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

  it(`returns all SQSBatchResponse.batchItemFailures if the DeallocateOrderPaymentRejectedWorkerService returns
      all and only transient Failure`, async () => {
    const mockDeallocateOrderPaymentRejectedWorkerService =
      buildMockDeallocateOrderPaymentRejectedWorkerService_fails(true)
    const deallocateOrderPaymentRejectedWorkerController = new DeallocateOrderPaymentRejectedWorkerController(
      mockDeallocateOrderPaymentRejectedWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock(mockSqsEvent)
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
