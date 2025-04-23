import { marshall } from '@aws-sdk/util-dynamodb'
import { AttributeValue, EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { IRestockSkuWorkerService } from '../RestockSkuWorkerService/RestockSkuWorkerService'
import { RestockSkuWorkerController } from './RestockSkuWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingSkuRestockedEvent(id: string): TypeUtilsMutable<IncomingSkuRestockedEvent> {
  const incomingSkuRestockedEvent: IncomingSkuRestockedEvent = {
    eventName: InventoryEventName.SKU_RESTOCKED_EVENT,
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

function buildMockIncomingSkuRestockedEvents(ids: string[]): TypeUtilsMutable<IncomingSkuRestockedEvent>[] {
  return ids.map((id) => buildMockIncomingSkuRestockedEvent(id))
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
  incomingSkuRestockedEvent: IncomingSkuRestockedEvent,
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
  mockIncomingSkuRestockedEvents: TypeUtilsMutable<IncomingSkuRestockedEvent>[]
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

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockRestockSkuWorkerService_succeeds(): IRestockSkuWorkerService {
  return { restockSku: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockRestockSkuWorkerService_failsOnData({ transient }: { transient: boolean }): IRestockSkuWorkerService {
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

describe(`Inventory Service RestockSkuWorker RestockSkuWorkerController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw the input SQSEvent is valid`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(restockSkuWorkerController.restockSkus(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`fails to call RestockSkuWorkerService.restockSku if the input SQSEvent is
      undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = undefined as never
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = undefined as never
    const result = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call RestockSkuWorkerService.restockSku if the input SQSEvent is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = null as never
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = null as never
    const result = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`fails to call RestockSkuWorkerService.restockSku if the input SQSEvent records
      are missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = {} as never
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are missing`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = {} as never
    const result = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call RestockSkuWorkerService.restockSku if the input SQSEvent records
      are undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = buildMockSqsEvent(undefined)
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = buildMockSqsEvent(undefined)
    const result = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call RestockSkuWorkerService.restockSku if the input SQSEvent records
      are null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = buildMockSqsEvent(null)
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = buildMockSqsEvent(null)
    const result = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call RestockSkuWorkerService.restockSku if the input SQSEvent records
      are empty`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are empty`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    const result = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`fails to call RestockSkuWorkerService.restockSku if the input SQSRecord.body is
      undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call RestockSkuWorkerService.restockSku if the input SQSRecord.body is
      null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call RestockSkuWorkerService.restockSku if the input SQSRecord.body is
      not a valid JSON`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(0)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const result = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent edge cases
   ************************************************************/
  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent is invalid`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = 'mockInvalidValue' as unknown as IncomingSkuRestockedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingSkuRestockedEvent is
      invalid`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.eventName edge cases
   ************************************************************/
  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.eventName is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingSkuRestockedEvent.eventName
      is undefined`, async () => {
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

  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.eventName is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingSkuRestockedEvent.eventName
      is null`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.createdAt edge cases
   ************************************************************/
  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.createdAt is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingSkuRestockedEvent.createdAt
      is undefined`, async () => {
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

  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.createdAt is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingSkuRestockedEvent.createdAt
      is null`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.updatedAt edge cases
   ************************************************************/
  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.updatedAt is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingSkuRestockedEvent.updatedAt
      is undefined`, async () => {
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

  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.updatedAt is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingSkuRestockedEvent.updatedAt
      is null`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.eventData edge cases
   ************************************************************/
  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.eventData is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingSkuRestockedEvent.eventData
      is undefined`, async () => {
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

  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.eventData is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input IncomingSkuRestockedEvent.eventData
      is null`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.eventData.sku edge cases
   ************************************************************/
  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.eventData.sku is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingSkuRestockedEvent.eventData.sku is undefined`, async () => {
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

  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.eventData.sku is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingSkuRestockedEvent.eventData.sku is null`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.eventData.units edge cases
   ************************************************************/
  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.eventData.units is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingSkuRestockedEvent.eventData.units is undefined`, async () => {
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

  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.eventData.units is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingSkuRestockedEvent.eventData.units is null`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent.eventData.lotId edge cases
   ************************************************************/
  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.eventData.lotId is undefined`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.lotId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingSkuRestockedEvent.eventData.lotId is undefined`, async () => {
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

  it(`fails to call RestockSkuWorkerService.restockSku if the input
      IncomingSkuRestockedEvent.eventData.lotId is null`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockId = 'AA'
    const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent(mockId)
    mockIncomingSkuRestockedEvent.eventData.lotId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingSkuRestockedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      IncomingSkuRestockedEvent.eventData.lotId is null`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls RestockSkuWorkerService.restockSku a single time for an SQSEvent with a
      single record`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await restockSkuWorkerController.restockSkus(mockSqsEvent)
    expect(mockRestockSkuWorkerService.restockSku).toHaveBeenCalledTimes(1)
  })

  it(`calls RestockSkuWorkerService.restockSku a multiple times for an SQSEvent with a
      multiple records`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test transient/non-transient edge cases
   ************************************************************/
  it(`returns no SQSBatchItemFailures if the RestockSkuWorkerService returns no
      Failure`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_succeeds()
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the RestockSkuWorkerService returns a
      non-transient Failure (test 1)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData({ transient: false })
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the RestockSkuWorkerService returns a
      non-transient Failure (test 2)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData({ transient: false })
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the RestockSkuWorkerService returns a
      non-transient Failure (test 3)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData({ transient: false })
    const restockSkuWorkerController = new RestockSkuWorkerController(mockRestockSkuWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await restockSkuWorkerController.restockSkus(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the RestockSkuWorkerService returns a
      transient Failure (test 1)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData({ transient: true })
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

  it(`returns expected SQSBatchItemFailures if the RestockSkuWorkerService returns a
      transient Failure (test 2)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData({ transient: true })
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

  it(`returns expected SQSBatchItemFailures if the RestockSkuWorkerService returns a
      transient Failure (test 3)`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData({ transient: true })
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

  it(`returns all SQSBatchItemFailures if the RestockSkuWorkerService throws all and
      only transient Failure`, async () => {
    const mockRestockSkuWorkerService = buildMockRestockSkuWorkerService_failsOnData({ transient: true })
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
