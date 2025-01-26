import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, NativeAttributeValue, UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { OrderError } from '../../errors/OrderError'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { UpdateOrderCommand } from '../model/UpdateOrderCommand'
import { DbUpdateOrderClient } from './DbUpdateOrderClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.ORDER_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockValidCommand: UpdateOrderCommand = {
  orderData: {
    orderId: 'mockOrderId',
    orderStatus: OrderStatus.ORDER_CREATED_STATUS,
    updatedAt: mockDate,
  },
}

const expectedDdbDocClientInput = new UpdateCommand({
  TableName: mockEventStoreTableName,
  Key: {
    pk: `ORDER_ID#${mockValidCommand.orderData.orderId}`,
    sk: `ORDER_ID#${mockValidCommand.orderData.orderId}`,
  },
  UpdateExpression: 'SET #orderStatus = :orderStatus, #updatedAt = :updatedAt',
  ExpressionAttributeNames: {
    '#orderStatus': 'orderStatus',
    '#updatedAt': 'updatedAt',
  },
  ExpressionAttributeValues: {
    ':orderStatus': mockValidCommand.orderData.orderStatus,
    ':updatedAt': mockValidCommand.orderData.updatedAt,
  },
  ConditionExpression: '#orderStatus <> :orderStatus',
  ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
  ReturnValues: 'ALL_NEW',
})

const expectedUpdatedOrderData: OrderData = {
  orderId: mockValidCommand.orderData.orderId,
  orderStatus: mockValidCommand.orderData.orderStatus,
  sku: 'mockSku',
  quantity: 2,
  price: 3.98,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: mockValidCommand.orderData.updatedAt,
}

function buildMockDdbDocClient_send_resolves(): DynamoDBDocumentClient {
  const mockSendReturnValues: UpdateCommandOutput = {
    Attributes: {
      orderId: expectedUpdatedOrderData.orderId,
      orderStatus: expectedUpdatedOrderData.orderStatus,
      sku: expectedUpdatedOrderData.sku,
      quantity: expectedUpdatedOrderData.quantity,
      price: expectedUpdatedOrderData.price,
      userId: expectedUpdatedOrderData.userId,
      createdAt: expectedUpdatedOrderData.createdAt,
      updatedAt: expectedUpdatedOrderData.updatedAt,
    },
  } as unknown as UpdateCommandOutput
  return { send: jest.fn().mockResolvedValue(mockSendReturnValues) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException(): DynamoDBDocumentClient {
  const mockErrorReturnItem: Record<string, NativeAttributeValue> = {
    orderId: expectedUpdatedOrderData.orderId,
    orderStatus: expectedUpdatedOrderData.orderStatus,
    sku: expectedUpdatedOrderData.sku,
    quantity: expectedUpdatedOrderData.quantity,
    price: expectedUpdatedOrderData.price,
    userId: expectedUpdatedOrderData.userId,
    createdAt: expectedUpdatedOrderData.createdAt,
    updatedAt: expectedUpdatedOrderData.updatedAt,
  } as unknown as UpdateCommandOutput
  const error: Error = new Error()
  error.name = OrderError.ConditionalCheckFailedException
  ;(error as ConditionalCheckFailedException).Item = marshall(mockErrorReturnItem)
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

describe('Orders Service SyncOrderWorker DbUpdateOrderClient tests', () => {
  //
  // Test UpdateOrderCommand edge cases
  //
  it('does not throw if the input UpdateOrderCommand is valid', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await expect(dbUpdateOrderClient.updateOrder(mockValidCommand)).resolves.not.toThrow()
  })

  it('throws if the input UpdateOrderCommand is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = undefined as UpdateOrderCommand
    await expect(dbUpdateOrderClient.updateOrder(mockTestCommand)).rejects.toThrow()
  })

  it('throws if the input UpdateOrderCommand is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = null as UpdateOrderCommand
    await expect(dbUpdateOrderClient.updateOrder(mockTestCommand)).rejects.toThrow()
  })

  it('throws if the input UpdateOrderCommand is empty', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = {} as UpdateOrderCommand
    await expect(dbUpdateOrderClient.updateOrder(mockTestCommand)).rejects.toThrow()
  })

  it('throws if the input UpdateOrderCommand.orderData is undefined', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = { orderData: undefined } as UpdateOrderCommand
    await expect(dbUpdateOrderClient.updateOrder(mockTestCommand)).rejects.toThrow()
  })

  it('throws if the input UpdateOrderCommand.orderData is null', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = { orderData: null } as UpdateOrderCommand
    await expect(dbUpdateOrderClient.updateOrder(mockTestCommand)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it('calls DynamoDBDocumentClient.send a single time', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await dbUpdateOrderClient.updateOrder(mockValidCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it('calls DynamoDBDocumentClient.send with the expected input', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await dbUpdateOrderClient.updateOrder(mockValidCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it('throws if DynamoDBDocumentClient.send throws', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await expect(dbUpdateOrderClient.updateOrder(mockValidCommand)).rejects.toThrow()
  })

  //
  // Test expected results
  //
  it('returns the expected OrderData existing in the database if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException error', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const existingOrderData = await dbUpdateOrderClient.updateOrder(mockValidCommand)
    expect(existingOrderData).toStrictEqual(expectedUpdatedOrderData)
  })

  it('returns the expected OrderData updated into the database', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const orderData = await dbUpdateOrderClient.updateOrder(mockValidCommand)
    expect(orderData).toStrictEqual(expectedUpdatedOrderData)
  })
})
