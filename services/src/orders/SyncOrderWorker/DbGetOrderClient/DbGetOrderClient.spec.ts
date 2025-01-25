import { DynamoDBDocumentClient, GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { GetOrderCommand } from '../model/GetOrderCommand'
import { DbGetOrderClient } from './DbGetOrderClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockOrderId = 'mockOrderId'

const mockGetOrderCommand: GetOrderCommand = {
  orderId: mockOrderId,
  options: {},
}

const expectedDdbDocClientInput = new GetCommand({
  TableName: mockEventStoreTableName,
  Key: {
    pk: `ORDER_ID#${mockOrderId}`,
    sk: `ORDER_ID#${mockOrderId}`,
  },
})

const mockValidOrderData: OrderData = {
  orderId: mockOrderId,
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: 'mockSku',
  quantity: 2,
  price: 5.55,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: 'mockUpdatedAt',
}

function buildMockDdbDocClient_send_resolves_validItem(): DynamoDBDocumentClient {
  const mockGetCommandResult: GetCommandOutput = {
    Item: mockValidOrderData,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockGetCommandResult) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_resolves_nullItem(): DynamoDBDocumentClient {
  const mockGetCommandResult: GetCommandOutput = {
    Item: undefined,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockGetCommandResult) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws(): DynamoDBDocumentClient {
  return { syncOrder: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

describe('Orders Service SyncOrderWorker DbGetOrderClient tests', () => {
  //
  // Test internal logic
  //
  it('calls DynamoDBDocumentClient.send a single time', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await dbGetOrderClient.getOrder(mockGetOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it('calls DynamoDBDocumentClient.send with the expected input', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await dbGetOrderClient.getOrder(mockGetOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it('throws if DynamoDBDocumentClient.send throws', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await expect(dbGetOrderClient.getOrder(mockGetOrderCommand)).rejects.toThrow()
  })

  //
  // Test expected results
  //
  it('does not throw if the DynamoDBDocumentClient.send returns a null item', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_nullItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await expect(dbGetOrderClient.getOrder(mockGetOrderCommand)).resolves.not.toThrow()
  })

  it('returns null DynamoDBDocumentClient.send returns a null item', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_nullItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const expectedOrderData: OrderData = null
    const orderData = await dbGetOrderClient.getOrder(mockGetOrderCommand)
    expect(orderData).toBe(expectedOrderData)
  })

  it('returns the expected OrderData if DynamoDBDocumentClient.send returns a valid item', async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const expectedOrderData = mockValidOrderData
    const orderData = await dbGetOrderClient.getOrder(mockGetOrderCommand)
    expect(orderData).toStrictEqual(expectedOrderData)
  })
})
