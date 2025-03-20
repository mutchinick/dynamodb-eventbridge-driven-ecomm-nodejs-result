import { marshall } from '@aws-sdk/util-dynamodb'
import { AttributeValue, EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { IRestockSkuWorkerService } from '../RestockSkuWorkerService/RestockSkuWorkerService'
import { RestockSkuWorkerController } from './RestockSkuWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingSkuRestockedEvent = {
  -readonly [K in keyof IncomingSkuRestockedEvent]: IncomingSkuRestockedEvent[K]
}

function buildMockIncomingSkuRestockedEvent(id: string): Mutable_IncomingSkuRestockedEvent {
  const incomingSkuRestockedEvent: IncomingSkuRestockedEvent = {
    eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    eventData: {
      sku: `mockSku-${id}`,
      units: 2,
      lotId: `mockLotId-${id}`,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingSkuRestockedEvent
}

function buildMockIncomingSkuRestockedEvents(ids: string[]): Mutable_IncomingSkuRestockedEvent[] {
  return ids.map((id) => buildMockIncomingSkuRestockedEvent(id))
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
  incomingSkuRestockedEvent: IncomingSkuRestockedEvent,
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
        NewImage: marshall(incomingSkuRestockedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockEventBrideEvents(
  ids: string[],
  incomingSkuRestockedEvents: IncomingSkuRestockedEvent[],
): EventBridgeEvent<string, MockEventDetail>[] {
  return ids.map((id, index) => buildMockEventBrideEvent(id, incomingSkuRestockedEvents[index]))
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
  mockIncomingSkuRestockedEvents: Mutable_IncomingSkuRestockedEvent[]
  mockEventBrideEvents: EventBridgeEvent<string, MockEventDetail>[]
  mockSqsRecords: SQSRecord[]
  mockSqsEvent: SQSEvent
} {
  const mockIncomingSkuRestockedEvents = buildMockIncomingSkuRestockedEvents(ids)
  const mockEventBrideEvents = buildMockEventBrideEvents(ids, mockIncomingSkuRestockedEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBrideEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockIncomingSkuRestockedEvents,
    mockEventBrideEvents,
    mockSqsRecords,
    mockSqsEvent,
  }
}

//
// Mock clients
//
function buildMockRestockSkuWorkerService_succeeds(): IRestockSkuWorkerService {
  return { restockSku: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockRestockSkuWorkerService_failsOnData(transient: boolean): IRestockSkuWorkerService {
  return {
    restockSku: jest.fn().mockImplementation((incomingSkuRestockedEvent: IncomingSkuRestockedEvent) => {
      const shouldFail = Object.values(incomingSkuRestockedEvent.eventData).reduce(
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

describe(`Warehouse Service RestockSkuWorker RestockSkuWorkerController tests`, () => {
  //
  // Test SQSEvent edge cases
  //
  it(`returns no SQSBatchItemFailures if the input SQSEvent is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = undefined as never
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input SQSEvent records are missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = {} as never
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input SQSEvent records are empty`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test SQSRecord edge cases
  //
  it(`returns no SQSBatchItemFailures if the input SQSRecord.body is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input SQSRecord.body is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input SQSRecord.body is not a valid JSON`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = ''
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test EventBridgeEvent edge cases
  //
  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent is invalid`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockEventBridgeEvent = 'mockInvalidValue' as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test EventBridgeEvent.detail edge cases
  //
  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent.detail is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = {} as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    delete mockEventBridgeEvent.detail
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent.detail is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = {} as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail = undefined
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent.detail is invalid`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = {} as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb edge cases
  //
  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = {} as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    delete mockEventBridgeEvent.detail
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = {} as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb is invalid`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = {} as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb.newImage edge cases
  //
  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb.newImage is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = {} as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb.newImage is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = {} as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb.newImage is invalid`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = {} as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingSkuRestockedEvent edge cases
  //
  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent is invalid`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = 'mockInvalidValue' as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingSkuRestockedEvent.eventName edge cases
  //
  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventName is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    delete mockIncomingSkuRestockedEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventName is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventName is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingSkuRestockedEvent.eventData edge cases
  //
  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    delete mockIncomingSkuRestockedEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingSkuRestockedEvent.eventData.sku edge cases
  //
  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData.sku is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    delete mockIncomingSkuRestockedEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData.sku is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData.sku is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingSkuRestockedEvent.eventData.units edge cases
  //
  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData.units is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    delete mockIncomingSkuRestockedEvent.eventData.units
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData.units is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData.units is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingSkuRestockedEvent.eventData.lotId edge cases
  //
  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData.lotId is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    delete mockIncomingSkuRestockedEvent.eventData.lotId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData.lotId is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.lotId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.eventData.lotId is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.lotId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingSkuRestockedEvent.createdAt edge cases
  //
  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.createdAt is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    delete mockIncomingSkuRestockedEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.createdAt is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.createdAt is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test IncomingSkuRestockedEvent.updatedAt edge cases
  //
  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.updatedAt is missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    delete mockIncomingSkuRestockedEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.updatedAt is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if an input IncomingSkuRestockedEvent.updatedAt is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  // Test internal logic
  //
  it(`calls RestockSkuWorkerService.restockSku a single time for an SQSEvent with a single record`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(1)
  })

  it(`calls RestockSkuWorkerService.restockSku a multiple times for an SQSEvent with a multiple records`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it(`calls RestockSkuWorkerService.restockSku with the expected input`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockIncomingSkuRestockedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenNthCalledWith(1, mockIncomingSkuRestockedEvents[0])
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenNthCalledWith(2, mockIncomingSkuRestockedEvents[1])
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenNthCalledWith(3, mockIncomingSkuRestockedEvents[2])
  })

  //
  // Test transient/non-transient edge cases
  //
  it(`returns no SQSBatchItemFailures if the RestockSkuWorkerService returns no Failure`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the RestockSkuWorkerService returns a non-transient Failure (test 1)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData(false)
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the RestockSkuWorkerService returns a non-transient Failure (test 2)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData(false)
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the RestockSkuWorkerService returns a non-transient Failure (test 3)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData(false)
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the RestockSkuWorkerService returns a transient Failure (test 1)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData(true)
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the RestockSkuWorkerService returns a transient Failure (test 2)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData(true)
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the RestockSkuWorkerService returns a transient Failure (test 3)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData(true)
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
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

  it(`returns all SQSBatchItemFailures if the RestockSkuWorkerService returns all and only transient Failure`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData(true)
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
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
