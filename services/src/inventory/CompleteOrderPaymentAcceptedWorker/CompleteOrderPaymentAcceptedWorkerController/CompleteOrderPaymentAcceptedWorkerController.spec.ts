import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { ICompleteOrderPaymentAcceptedWorkerService } from '../CompleteOrderPaymentAcceptedWorkerService/CompleteOrderPaymentAcceptedWorkerService'
import { IncomingOrderPaymentAcceptedEvent } from '../model/IncomingOrderPaymentAcceptedEvent'
import { CompleteOrderPaymentAcceptedWorkerController } from './CompleteOrderPaymentAcceptedWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()

function buildMockIncomingOrderPaymentAcceptedEvent(id: string): TypeUtilsMutable<IncomingOrderPaymentAcceptedEvent> {
  const incomingOrderPaymentAcceptedEvent: TypeUtilsMutable<IncomingOrderPaymentAcceptedEvent> = {
    eventName: InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
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
  return incomingOrderPaymentAcceptedEvent
}

function buildMockIncomingOrderPaymentAcceptedEvents(
  ids: string[],
): TypeUtilsMutable<IncomingOrderPaymentAcceptedEvent>[] {
  return ids.map((id) => buildMockIncomingOrderPaymentAcceptedEvent(id))
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
  incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent,
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
        NewImage: marshall(incomingOrderPaymentAcceptedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockEventBridgeEvents(
  ids: string[],
  incomingOrderPaymentAcceptedEvents: IncomingOrderPaymentAcceptedEvent[],
): EventBridgeEvent<string, MockEventDetail>[] {
  return ids.map((id, index) => buildMockEventBridgeEvent(id, incomingOrderPaymentAcceptedEvents[index]))
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
  mockIncomingOrderPaymentAcceptedEvents: TypeUtilsMutable<IncomingOrderPaymentAcceptedEvent>[]
  mockEventBridgeEvents: EventBridgeEvent<string, MockEventDetail>[]
  mockSqsRecords: SQSRecord[]
  mockSqsEvent: SQSEvent
} {
  const mockIncomingOrderPaymentAcceptedEvents = buildMockIncomingOrderPaymentAcceptedEvents(ids)
  const mockEventBridgeEvents = buildMockEventBridgeEvents(ids, mockIncomingOrderPaymentAcceptedEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBridgeEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockIncomingOrderPaymentAcceptedEvents,
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
function buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds(): ICompleteOrderPaymentAcceptedWorkerService {
  return { completeOrder: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockCompleteOrderPaymentAcceptedWorkerService_failsOnData({
  transient,
}: {
  transient: boolean
}): ICompleteOrderPaymentAcceptedWorkerService {
  return {
    completeOrder: jest
      .fn()
      .mockImplementation((incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent) => {
        const shouldFail = Object.values(incomingOrderPaymentAcceptedEvent.eventData).reduce(
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

describe(`Inventory Service CompleteOrderPaymentAcceptedWorker
          CompleteOrderPaymentAcceptedWorkerController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw if the input SQSEvent is valid`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input SQSEvent is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = undefined as never
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = undefined as never
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input SQSEvent is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = null as never
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = null as never
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input SQSEvent records are missing`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = {} as never
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are missing`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = {} as never
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input SQSEvent records are undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined)
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined)
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input SQSEvent records are null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null)
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null)
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input SQSEvent records are empty`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are empty`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input SQSRecord.body is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input SQSRecord.body is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input SQSRecord.body is not a valid JSON`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent is invalid`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = 'mockInvalidValue' as unknown as IncomingOrderPaymentAcceptedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingOrderPaymentAcceptedEvent
      is invalid`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = 'mockInvalidValue' as unknown as IncomingOrderPaymentAcceptedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventName edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventName is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventName is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventName is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventName is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.createdAt edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.createdAt is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.createdAt is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.createdAt is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.createdAt is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.updatedAt edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.updatedAt is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.updatedAt is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.updatedAt is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.updatedAt is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData.orderId edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData.orderId is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData.orderId is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData.orderId is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData.orderId is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData.sku edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData.sku is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData.sku is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData.sku is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData.sku is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData.units edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData.units is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData.units is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData.units is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData.units is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData.price edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData.price is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData.price is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData.price is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData.price is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent.eventData.userId edge cases
   ************************************************************/
  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData.userId is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData.userId is undefined`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call CompleteOrderPaymentAcceptedWorkerService.completeOrder if the
      input IncomingOrderPaymentAcceptedEvent.eventData.userId is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingOrderPaymentAcceptedEvent.eventData.userId is null`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent(mockId)
    mockIncomingOrderPaymentAcceptedEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderPaymentAcceptedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls CompleteOrderPaymentAcceptedWorkerService.completeOrder a single time for
      an SQSEvent with a single record`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(1)
  })

  it(`calls CompleteOrderPaymentAcceptedWorkerService.completeOrder a multiple times
      for an SQSEvent with a multiple records`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it(`calls CompleteOrderPaymentAcceptedWorkerService.completeOrder with the expected
      input`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockIncomingOrderPaymentAcceptedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenNthCalledWith(
      1,
      mockIncomingOrderPaymentAcceptedEvents[0],
    )
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenNthCalledWith(
      2,
      mockIncomingOrderPaymentAcceptedEvents[1],
    )
    expect(mockCompleteOrderPaymentAcceptedWorkerService.completeOrder).toHaveBeenNthCalledWith(
      3,
      mockIncomingOrderPaymentAcceptedEvents[2],
    )
  })

  /*
   *
   *
   ************************************************************
   * Test transient/non-transient edge cases
   ************************************************************/
  it(`returns no SQSBatchItemFailures if the CompleteOrderPaymentAcceptedWorkerService
      returns no Failure`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService = buildMockCompleteOrderPaymentAcceptedWorkerService_succeeds()
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the CompleteOrderPaymentAcceptedWorkerService
      returns a non-transient Failure (test 1)`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService =
      buildMockCompleteOrderPaymentAcceptedWorkerService_failsOnData({
        transient: false,
      })
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the CompleteOrderPaymentAcceptedWorkerService
      returns a non-transient Failure (test 2)`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService =
      buildMockCompleteOrderPaymentAcceptedWorkerService_failsOnData({
        transient: false,
      })
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the CompleteOrderPaymentAcceptedWorkerService
      returns a non-transient Failure (test 3)`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService =
      buildMockCompleteOrderPaymentAcceptedWorkerService_failsOnData({
        transient: false,
      })
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the
      CompleteOrderPaymentAcceptedWorkerService returns a transient Failure (test 1)`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService =
      buildMockCompleteOrderPaymentAcceptedWorkerService_failsOnData({
        transient: true,
      })
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the
      CompleteOrderPaymentAcceptedWorkerService returns a transient Failure (test 2)`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService =
      buildMockCompleteOrderPaymentAcceptedWorkerService_failsOnData({
        transient: true,
      })
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the
      CompleteOrderPaymentAcceptedWorkerService returns a transient Failure (test 3)`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService =
      buildMockCompleteOrderPaymentAcceptedWorkerService_failsOnData({
        transient: true,
      })
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
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
      CompleteOrderPaymentAcceptedWorkerService throws all and only transient Failure`, async () => {
    const mockCompleteOrderPaymentAcceptedWorkerService =
      buildMockCompleteOrderPaymentAcceptedWorkerService_failsOnData({
        transient: true,
      })
    const completeOrderPaymentAcceptedWorkerController = new CompleteOrderPaymentAcceptedWorkerController(
      mockCompleteOrderPaymentAcceptedWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await completeOrderPaymentAcceptedWorkerController.completeOrders(mockSqsEvent)
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
