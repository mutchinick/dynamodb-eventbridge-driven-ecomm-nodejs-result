import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { WarehouseError } from '../../errors/WarehouseError'
import { RestockSkuCommand } from '../model/RestockSkuCommand'
import { DbRestockSkuClient } from './DbRestockSkuClient'

const mockWarehouseTableName = 'mockWarehouseTableName'

process.env.WAREHOUSE_TABLE_NAME = mockWarehouseTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockRestockSkuCommand: RestockSkuCommand = {
  restockSkuData: {
    sku: 'mockSku',
    units: 3,
    lotId: 'mockLotId',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
}

const expectedTransactWriteCommand = new TransactWriteCommand({
  TransactItems: [
    {
      Put: {
        TableName: mockWarehouseTableName,
        Item: {
          pk: `LOT_ID#${mockRestockSkuCommand.restockSkuData.lotId}`,
          sk: `LOT_ID#${mockRestockSkuCommand.restockSkuData.lotId}`,
          sku: mockRestockSkuCommand.restockSkuData.sku,
          units: mockRestockSkuCommand.restockSkuData.units,
          lotId: mockRestockSkuCommand.restockSkuData.lotId,
          createdAt: mockRestockSkuCommand.restockSkuData.createdAt,
          updatedAt: mockRestockSkuCommand.restockSkuData.updatedAt,
          _tn: 'WAREHOUSE#LOT',
        },
        ConditionExpression: 'attribute_not_exists(pk)',
      },
    },
    {
      Update: {
        TableName: mockWarehouseTableName,
        Key: {
          pk: `SKU#${mockRestockSkuCommand.restockSkuData.sku}`,
          sk: `SKU#${mockRestockSkuCommand.restockSkuData.sku}`,
        },
        UpdateExpression:
          `SET ` +
          `#sku = :sku, ` +
          `#units = if_not_exists(#units, :zero) + :units, ` +
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
          ':sku': mockRestockSkuCommand.restockSkuData.sku,
          ':units': mockRestockSkuCommand.restockSkuData.units,
          ':createdAt': mockRestockSkuCommand.restockSkuData.createdAt,
          ':updatedAt': mockRestockSkuCommand.restockSkuData.updatedAt,
          ':zero': 0,
          ':_tn': 'WAREHOUSE#SKU',
        },
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

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Unknown(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
  })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

describe('Warehouse Service RestockSkuWorker DbRestockSkuClient tests', () => {
  //
  // Test RestockSkuCommand edge cases
  //
  it('does not throw if the input RestockSkuCommand is valid', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    await expect(dbRestockSkuClient.restockSku(mockRestockSkuCommand)).resolves.not.toThrow()
  })

  it('throws if the input RestockSkuCommand is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = undefined as RestockSkuCommand
    await expect(dbRestockSkuClient.restockSku(mockRestockSkuCommand)).rejects.toThrow()
  })

  it('throws if the input RestockSkuCommand is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = null as RestockSkuCommand
    await expect(dbRestockSkuClient.restockSku(mockRestockSkuCommand)).rejects.toThrow()
  })

  it('throws if the input RestockSkuCommand is empty', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = {} as RestockSkuCommand
    await expect(dbRestockSkuClient.restockSku(mockRestockSkuCommand)).rejects.toThrow()
  })

  it('throws if the input RestockSkuCommand.restockSkuData is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = { restockSkuData: undefined } as RestockSkuCommand
    await expect(dbRestockSkuClient.restockSku(mockRestockSkuCommand)).rejects.toThrow()
  })

  it('throws if the input RestockSkuCommand.restockSkuData is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = { restockSkuData: null } as RestockSkuCommand
    await expect(dbRestockSkuClient.restockSku(mockRestockSkuCommand)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DynamoDBDocumentClient.send a single time', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it('calls DynamoDBDocumentClient.send with the expected input', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedTransactWriteCommand.input }),
    )
  })

  it('throws if DynamoDBDocumentClient.send throws', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    await expect(dbRestockSkuClient.restockSku(mockRestockSkuCommand)).rejects.toThrow()
  })

  //
  // Test transaction errors
  //
  it(
    'throws an InvalidRestockOperationError_Redundant if DynamoDBDocumentClient.send throws ' +
      'a ConditionalCheckFailedException error when restocking the sku',
    async () => {
      try {
        const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Redundant()
        const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
        await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
      } catch (error) {
        expect(WarehouseError.hasName(error, WarehouseError.InvalidRestockOperationError_Redundant)).toBe(true)
        return
      }
      throw new Error('Test failed because no error was thrown')
    },
  )

  it(
    'throws an DoNotRetryError if DynamoDBDocumentClient.send throws ' +
      'a ConditionalCheckFailedException error when restocking the sku',
    async () => {
      try {
        const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Redundant()
        const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
        await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
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
        const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
        await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
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
        const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
        await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
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
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(result).not.toBeDefined()
  })
})
