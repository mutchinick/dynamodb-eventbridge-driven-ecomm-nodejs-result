import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Result } from '../../errors/Result'
import { RawSimulatedEvent } from '../model/RawSimulatedEvent'
import { EsRaiseRawSimulatedEventClient } from './EsRaiseRawSimulatedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toUTCString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockValidEvent: RawSimulatedEvent = {
  pk: 'mockPk',
  sk: 'mockSk',
  eventName: 'mockEventName',
  eventData: {},
  createdAt: mockDate,
  updatedAt: mockDate,
  _tn: '#EVENT',
}

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: { ...mockValidEvent },
  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
})

//
// Mock clients
//
function buildMockDdbDocClient_succeeds(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Testing Service SimulateRawEventApi EsRaiseRawSimulatedEventClient tests`, () => {
  //
  // Test RawSimulatedEvent edge cases
  //
  it(`returns a Success if the input RawSimulatedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_succeeds()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const result = await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockValidEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input RawSimulatedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_succeeds()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as never
    const result = await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input RawSimulatedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_succeeds()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const mockTestEvent = null as never
    const result = await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_succeeds()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_succeeds()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`returns a transient Failure of kind UnrecognizedError if DynamoDBDocumentClient.send throws a native Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const result = await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockValidEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateEventRaisedError if DynamoDBDocumentClient.send
      throws a ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: '' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const result = await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockValidEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateEventRaisedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected result
  //
  it(`returns a Success<void> if all components succeed`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_succeeds()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const result = await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockValidEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(Result.isSuccess(result) && result.value).toBe(undefined)
  })
})
