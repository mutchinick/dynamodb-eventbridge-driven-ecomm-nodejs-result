import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { OrderError } from '../../errors/OrderError'
import { OrderCreatedEvent } from '../model/OrderCreatedEvent'
import { EsRaiseOrderCreatedEventClient } from './EsRaiseOrderCreatedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockValidEvent: OrderCreatedEvent = {
  eventName: 'mockEventName' as never,
  createdAt: mockDate,
  updatedAt: mockDate,
  eventData: {
    orderId: 'mockOrderId',
    orderStatus: 'mockOrderStatus' as never,
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
}

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `ORDER_ID#${mockValidEvent.eventData.orderId}`,
    sk: `EVENT#${mockValidEvent.eventName}`,
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
  OrderError.addName(error, OrderError.ConditionalCheckFailedException)
  return { send: jest.fn().mockRejectedValue(error) } as unknown as DynamoDBDocumentClient
}

describe('Orders Service SyncOrderWorker EsRaiseOrderCreatedEventClient tests', () => {
  //
  // Test OrderCreatedEvent edge cases
  //
  it('does not throw if the input OrderCreatedEvent is valid', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    await expect(esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)).resolves.not.toThrow()
  })

  it('throws if the input OrderCreatedEvent is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderCreatedEvent
    await expect(esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)).rejects.toThrow()
  })

  it('throws if the input OrderCreatedEvent is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderCreatedEvent
    await expect(esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)).rejects.toThrow()
  })

  it('throws if the input OrderCreatedEvent is empty', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = {} as OrderCreatedEvent
    await expect(esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)).rejects.toThrow()
  })

  it('throws if the input OrderCreatedEvent.eventData is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = { eventData: undefined } as OrderCreatedEvent
    await expect(esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)).rejects.toThrow()
  })

  it('throws if the input OrderCreatedEvent.eventData is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = { eventData: null } as OrderCreatedEvent
    await expect(esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DynamoDBDocumentClient.send a single time', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it('calls DynamoDBDocumentClient.send with the expected input', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it('throws if DynamoDBDocumentClient.send throws', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    await expect(esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)).rejects.toThrow()
  })

  it('throws a InvalidEventRaiseOperationError_Redundant if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException', async () => {
    try {
      const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
      const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
      await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.InvalidEventRaiseOperationError_Redundant)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  it('throws a DoNotRetryError if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException', async () => {
    try {
      const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
      const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
      await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.DoNotRetryError)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })
})
