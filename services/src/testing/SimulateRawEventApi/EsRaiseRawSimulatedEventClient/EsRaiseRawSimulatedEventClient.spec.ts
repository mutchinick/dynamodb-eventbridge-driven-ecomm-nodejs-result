import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TestingError } from '../../errors/TestingError'
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

function buildMockDdbDocClient_send_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException(): DynamoDBDocumentClient {
  const error = new Error()
  TestingError.addName(error, TestingError.ConditionalCheckFailedException)
  return { send: jest.fn().mockRejectedValue(error) } as unknown as DynamoDBDocumentClient
}

describe('Testing Service SimulateRawEventApi EsRaiseRawSimulatedEventClient tests', () => {
  //
  // Test RawSimulatedEvent edge cases
  //
  it('does not throw if the input RawSimulatedEvent is valid', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    await expect(ddbRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockValidEvent)).resolves.not.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DynamoDBDocumentClient.send a single time', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbSimulateRawEventEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    await ddbSimulateRawEventEventClient.raiseRawSimulatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it('calls DynamoDBDocumentClient.send with the expected input', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbSimulateRawEventEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    await ddbSimulateRawEventEventClient.raiseRawSimulatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it('throws if DynamoDBDocumentClient.send throws', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const ddbSimulateRawEventEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    await expect(ddbSimulateRawEventEventClient.raiseRawSimulatedEvent(mockValidEvent)).rejects.toThrow()
  })

  it('throws a InvalidEventRaiseOperationError_Redundant if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException', async () => {
    try {
      const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
      const ddbRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
      await ddbRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockValidEvent)
    } catch (error) {
      expect(TestingError.hasName(error, TestingError.InvalidEventRaiseOperationError_Redundant)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  it('throws a DoNotRetryError if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException', async () => {
    try {
      const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
      const ddbRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
      await ddbRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockValidEvent)
    } catch (error) {
      expect(TestingError.hasName(error, TestingError.DoNotRetryError)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })
})
