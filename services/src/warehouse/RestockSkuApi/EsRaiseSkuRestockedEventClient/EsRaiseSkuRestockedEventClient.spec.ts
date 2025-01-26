import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { WarehouseError } from '../../errors/WarehouseError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'
import { EsRaiseSkuRestockedEventClient } from './EsRaiseSkuRestockedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toUTCString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockValidEvent: SkuRestockedEvent = {
  eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
  createdAt: mockDate,
  updatedAt: mockDate,
  eventData: {
    sku: 'mockSku',
    units: 2,
    lotId: 'mockLotId',
  },
}

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `SKU#${mockValidEvent.eventData.sku}`,
    sk: `EVENT#${mockValidEvent.eventName}#LOT_ID${mockValidEvent.eventData.lotId}`,
    _tn: 'EVENT',
    ...mockValidEvent,
  },
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
  WarehouseError.addName(error, WarehouseError.ConditionalCheckFailedException)
  return { send: jest.fn().mockRejectedValue(error) } as unknown as DynamoDBDocumentClient
}

describe('Warehouse Service RestockSkuApi EsRaiseSkuRestockedEventClient tests', () => {
  //
  // Test SkuRestockedEvent edge cases
  //
  it('does not throw if the input SkuRestockedEvent is valid', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    await expect(esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockValidEvent)).resolves.not.toThrow()
  })

  it('throws if the input SkuRestockedEvent is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as SkuRestockedEvent
    await expect(esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)).rejects.toThrow()
  })

  it('throws if the input SkuRestockedEvent is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = null as SkuRestockedEvent
    await expect(esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)).rejects.toThrow()
  })

  it('throws if the input SkuRestockedEvent is empty', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = {} as SkuRestockedEvent
    await expect(esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DynamoDBDocumentClient.send a single time', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbRestockSkuEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    await ddbRestockSkuEventClient.raiseSkuRestockedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it('calls DynamoDBDocumentClient.send with the expected input', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbRestockSkuEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    await ddbRestockSkuEventClient.raiseSkuRestockedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it('throws if DynamoDBDocumentClient.send throws', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const ddbRestockSkuEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    await expect(ddbRestockSkuEventClient.raiseSkuRestockedEvent(mockValidEvent)).rejects.toThrow()
  })

  it('throws a InvalidEventRaiseOperationError_Redundant if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException', async () => {
    try {
      const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
      const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
      await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockValidEvent)
    } catch (error) {
      expect(WarehouseError.hasName(error, WarehouseError.InvalidEventRaiseOperationError_Redundant)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  it('throws a DoNotRetryError if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException', async () => {
    try {
      const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
      const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
      await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockValidEvent)
    } catch (error) {
      expect(WarehouseError.hasName(error, WarehouseError.DoNotRetryError)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })
})
