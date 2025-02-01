import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { OrderError } from '../../errors/OrderError'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'
import { EsRaiseOrderPlacedEventClient } from './EsRaiseOrderPlacedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toUTCString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockValidEvent: OrderPlacedEvent = {
  eventName: OrderEventName.ORDER_PLACED_EVENT,
  createdAt: mockDate,
  updatedAt: mockDate,
  eventData: {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
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

describe('Orders Service PlaceOrderApi EsRaiseOrderPlacedEventClient tests', () => {
  //
  // Test OrderPlacedEvent edge cases
  //
  it('does not throw if the input OrderPlacedEvent is valid', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    await expect(esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockValidEvent)).resolves.not.toThrow()
  })

  it('throws if the input OrderPlacedEvent is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderPlacedEvent
    await expect(esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockTestEvent)).rejects.toThrow()
  })

  it('throws if the input OrderPlacedEvent is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderPlacedEvent
    await expect(esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockTestEvent)).rejects.toThrow()
  })

  it('throws if the input OrderPlacedEvent is empty', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const mockTestEvent = {} as OrderPlacedEvent
    await expect(esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockTestEvent)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DynamoDBDocumentClient.send a single time', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbPlaceOrderEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    await ddbPlaceOrderEventClient.raiseOrderPlacedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it('calls DynamoDBDocumentClient.send with the expected input', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbPlaceOrderEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    await ddbPlaceOrderEventClient.raiseOrderPlacedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it('throws if DynamoDBDocumentClient.send throws', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const ddbPlaceOrderEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    await expect(ddbPlaceOrderEventClient.raiseOrderPlacedEvent(mockValidEvent)).rejects.toThrow()
  })

  it('throws a InvalidEventRaiseOperationError_Redundant if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException', async () => {
    try {
      const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
      const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
      await esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockValidEvent)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.InvalidEventRaiseOperationError_Redundant)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })

  it('throws a DoNotRetryError if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException', async () => {
    try {
      const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
      const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
      await esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockValidEvent)
    } catch (error) {
      expect(OrderError.hasName(error, OrderError.DoNotRetryError)).toBe(true)
      return
    }
    throw new Error('Test failed because no error was thrown')
  })
})
