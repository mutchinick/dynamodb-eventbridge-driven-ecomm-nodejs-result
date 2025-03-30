import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, NativeAttributeValue, UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { UpdateOrderCommand } from '../model/UpdateOrderCommand'
import { DbUpdateOrderClient } from './DbUpdateOrderClient'

const mockOrdersTableName = 'mockOrdersTableName'

process.env.ORDERS_TABLE_NAME = mockOrdersTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockIncomingEventName = OrderEventName.ORDER_STOCK_ALLOCATED_EVENT
const mockOrderId = 'mockOrderId'
const mockExistingOrderStatus = OrderStatus.ORDER_CREATED_STATUS
const mockNewOrderStatus = OrderStatus.ORDER_STOCK_ALLOCATED_STATUS
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'

function buildMockUpdateOrderCommand(): TypeUtilsMutable<UpdateOrderCommand> {
  const mockClass = UpdateOrderCommand.validateAndBuild({
    existingOrderData: {
      orderId: mockOrderId,
      orderStatus: mockExistingOrderStatus,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockDate,
      updatedAt: mockDate,
    },
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

const mockUpdateOrderCommand = buildMockUpdateOrderCommand()

function buildMockDdbCommand(): UpdateCommand {
  const ddbCommand = new UpdateCommand({
    TableName: mockOrdersTableName,
    Key: {
      pk: `ORDERS#ORDER_ID#${mockOrderId}`,
      sk: `ORDER_ID#${mockOrderId}`,
    },
    UpdateExpression: 'SET #orderStatus = :orderStatus, #updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#orderStatus': 'orderStatus',
      '#updatedAt': 'updatedAt',
    },
    ExpressionAttributeValues: {
      ':orderStatus': mockNewOrderStatus,
      ':updatedAt': mockDate,
    },
    ConditionExpression: '#orderStatus <> :orderStatus',
    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
    ReturnValues: 'ALL_NEW',
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

//
// Mock clients
//
const expectedUpdatedOrderData: OrderData = {
  orderId: mockUpdateOrderCommand.orderData.orderId,
  orderStatus: mockUpdateOrderCommand.orderData.orderStatus,
  sku: 'mockSku',
  units: 2,
  price: 3.98,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: mockUpdateOrderCommand.orderData.updatedAt,
}

function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  const mockSendReturnValues: UpdateCommandOutput = {
    Attributes: {
      orderId: expectedUpdatedOrderData.orderId,
      orderStatus: expectedUpdatedOrderData.orderStatus,
      sku: expectedUpdatedOrderData.sku,
      units: expectedUpdatedOrderData.units,
      price: expectedUpdatedOrderData.price,
      userId: expectedUpdatedOrderData.userId,
      createdAt: expectedUpdatedOrderData.createdAt,
      updatedAt: expectedUpdatedOrderData.updatedAt,
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

describe(`Orders Service SyncOrderWorker DbUpdateOrderClient tests`, () => {
  //
  // Test UpdateOrderCommand edge cases
  //
  it(`returns a Success if the input UpdateOrderCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const result = await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = undefined as UpdateOrderCommand
    const result = await dbUpdateOrderClient.updateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = null as UpdateOrderCommand
    const result = await dbUpdateOrderClient.updateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommand.orderData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockUpdateOrderCommand()
    mockTestCommand.orderData = undefined
    const result = await dbUpdateOrderClient.updateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommand.orderData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockUpdateOrderCommand()
    mockTestCommand.orderData = undefined
    const result = await dbUpdateOrderClient.updateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const result = await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
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
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const result = await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    const expectedResult = Result.makeSuccess(expectedExistingOrderData)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<OrderData> updated in the database`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const result = await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    const expectedResult = Result.makeSuccess(expectedUpdatedOrderData)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
