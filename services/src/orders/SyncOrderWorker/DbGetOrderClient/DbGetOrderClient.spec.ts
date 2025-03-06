import { DynamoDBDocumentClient, GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Result } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { GetOrderCommand } from '../model/GetOrderCommand'
import { DbGetOrderClient } from './DbGetOrderClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockOrderId = 'mockOrderId'

const mockValidCommand: GetOrderCommand = {
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

const expectedOrderData: OrderData = {
  orderId: mockOrderId,
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: 'mockSku',
  units: 2,
  price: 5.55,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: 'mockUpdatedAt',
}

function buildMockDdbDocClient_send_resolves_validItem(): DynamoDBDocumentClient {
  const mockGetCommandResult: GetCommandOutput = {
    Item: expectedOrderData,
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

describe(`Orders Service SyncOrderWorker DbGetOrderClient tests`, () => {
  //
  // Test GetOrderCommand edge cases
  //
  it(`returns a Success if the input GetOrderCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const result = await dbGetOrderClient.getOrder(mockValidCommand)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const mockTestCommand = undefined as GetOrderCommand
    const result = await dbGetOrderClient.getOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const mockTestCommand = null as GetOrderCommand
    const result = await dbGetOrderClient.getOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  // it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
  //     GetOrderCommand is empty`, async () => {
  //   const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
  //   const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
  //   const mockTestCommand = {} as GetOrderCommand
  //   const result = await dbGetOrderClient.getOrder(mockTestCommand)
  //   expect(Result.isFailure(result)).toBe(true)
  //   expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
  //   expect(Result.isFailureTransient(result)).toBe(false)
  // })

  // it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
  //     GetOrderCommand.orderId is undefined`, async () => {
  //   const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
  //   const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
  //   const mockTestCommand = { orderId: undefined } as GetOrderCommand
  //   const result = await dbGetOrderClient.getOrder(mockTestCommand)
  //   expect(Result.isFailure(result)).toBe(true)
  //   expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
  //   expect(Result.isFailureTransient(result)).toBe(false)
  // })

  // it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
  //     GetOrderCommand.orderId is null`, async () => {
  //   const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
  //   const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
  //   const mockTestCommand = { orderId: null } as GetOrderCommand
  //   const result = await dbGetOrderClient.getOrder(mockTestCommand)
  //   expect(Result.isFailure(result)).toBe(true)
  //   expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
  //   expect(Result.isFailureTransient(result)).toBe(false)
  // })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await dbGetOrderClient.getOrder(mockValidCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await dbGetOrderClient.getOrder(mockValidCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`returns a transient failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws a generic Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const result = await dbGetOrderClient.getOrder(mockValidCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  //
  // Test expected results
  //
  it(`returns a Success<null> DynamoDBDocumentClient.send returns a null item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_nullItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const result = await dbGetOrderClient.getOrder(mockValidCommand)
    const expectedResult = Result.makeSuccess(null)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected OrderData if DynamoDBDocumentClient.send returns a valid item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const result = await dbGetOrderClient.getOrder(mockValidCommand)
    const expectedResult = Result.makeSuccess(expectedOrderData)
    expect(result).toStrictEqual(expectedResult)
  })
})
