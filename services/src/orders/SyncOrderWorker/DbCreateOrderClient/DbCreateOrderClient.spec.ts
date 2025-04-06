import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'
import { marshall, NativeAttributeValue } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { CreateOrderCommand } from '../model/CreateOrderCommand'
import { DbCreateOrderClient } from './DbCreateOrderClient'

const mockOrdersTableName = 'mockOrdersTableName'

process.env.ORDERS_TABLE_NAME = mockOrdersTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockIncomingEventName = OrderEventName.ORDER_PLACED_EVENT
const mockOrderId = 'mockOrderId'
const mockOrderStatus = OrderStatus.ORDER_CREATED_STATUS
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'

function buildMockCreateOrderCommand(): TypeUtilsMutable<CreateOrderCommand> {
  const mockClass = CreateOrderCommand.validateAndBuild({
    incomingOrderEvent: {
      eventName: mockIncomingEventName,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockCreateOrderCommand = buildMockCreateOrderCommand()

function buildMockDdbCommand(): UpdateCommand {
  const ddbCommand = new UpdateCommand({
    TableName: mockOrdersTableName,
    Key: {
      pk: `ORDERS#ORDER_ID#${mockOrderId}`,
      sk: `ORDER_ID#${mockOrderId}`,
    },
    UpdateExpression:
      'SET ' +
      '#orderId = :orderId, ' +
      '#orderStatus = :orderStatus, ' +
      '#sku = :sku, ' +
      '#units = :units, ' +
      '#price = :price, ' +
      '#userId = :userId, ' +
      '#createdAt = :createdAt, ' +
      '#updatedAt = :updatedAt, ' +
      '#_tn = :_tn, ' +
      '#_sn = :_sn, ' +
      '#gsi1pk = :gsi1pk, ' +
      '#gsi1sk = :gsi1sk',
    ExpressionAttributeNames: {
      '#orderId': 'orderId',
      '#orderStatus': 'orderStatus',
      '#sku': 'sku',
      '#units': 'units',
      '#price': 'price',
      '#userId': 'userId',
      '#createdAt': 'createdAt',
      '#updatedAt': 'updatedAt',
      '#_tn': '_tn',
      '#_sn': '_sn',
      '#gsi1pk': 'gsi1pk',
      '#gsi1sk': 'gsi1sk',
    },
    ExpressionAttributeValues: {
      ':orderId': mockOrderId,
      ':orderStatus': mockOrderStatus,
      ':sku': mockSku,
      ':units': mockUnits,
      ':price': mockPrice,
      ':userId': mockUserId,
      ':createdAt': mockDate,
      ':updatedAt': mockDate,
      ':_tn': `ORDERS#ORDER`,
      ':_sn': `ORDERS`,
      ':gsi1pk': `ORDERS#ORDER`,
      ':gsi1sk': `CREATED_AT#${mockDate}`,
    },
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
    ReturnValues: 'ALL_NEW',
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

//
// Mock clients
//
const expectedCreatedOrderData: OrderData = {
  orderId: mockCreateOrderCommand.commandData.orderId,
  orderStatus: mockCreateOrderCommand.commandData.orderStatus,
  sku: mockCreateOrderCommand.commandData.sku,
  units: mockCreateOrderCommand.commandData.units,
  price: mockCreateOrderCommand.commandData.price,
  userId: mockCreateOrderCommand.commandData.userId,
  createdAt: mockCreateOrderCommand.commandData.createdAt,
  updatedAt: mockCreateOrderCommand.commandData.updatedAt,
}

function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  const mockSendReturnValues: UpdateCommandOutput = {
    Attributes: {
      orderId: expectedCreatedOrderData.orderId,
      orderStatus: expectedCreatedOrderData.orderStatus,
      sku: expectedCreatedOrderData.sku,
      units: expectedCreatedOrderData.units,
      price: expectedCreatedOrderData.price,
      userId: expectedCreatedOrderData.userId,
      createdAt: expectedCreatedOrderData.createdAt,
      updatedAt: expectedCreatedOrderData.updatedAt,
    },
  } as unknown as UpdateCommandOutput
  return { send: jest.fn().mockResolvedValue(mockSendReturnValues) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

const expectedExistingOrderData: OrderData = {
  orderId: 'mockOrderId-Existing',
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: 'mockOrderId-Existing',
  units: 10,
  price: 77.77,
  userId: 'mockUserId-Existing',
  createdAt: 'mockCreatedAt-Existing',
  updatedAt: 'mockUpdatedAt-Existing',
}

function buildMockDdbDocClient_throws_ConditionalCheckFailedException(): DynamoDBDocumentClient {
  const mockErrorReturnItem: Record<string, NativeAttributeValue> = {
    orderId: expectedExistingOrderData.orderId,
    orderStatus: expectedExistingOrderData.orderStatus,
    sku: expectedExistingOrderData.sku,
    units: expectedExistingOrderData.units,
    price: expectedExistingOrderData.price,
    userId: expectedExistingOrderData.userId,
    createdAt: expectedExistingOrderData.createdAt,
    updatedAt: expectedExistingOrderData.updatedAt,
  } as unknown as UpdateCommandOutput
  const error = new ConditionalCheckFailedException({ $metadata: {}, message: '', Item: marshall(mockErrorReturnItem) })
  return { send: jest.fn().mockRejectedValue(error) } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service SyncOrderWorker DbCreateOrderClient tests`, () => {
  //
  // Test CreateOrderCommand edge cases
  //
  it(`returns a Success if the input CreateOrderCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const result = await dbCreateOrderClient.createOrder(mockCreateOrderCommand)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CreateOrderCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = undefined as CreateOrderCommand
    const result = await dbCreateOrderClient.createOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CreateOrderCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = null as CreateOrderCommand
    const result = await dbCreateOrderClient.createOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CreateOrderCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockCreateOrderCommand()
    mockTestCommand.commandData = undefined
    const result = await dbCreateOrderClient.createOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CreateOrderCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockCreateOrderCommand()
    mockTestCommand.commandData = null
    const result = await dbCreateOrderClient.createOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    await dbCreateOrderClient.createOrder(mockCreateOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    await dbCreateOrderClient.createOrder(mockCreateOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const result = await dbCreateOrderClient.createOrder(mockCreateOrderCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<OrderData> existing in the database if 
      DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const result = await dbCreateOrderClient.createOrder(mockCreateOrderCommand)
    const expectedResult = Result.makeSuccess(expectedExistingOrderData)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<OrderData> updated in the database`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const result = await dbCreateOrderClient.createOrder(mockCreateOrderCommand)
    const expectedResult = Result.makeSuccess(expectedCreatedOrderData)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
