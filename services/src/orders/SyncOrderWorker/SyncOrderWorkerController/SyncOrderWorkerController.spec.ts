import { marshall } from '@aws-sdk/util-dynamodb'
import { AttributeValue, EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { OrderError } from '../../errors/OrderError'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { ISyncOrderWorkerService } from '../SyncOrderWorkerService/SyncOrderWorkerService'
import { SyncOrderWorkerController } from './SyncOrderWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingOrderEvent = {
  -readonly [K in keyof IncomingOrderEvent]: IncomingOrderEvent[K]
}

function buildMockIncomingOrderEvent(id: string): Mutable_IncomingOrderEvent {
  const incomingOrderEvent: IncomingOrderEvent = {
    eventName: OrderEventName.ORDER_PLACED_EVENT,
    eventData: {
      orderId: `mockOrderId-${id}`,
      orderStatus: OrderStatus.ORDER_CREATED_STATUS,
      sku: `mockSku-${id}`,
      quantity: Math.ceil(Math.random() * 99),
      price: Math.random() * 1234,
      userId: `mockUserId-${id}`,
      createdAt: `mockCreatedAt-${id}`,
      updatedAt: `mockUpdatedAt-${id}`,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingOrderEvent
}

function buildMockIncomingOrderEvents(ids: string[]) {
  return ids.map((id) => buildMockIncomingOrderEvent(id))
}

type MockEventDetail = {
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  dynamodb: {
    NewImage: AttributeValue | Record<string, AttributeValue>
  }
}

function buildMockEventBrideEvent(id: string, incomingOrderEvent: IncomingOrderEvent) {
  const mockEventBridgeEvent: EventBridgeEvent<string, MockEventDetail> = {
    id: `mockId-${id}`,
    version: '0',
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
        NewImage: marshall(incomingOrderEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockEventBrideEvents(ids: string[], incomingOrderEvents: IncomingOrderEvent[]) {
  return ids.map((id, index) => buildMockEventBrideEvent(id, incomingOrderEvents[index]))
}

function buildMockSqsRecord(id: string, eventBridgeEvent: EventBridgeEvent<string, MockEventDetail>): SQSRecord {
  return {
    messageId: `mockMessageId-${id}`,
    body: JSON.stringify(eventBridgeEvent),
  } as unknown as SQSRecord
}

function buildMockSqsRecords(ids: string[], eventBridgeEvents: EventBridgeEvent<string, MockEventDetail>[]) {
  return ids.map((id, index) => buildMockSqsRecord(id, eventBridgeEvents[index]))
}

function buildMockSqsEvent(sqsRecords: SQSRecord[]): SQSEvent {
  return { Records: sqsRecords }
}

function buildMockTestObjects(ids: string[]) {
  const mockIncomingOrderEvents = buildMockIncomingOrderEvents(ids)
  const mockEventBrideEvents = buildMockEventBrideEvents(ids, mockIncomingOrderEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBrideEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockIncomingOrderEvents,
    mockEventBrideEvents,
    mockSqsRecords,
    mockSqsEvent,
  }
}

function buildMockSyncOrderWorkerService_syncOrder_resolves(): ISyncOrderWorkerService {
  return { syncOrder: jest.fn() }
}

function buildMockSyncOrderWorkerService_syncOrder_throwsIfAsked(errorName: string): ISyncOrderWorkerService {
  return {
    syncOrder: jest.fn().mockImplementation((incomingOrderEvent: IncomingOrderEvent) => {
      const shouldThrow = Object.values(incomingOrderEvent.eventData).reduce(
        (acc, cur) => (acc = acc || String(cur).endsWith('-THROW')),
        false,
      )
      if (shouldThrow) {
        const error = new Error()
        OrderError.addName(error, errorName)
        return Promise.reject(error)
      }
      return Promise.resolve()
    }),
  }
}

describe('Orders Service SyncOrderWorker SyncOrderWorkerController tests', () => {
  //
  // Test SQSEvent edge cases
  //
  it('throws if the input SQSEvent is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockApiEvent = undefined as unknown as SQSEvent
    await expect(syncOrderWorkerController.syncOrders(mockApiEvent)).rejects.toThrow()
  })

  it('throws if the input SQSEvent records are missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockApiEvent = {} as unknown as SQSEvent
    await expect(syncOrderWorkerController.syncOrders(mockApiEvent)).rejects.toThrow()
  })

  it('does not throw if the input SQSEvent records are empty', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input SQSEvent records are empty', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test SQSRecord edge cases
  //
  it('does not throw if the input SQSRecord.body is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input SQSRecord.body is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input SQSRecord.body is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input SQSRecord.body is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input SQSRecord.body is not a valid JSON', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = ''
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input SQSRecord.body is not a valid JSON', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = ''
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test EventBridgeEvent edge cases
  //
  it('does not throw if the input EventBridgeEvent is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent is invalid', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockEventBridgeEvent = 'mockInvalidValue' as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent is invalid', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockEventBridgeEvent = 'mockInvalidValue' as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test EventBridgeEvent.detail edge cases
  //
  it('does not throw if the input EventBridgeEvent.detail is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent.detail is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = undefined
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent.detail is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = undefined
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail is invalid', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent.detail is invalid', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb edge cases
  //
  it('does not throw if the input EventBridgeEvent.detail.dynamodb is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail.dynamodb
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent.detail.dynamodb is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail.dynamodb is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent.detail.dynamodb is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail.dynamodb is invalid', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent.detail.dynamodb is invalid', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb.newImage edge cases
  //
  it('does not throw if the input EventBridgeEvent.detail.dynamodb.newImage is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent.detail.dynamodb.newImage is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail.dynamodb.newImage is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent.detail.dynamodb.newImage is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail.dynamodb.newImage is invalid', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the input EventBridgeEvent.detail.dynamodb.newImage is invalid', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = {} as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent edge cases
  //
  it('does not throw if an input IncomingOrderEvent is invalid', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = 'mockInvalidValue' as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('returns no failures if an input IncomingOrderEvent is invalid', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = 'mockInvalidValue' as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.eventName edge cases
  //
  it('does not throw if an input IncomingOrderEvent.eventName is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventName is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventName is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventName is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventName is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventName is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.eventData edge cases
  //
  it('does not throw if an input IncomingOrderEvent.eventData is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.eventData.orderId edge cases
  //
  it('does not throw if an input IncomingOrderEvent.eventData.orderId is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.orderId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.orderId is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.orderId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.orderId is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.orderId is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.orderId is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.orderId is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.eventData.orderStatus edge cases
  //
  it('does not throw if an input IncomingOrderEvent.eventData.orderStatus is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.orderStatus
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.orderStatus is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.orderStatus
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.orderStatus is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderStatus = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.orderStatus is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderStatus = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.orderStatus is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderStatus = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.orderStatus is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderStatus = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.eventData.sku edge cases
  //
  it('does not throw if an input IncomingOrderEvent.eventData.sku is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.sku is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.sku is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.sku is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.sku is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.sku is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.eventData.quantity edge cases
  //
  it('does not throw if an input IncomingOrderEvent.eventData.quantity is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.quantity
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.quantity is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.quantity
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.quantity is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.quantity = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.quantity is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.quantity = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.quantity is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.quantity = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.quantity is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.quantity = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.eventData.price edge cases
  //
  it('does not throw if an input IncomingOrderEvent.eventData.price is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.price
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.price is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.price
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.price is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.price is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.price is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.price is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.eventData.userId edge cases
  //
  it('does not throw if an input IncomingOrderEvent.eventData.userId is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.userId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.userId is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.userId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.userId is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.userId is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.userId is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.userId is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.eventData.createdAt edge cases
  //
  it('does not throw if an input IncomingOrderEvent.eventData.createdAt is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.createdAt is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.createdAt is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.createdAt is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.createdAt is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.createdAt is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.eventData.updatedAt edge cases
  //
  it('does not throw if an input IncomingOrderEvent.eventData.updatedAt is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.updatedAt is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.eventData.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.updatedAt is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.updatedAt is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.eventData.updatedAt is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.eventData.updatedAt is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.createdAt edge cases
  //
  it('does not throw if an input IncomingOrderEvent.createdAt is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.createdAt is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.createdAt is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.createdAt is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.createdAt is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.createdAt is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderEvent.updatedAt edge cases
  //
  it('does not throw if an input IncomingOrderEvent.updatedAt is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.updatedAt is missing', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    delete mockIncomingOrderEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.updatedAt is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.updatedAt is undefined', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderEvent.updatedAt is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no failures if an input IncomingOrderEvent.updatedAt is null', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test internal logic
  //
  it('calls SyncOrderWorkerService.syncOrder a single time for an SQSEvent with a single record', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).toHaveBeenCalledTimes(1)
  })

  it('calls SyncOrderWorkerService.syncOrder a multiple times for an SQSEvent with a multiple records', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it('calls SyncOrderWorkerService.syncOrder with the expected input', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockIncomingOrderEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).toHaveBeenNthCalledWith(1, mockIncomingOrderEvents[0])
    expect(mockSyncOrderWorkerService.syncOrder).toHaveBeenNthCalledWith(2, mockIncomingOrderEvents[1])
    expect(mockSyncOrderWorkerService.syncOrder).toHaveBeenNthCalledWith(3, mockIncomingOrderEvents[2])
  })

  //
  // Test DoNotRetryError edge cases
  //
  it('does not throw if the SyncOrderWorkerService does not throw', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no failures if the SyncOrderWorkerService does not throw', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('return no failures if the SyncOrderWorkerService throws an DoNotRetryError (test 1)', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_throwsIfAsked(
      OrderError.DoNotRetryError,
    )
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA-THROW', 'BB-THROW', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('return no failures if the SyncOrderWorkerService throws an DoNotRetryError (test 2)', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_throwsIfAsked(
      OrderError.DoNotRetryError,
    )
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB-THROW', 'CC', 'DD', 'EE-THROW']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('return no failures if the SyncOrderWorkerService throws an DoNotRetryError (test 3)', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_throwsIfAsked(
      OrderError.DoNotRetryError,
    )
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB-THROW', 'CC-THROW', 'DD-THROW', 'EE-THROW']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('returns expected failures if the SyncOrderWorkerService throws an Error not DoNotRetryError (test 1)', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_throwsIfAsked('SomeError')
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA-THROW', 'BB-THROW', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(result).toStrictEqual(expected)
  })

  it('returns expected failures if the SyncOrderWorkerService throws an Error not DoNotRetryError (test 2)', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_throwsIfAsked('SomeError')
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB-THROW', 'CC', 'DD', 'EE-THROW']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(result).toStrictEqual(expected)
  })

  it('returns expected failures if the SyncOrderWorkerService throws an Error not DoNotRetryError (test 3)', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_throwsIfAsked('SomeError')
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB-THROW', 'CC-THROW', 'DD-THROW', 'EE-THROW']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[2].messageId },
        { itemIdentifier: mockSqsRecords[3].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(result).toStrictEqual(expected)
  })

  it('returns all failures if the SyncOrderWorkerService throws all and only Error not DoNotRetryError', async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_syncOrder_throwsIfAsked('SomeError')
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA-THROW', 'BB-THROW', 'CC-THROW']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expected: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[2].messageId },
      ],
    }
    expect(result).toStrictEqual(expected)
  })
})
