import { marshall } from '@aws-sdk/util-dynamodb'
import { AttributeValue, EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IAllocateOrderStockWorkerService } from '../AllocateOrderStockWorkerService/AllocateOrderStockWorkerService'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { AllocateOrderStockWorkerController } from './AllocateOrderStockWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingOrderCreatedEvent = {
  -readonly [K in keyof IncomingOrderCreatedEvent]: IncomingOrderCreatedEvent[K]
}

function buildMockIncomingOrderCreatedEvent(id: string): Mutable_IncomingOrderCreatedEvent {
  const incomingOrderCreatedEvent: IncomingOrderCreatedEvent = {
    eventName: WarehouseEventName.ORDER_CREATED_EVENT,
    eventData: {
      sku: `mockSku-${id}`,
      units: 2,
      orderId: `mockOrderId-${id}`,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingOrderCreatedEvent
}

function buildMockIncomingOrderCreatedEvents(ids: string[]) {
  return ids.map((id) => buildMockIncomingOrderCreatedEvent(id))
}

type MockEventDetail = {
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  dynamodb: {
    NewImage: AttributeValue | Record<string, AttributeValue>
  }
}

function buildMockEventBrideEvent(id: string, incomingOrderCreatedEvent: IncomingOrderCreatedEvent) {
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
        NewImage: marshall(incomingOrderCreatedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockEventBrideEvents(ids: string[], incomingOrderCreatedEvents: IncomingOrderCreatedEvent[]) {
  return ids.map((id, index) => buildMockEventBrideEvent(id, incomingOrderCreatedEvents[index]))
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
  const mockIncomingOrderCreatedEvents = buildMockIncomingOrderCreatedEvents(ids)
  const mockEventBrideEvents = buildMockEventBrideEvents(ids, mockIncomingOrderCreatedEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBrideEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockIncomingOrderCreatedEvents,
    mockEventBrideEvents,
    mockSqsRecords,
    mockSqsEvent,
  }
}

function buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds(): IAllocateOrderStockWorkerService {
  return { allocateOrderStock: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockAllocateOrderStockWorkerService_allocateOrderStock_failsOnData(
  transient: boolean,
): IAllocateOrderStockWorkerService {
  return {
    allocateOrderStock: jest.fn().mockImplementation((incomingOrderCreatedEvent: IncomingOrderCreatedEvent) => {
      const shouldFail = Object.values(incomingOrderCreatedEvent.eventData).reduce(
        (acc, cur) => (acc = acc || String(cur).endsWith('-FAILURE')),
        false,
      )
      if (shouldFail) {
        const failure = Result.makeFailure('mockFailureKind' as never, 'Error message', transient)
        return Promise.resolve(failure)
      }
      const success = Result.makeSuccess()
      return Promise.resolve(success)
    }),
  }
}

describe('Warehouse Service AllocateOrderStockWorker AllocateOrderStockWorkerController tests', () => {
  //
  // Test SQSEvent edge cases
  //
  it('throws if the input SQSEvent is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockApiEvent = undefined as unknown as SQSEvent
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockApiEvent)).rejects.toThrow()
  })

  it('throws if the input SQSEvent records are missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockApiEvent = {} as unknown as SQSEvent
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockApiEvent)).rejects.toThrow()
  })

  it('does not throw if the input SQSEvent records are empty', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input SQSEvent records are empty', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test SQSRecord edge cases
  //
  it('does not throw if the input SQSRecord.body is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input SQSRecord.body is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input SQSRecord.body is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input SQSRecord.body is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input SQSRecord.body is not a valid JSON', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = ''
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input SQSRecord.body is not a valid JSON', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = ''
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test EventBridgeEvent edge cases
  //
  it('does not throw if the input EventBridgeEvent is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockEventBridgeEvent = undefined as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent is invalid', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockEventBridgeEvent = 'mockInvalidValue' as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent is invalid', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockEventBridgeEvent = 'mockInvalidValue' as unknown as EventBridgeEvent<string, MockEventDetail>
    const mockSqsRecord = buildMockSqsRecord('AA', mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test EventBridgeEvent.detail edge cases
  //
  it('does not throw if the input EventBridgeEvent.detail is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    delete mockEventBridgeEvent.detail
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent.detail is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    delete mockEventBridgeEvent.detail
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail = undefined
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent.detail is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail = undefined
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail is invalid', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent.detail is invalid', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb edge cases
  //
  it('does not throw if the input EventBridgeEvent.detail.dynamodb is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    delete mockEventBridgeEvent.detail.dynamodb
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    delete mockEventBridgeEvent.detail
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail.dynamodb is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail.dynamodb is invalid', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb is invalid', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb.newImage edge cases
  //
  it('does not throw if the input EventBridgeEvent.detail.dynamodb.newImage is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb.newImage is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail.dynamodb.newImage is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb.newImage is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if the input EventBridgeEvent.detail.dynamodb.newImage is invalid', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the input EventBridgeEvent.detail.dynamodb.newImage is invalid', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = {} as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderCreatedEvent edge cases
  //
  it('does not throw if an input IncomingOrderCreatedEvent is invalid', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = 'mockInvalidValue' as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent is invalid', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = 'mockInvalidValue' as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderCreatedEvent.eventName edge cases
  //
  it('does not throw if an input IncomingOrderCreatedEvent.eventName is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventName is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.eventName is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventName is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.eventName is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventName is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderCreatedEvent.eventData edge cases
  //
  it('does not throw if an input IncomingOrderCreatedEvent.eventData is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.eventData is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.eventData is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderCreatedEvent.eventData.sku edge cases
  //
  it('does not throw if an input IncomingOrderCreatedEvent.eventData.sku is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData.sku is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.eventData.sku is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData.sku is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.eventData.sku is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData.sku is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderCreatedEvent.eventData.units edge cases
  //
  it('does not throw if an input IncomingOrderCreatedEvent.eventData.units is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.eventData.units
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData.units is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.eventData.units
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.eventData.units is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData.units is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.eventData.units is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData.units is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderCreatedEvent.eventData.orderId edge cases
  //
  it('does not throw if an input IncomingOrderCreatedEvent.eventData.orderId is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.eventData.orderId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData.orderId is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.eventData.orderId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.eventData.orderId is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData.orderId is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.eventData.orderId is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.eventData.orderId is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderCreatedEvent.createdAt edge cases
  //
  it('does not throw if an input IncomingOrderCreatedEvent.createdAt is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.createdAt is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.createdAt is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.createdAt is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.createdAt is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.createdAt is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test IncomingOrderCreatedEvent.updatedAt edge cases
  //
  it('does not throw if an input IncomingOrderCreatedEvent.updatedAt is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.updatedAt is missing', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    delete mockIncomingOrderCreatedEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.updatedAt is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.updatedAt is undefined', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('does not throw if an input IncomingOrderCreatedEvent.updatedAt is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('returns no SQSBatchItemFailures if an input IncomingOrderCreatedEvent.updatedAt is null', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  //
  // Test internal logic
  //
  it('calls AllocateOrderStockWorkerService.allocateOrderStock a single time for an SQSEvent with a single record', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).toHaveBeenCalledTimes(1)
  })

  it('calls AllocateOrderStockWorkerService.allocateOrderStock a multiple times for an SQSEvent with a multiple records', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it('calls AllocateOrderStockWorkerService.allocateOrderStock with the expected input', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockIncomingOrderCreatedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).toHaveBeenNthCalledWith(
      1,
      mockIncomingOrderCreatedEvents[0],
    )
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).toHaveBeenNthCalledWith(
      2,
      mockIncomingOrderCreatedEvents[1],
    )
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).toHaveBeenNthCalledWith(
      3,
      mockIncomingOrderCreatedEvents[2],
    )
  })

  //
  // Test DoNotRetryError edge cases
  //
  it('does not throw if the AllocateOrderStockWorkerService does not throw', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it('return no SQSBatchItemFailures if the AllocateOrderStockWorkerService does not throw', async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_allocateOrderStock_succeeds()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('return no SQSBatchItemFailures if the AllocateOrderStockWorkerService returns a non transient Failure (test 1)', async () => {
    const mockAllocateOrderStockWorkerService =
      buildMockAllocateOrderStockWorkerService_allocateOrderStock_failsOnData(false)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('return no SQSBatchItemFailures if the AllocateOrderStockWorkerService returns a non transient Failure (test 2)', async () => {
    const mockAllocateOrderStockWorkerService =
      buildMockAllocateOrderStockWorkerService_allocateOrderStock_failsOnData(false)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('return no SQSBatchItemFailures if the AllocateOrderStockWorkerService returns a non transient Failure (test 3)', async () => {
    const mockAllocateOrderStockWorkerService =
      buildMockAllocateOrderStockWorkerService_allocateOrderStock_failsOnData(false)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expected)
  })

  it('returns expected SQSBatchItemFailures if the AllocateOrderStockWorkerService fails with an Error not DoNotRetryError (test 1)', async () => {
    const mockAllocateOrderStockWorkerService =
      buildMockAllocateOrderStockWorkerService_allocateOrderStock_failsOnData(true)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(result).toStrictEqual(expected)
  })

  it('returns expected SQSBatchItemFailures if the AllocateOrderStockWorkerService fails with an Error not DoNotRetryError (test 2)', async () => {
    const mockAllocateOrderStockWorkerService =
      buildMockAllocateOrderStockWorkerService_allocateOrderStock_failsOnData(true)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expected: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(result).toStrictEqual(expected)
  })

  it('returns expected SQSBatchItemFailures if the AllocateOrderStockWorkerService fails with an Error not DoNotRetryError (test 3)', async () => {
    const mockAllocateOrderStockWorkerService =
      buildMockAllocateOrderStockWorkerService_allocateOrderStock_failsOnData(true)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
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

  it('returns all SQSBatchItemFailures if the AllocateOrderStockWorkerService fails with all Errors not DoNotRetryError', async () => {
    const mockAllocateOrderStockWorkerService =
      buildMockAllocateOrderStockWorkerService_allocateOrderStock_failsOnData(true)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
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
