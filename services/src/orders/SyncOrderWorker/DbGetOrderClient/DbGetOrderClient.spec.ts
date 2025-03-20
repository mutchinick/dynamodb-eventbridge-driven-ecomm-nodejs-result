import { DynamoDBDocumentClient, GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { GetOrderCommand } from '../model/GetOrderCommand'
import { DbGetOrderClient } from './DbGetOrderClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

function buildMockGetOrderCommand(): TypeUtilsMutable<GetOrderCommand> {
  const mockClass = GetOrderCommand.validateAndBuild({
    orderId: 'mockOrderId',
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockValidCommand = buildMockGetOrderCommand()

const expectedDdbDocClientInput = new GetCommand({
  TableName: mockEventStoreTableName,
  Key: {
    pk: `ORDER_ID#${mockValidCommand.orderData.orderId}`,
    sk: `ORDER_ID#${mockValidCommand.orderData.orderId}`,
  },
})

const expectedOrderData: OrderData = {
  orderId: mockValidCommand.orderData.orderId,
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: 'mockSku',
  units: 2,
  price: 5.55,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: 'mockUpdatedAt',
}

//
// Mock clients
//
function buildMockDdbDocClient_resolves_validItem(): DynamoDBDocumentClient {
  const mockGetCommandResult: GetCommandOutput = {
    Item: expectedOrderData,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockGetCommandResult) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_resolves_nullItem(): DynamoDBDocumentClient {
  const mockGetCommandResult: GetCommandOutput = {
    Item: undefined,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockGetCommandResult) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(): DynamoDBDocumentClient {
  return { syncOrder: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service SyncOrderWorker DbGetOrderClient tests`, () => {
  //
  // Test GetOrderCommand edge cases
  //
  it(`returns a Success if the input GetOrderCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const result = await dbGetOrderClient.getOrder(mockValidCommand)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const mockTestCommand = undefined as GetOrderCommand
    const result = await dbGetOrderClient.getOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const mockTestCommand = null as GetOrderCommand
    const result = await dbGetOrderClient.getOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommand.orderData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockGetOrderCommand()
    mockTestCommand.orderData = undefined
    const result = await dbGetOrderClient.getOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderCommand.orderData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockGetOrderCommand()
    mockTestCommand.orderData = null
    const result = await dbGetOrderClient.getOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await dbGetOrderClient.getOrder(mockValidCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await dbGetOrderClient.getOrder(mockValidCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws a generic Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const result = await dbGetOrderClient.getOrder(mockValidCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<null> if DynamoDBDocumentClient.send returns a null item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_nullItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const result = await dbGetOrderClient.getOrder(mockValidCommand)
    const expectedResult = Result.makeSuccess(null)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<OrderData> if DynamoDBDocumentClient.send returns a valid item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const result = await dbGetOrderClient.getOrder(mockValidCommand)
    const expectedResult = Result.makeSuccess(expectedOrderData)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
