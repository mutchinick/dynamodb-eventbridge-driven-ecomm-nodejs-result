// TODO: Review Result, Success, Failure usage
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Result } from '../../errors/Result'
import { WarehouseError } from '../../errors/WarehouseError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { EsRaiseOrderStockAllocatedEventClient } from './EsRaiseOrderStockAllocatedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toUTCString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockValidEvent: OrderStockAllocatedEvent = {
  eventName: WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
  createdAt: mockDate,
  updatedAt: mockDate,
  eventData: {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
  },
}

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `ORDER_ID#${mockValidEvent.eventData.orderId}`,
    sk: `EVENT#${mockValidEvent.eventName}`,
    _tn: '#EVENT',
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

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Redundant(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
    CancellationReasons: [{ Code: WarehouseError.ConditionalCheckFailedException }, null],
  })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

describe('Warehouse Service AllocateOrderStockApi EsRaiseOrderStockAllocatedEventClient tests', () => {
  //
  // Test OrderStockAllocatedEvent edge cases
  //
  //
  it('returns a non transient Failure of InvalidArgumentsError if OrderStockAllocatedEvent is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderStockAllocatedEvent
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  it('returns a non transient Failure of InvalidArgumentsError if OrderStockAllocatedEvent is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderStockAllocatedEvent
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  it('returns a non transient Failure of InvalidArgumentsError if OrderStockAllocatedEvent is empty', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = {} as OrderStockAllocatedEvent
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test transaction errors
  //
  it(`returns a non transient Failure of InvalidEventRaiseOperationError_Redundant if DynamoDBDocumentClient.send 
    throws a ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Redundant()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockValidEvent)
    expect(Result.isFailureOfKind(result, 'InvalidEventRaiseOperationError_Redundant')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it('calls DynamoDBDocumentClient.send a single time', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it('calls DynamoDBDocumentClient.send with the expected input', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it('returns a transient Failure of UnrecognizedError if DynamoDBDocumentClient.send throws', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockValidEvent)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  //
  // Test expected results
  //
  it('returns a Success if the input if the input OrderStockAllocatedEvent is valid', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockValidEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })
})
