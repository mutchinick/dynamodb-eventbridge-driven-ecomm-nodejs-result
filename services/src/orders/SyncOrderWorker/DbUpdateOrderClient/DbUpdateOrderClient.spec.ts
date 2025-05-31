import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'
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

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

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

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
const expectedUpdatedOrderData: OrderData = {
  orderId: `${mockOrderId}-retrieved-updated`,
  orderStatus: `${mockNewOrderStatus}-retrieved-updated` as never,
  sku: `${mockSku}-retrieved-updated`,
  units: `${mockUnits}-retrieved-updated` as never,
  price: `${mockPrice}-retrieved-updated` as never,
  userId: `${mockUserId}-retrieved-updated`,
  createdAt: `mockCreatedDate-retrieved-updated`,
  updatedAt: `${mockDate}-retrieved-updated`,
}

function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  const mockSendReturnValues: UpdateCommandOutput = {
    Attributes: { ...expectedUpdatedOrderData },
  } as unknown as UpdateCommandOutput
  return { send: jest.fn().mockResolvedValue(mockSendReturnValues) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

const expectedExistingOrderData: OrderData = {
  orderId: `${mockOrderId}-retrieved-existing`,
  orderStatus: `${mockExistingOrderStatus}-retrieved-existing` as never,
  sku: `${mockSku}-retrieved-existing`,
  units: `${mockUnits}-retrieved-existing` as never,
  price: `${mockPrice}-retrieved-existing` as never,
  userId: `${mockUserId}-retrieved-existing`,
  createdAt: `mockCreatedDate-retrieved-existing`,
  updatedAt: `${mockDate}-retrieved-existing`,
}

function buildMockDdbDocClient_throws_ConditionalCheckFailedException(): DynamoDBDocumentClient {
  const mockError = new ConditionalCheckFailedException({
    $metadata: {},
    message: '',
    Item: marshall(expectedExistingOrderData),
  })
  return {
    send: jest.fn().mockRejectedValue(mockError),
  } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service SyncOrderWorker DbUpdateOrderClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test UpdateOrderCommand edge cases
   ************************************************************/
  it(`does not return a Failure if the input UpdateOrderCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const result = await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    expect(Result.isFailure(result)).toBe(false)
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
      UpdateOrderCommand is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = { ...mockUpdateOrderCommand }
    const result = await dbUpdateOrderClient.updateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test UpdateOrderCommand.commandData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockUpdateOrderCommand()
    mockTestCommand.commandData = undefined
    const result = await dbUpdateOrderClient.updateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockUpdateOrderCommand()
    mockTestCommand.commandData = null
    const result = await dbUpdateOrderClient.updateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
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

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
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
