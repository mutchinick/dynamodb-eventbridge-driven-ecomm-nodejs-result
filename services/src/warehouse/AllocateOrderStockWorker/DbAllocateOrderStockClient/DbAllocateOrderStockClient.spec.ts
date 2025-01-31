import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { WarehouseError } from '../../errors/WarehouseError'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'
import { DbAllocateOrderStockClient } from './DbAllocateOrderStockClient'

const mockWarehouseTableName = 'mockWarehouseTableName'

process.env.WAREHOUSE_TABLE_NAME = mockWarehouseTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockAllocateOrderStockCommand: AllocateOrderStockCommand = {
  allocateOrderStockData: {
    sku: 'mockSku',
    units: 3,
    orderId: 'mockOrderId',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
}

const { sku, units, orderId, createdAt, updatedAt } = mockAllocateOrderStockCommand.allocateOrderStockData
const status = 'ALLOCATED'

const expectedTransactWriteCommand = new TransactWriteCommand({
  TransactItems: [
    {
      Update: {
        TableName: mockWarehouseTableName,
        Key: {
          pk: `SKU#${sku}`,
          sk: `SKU#${sku}`,
        },
        UpdateExpression:
          `SET ` +
          `#sku = :sku, ` +
          `#units = #units - :units, ` +
          `#createdAt = if_not_exists(#createdAt, :createdAt), ` +
          `#updatedAt = :updatedAt, ` +
          `#_tn = :_tn`,
        ExpressionAttributeNames: {
          '#sku': 'sku',
          '#units': 'units',
          '#createdAt': 'createdAt',
          '#updatedAt': 'updatedAt',
          '#_tn': '_tn',
        },
        ExpressionAttributeValues: {
          ':sku': sku,
          ':units': units,
          ':createdAt': createdAt,
          ':updatedAt': updatedAt,
          ':_tn': 'STOCK',
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk) and #units >= :units',
      },
    },
    {
      Put: {
        TableName: mockWarehouseTableName,
        Item: {
          pk: `SKU_ID#${sku}#ORDER_ID#${orderId}#STOCK_ALLOCATION`,
          sk: `SKU_ID#${sku}#ORDER_ID#${orderId}#STOCK_ALLOCATION`,
          sku,
          units,
          orderId,
          status,
          createdAt,
          updatedAt,
          _tn: 'STOCK_ALLOCATION',
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      },
    },
  ],
})

function buildMockDdbDocClient_send_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Depleted(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
    CancellationReasons: [{ Code: WarehouseError.ConditionalCheckFailedException }, null],
  })
  error.name = WarehouseError.TransactionCanceledException
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Redundant(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
    CancellationReasons: [null, { Code: WarehouseError.ConditionalCheckFailedException }],
  })
  error.name = WarehouseError.TransactionCanceledException
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Unknown(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
  })
  error.name = WarehouseError.TransactionCanceledException
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

describe('Warehouse Service AllocateOrderStockWorker DbAllocateOrderStockClient tests', () => {
  //
  // Test AllocateOrderStockCommand edge cases
  //
  it('does not throw if the input AllocateOrderStockCommand is valid', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).resolves.not.toThrow()
  })

  it('throws if the input AllocateOrderStockCommand is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockAllocateOrderStockCommand = undefined as AllocateOrderStockCommand
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow()
  })

  it('throws if the input AllocateOrderStockCommand is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockAllocateOrderStockCommand = null as AllocateOrderStockCommand
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow()
  })

  it('throws if the input AllocateOrderStockCommand is empty', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockAllocateOrderStockCommand = {} as AllocateOrderStockCommand
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow()
  })

  it('throws if the input AllocateOrderStockCommand.allocateOrderStockData is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockAllocateOrderStockCommand = { allocateOrderStockData: undefined } as AllocateOrderStockCommand
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow()
  })

  it('throws if the input AllocateOrderStockCommand.allocateOrderStockData is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockAllocateOrderStockCommand = { allocateOrderStockData: null } as AllocateOrderStockCommand
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DynamoDBDocumentClient.send a single time', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it('calls DynamoDBDocumentClient.send with the expected input', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedTransactWriteCommand.input }),
    )
  })

  it('throws if DynamoDBDocumentClient.send throws', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow()
  })

  //
  // Test transaction errors
  //
  it(
    'throws an InvalidStockAllocationOperationError_Depleted if DynamoDBDocumentClient.send throws ' +
      'a ConditionalCheckFailedException error when subtracting the sku stock',
    async () => {
      try {
        const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Depleted()
        const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
        await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
      } catch (error) {
        expect(WarehouseError.hasName(error, WarehouseError.InvalidStockAllocationOperationError_Depleted)).toBe(true)
        return
      }
      throw new Error('Test failed because no error was thrown')
    },
  )

  it(
    'throws an DoNotRetryError if DynamoDBDocumentClient.send throws ' +
      'a ConditionalCheckFailedException error when subtracting the sku stock',
    async () => {
      try {
        const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Depleted()
        const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
        await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
      } catch (error) {
        expect(WarehouseError.hasName(error, WarehouseError.DoNotRetryError)).toBe(true)
        return
      }
      throw new Error('Test failed because no error was thrown')
    },
  )

  it(
    'throws an InvalidStockAllocationOperationError_Redundant if DynamoDBDocumentClient.send throws ' +
      'a ConditionalCheckFailedException error when allocating the stock',
    async () => {
      try {
        const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Redundant()
        const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
        await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
      } catch (error) {
        expect(WarehouseError.hasName(error, WarehouseError.InvalidStockAllocationOperationError_Redundant)).toBe(true)
        return
      }
      throw new Error('Test failed because no error was thrown')
    },
  )

  it(
    'throws an DoNotRetryError if DynamoDBDocumentClient.send throws ' +
      'a ConditionalCheckFailedException error when allocating the stock',
    async () => {
      try {
        const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Redundant()
        const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
        await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
      } catch (error) {
        expect(WarehouseError.hasName(error, WarehouseError.DoNotRetryError)).toBe(true)
        return
      }
      throw new Error('Test failed because no error was thrown')
    },
  )

  it(
    'throws a TransactionCanceledException if DynamoDBDocumentClient.send throws ' +
      'a ConditionalCheckFailedException error with no cancellation reasons',
    async () => {
      try {
        const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Unknown()
        const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
        await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
      } catch (error) {
        expect(WarehouseError.hasName(error, WarehouseError.TransactionCanceledException)).toBe(true)
        return
      }
      throw new Error('Test failed because no error was thrown')
    },
  )

  it(
    'throws a DoNotRetryError if DynamoDBDocumentClient.send throws ' +
      'a ConditionalCheckFailedException error with no cancellation reasons',
    async () => {
      try {
        const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Unknown()
        const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
        await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
      } catch (error) {
        expect(WarehouseError.hasName(error, WarehouseError.DoNotRetryError)).toBe(true)
        return
      }
      throw new Error('Test failed because no error was thrown')
    },
  )

  //
  // Test expected results
  //
  it('returns a void promise', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(result).not.toBeDefined()
  })
})
