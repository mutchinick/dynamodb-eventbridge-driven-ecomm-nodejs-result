// FIXME: This component is duplicated in DeallocateOrderPaymentRejectedWorker.
// It should be moved to a common place. Will do soon.
import { DynamoDBDocumentClient, GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { GetOrderAllocationCommand } from '../model/GetOrderAllocationCommand'
import { DbGetOrderAllocationClient } from './DbGetOrderAllocationClient'

const mockInventoryTableName = 'mockInventoryTableName'

process.env.INVENTORY_TABLE_NAME = mockInventoryTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSKu'

function buildMockGetOrderAllocationCommand(): TypeUtilsMutable<GetOrderAllocationCommand> {
  const mockClass = GetOrderAllocationCommand.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockGetOrderAllocationCommand = buildMockGetOrderAllocationCommand()

function buildMockDdbCommand(): GetCommand {
  const ddbCommand = new GetCommand({
    TableName: mockInventoryTableName,
    Key: {
      pk: `INVENTORY#SKU#${mockSku}`,
      sk: `SKU#${mockSku}#ORDER_ID#${mockOrderId}#ORDER_ALLOCATION`,
    },
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
const mockExistingOrderData: OrderAllocationData = {
  orderId: mockGetOrderAllocationCommand.commandData.orderId,
  sku: mockGetOrderAllocationCommand.commandData.sku,
  units: 2,
  price: 5.55,
  userId: 'mockUserId',
  createdAt: mockDate,
  updatedAt: mockDate,
  allocationStatus: 'ALLOCATED',
}

function buildMockDdbDocClient_resolves_validItem(): DynamoDBDocumentClient {
  const mockDdbOutput: GetCommandOutput = {
    Item: mockExistingOrderData,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockDdbOutput) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_resolves_nullItem(): DynamoDBDocumentClient {
  const mockDdbOutput: GetCommandOutput = {
    Item: undefined,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockDdbOutput) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Inventory Service AllocateOrderStockWorker
          DbGetOrderAllocationClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test GetOrderAllocationCommand edge cases
   ************************************************************/
  it(`does not return a Failure if the input GetOrderAllocationCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderAllocationCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const mockTestCommand = undefined as GetOrderAllocationCommand
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderAllocationCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const mockTestCommand = null as GetOrderAllocationCommand
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderAllocationCommand is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const mockTestCommand = { ...mockGetOrderAllocationCommand }
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test GetOrderAllocationCommand.commandData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderAllocationCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const mockTestCommand = buildMockGetOrderAllocationCommand()
    mockTestCommand.commandData = undefined
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      GetOrderAllocationCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const mockTestCommand = buildMockGetOrderAllocationCommand()
    mockTestCommand.commandData = null
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockTestCommand)
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
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    await dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    await dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
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
  it(`returns the expected Success<null> if DynamoDBDocumentClient.send returns a null
      item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_nullItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
    const expectedResult = Result.makeSuccess(null)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<OrderAllocationData> if DynamoDBDocumentClient.send
      returns a valid item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
    const expectedData: OrderAllocationData = {
      orderId: mockExistingOrderData.orderId,
      sku: mockExistingOrderData.sku,
      units: mockExistingOrderData.units,
      price: mockExistingOrderData.price,
      userId: mockExistingOrderData.userId,
      createdAt: mockExistingOrderData.createdAt,
      updatedAt: mockExistingOrderData.updatedAt,
      allocationStatus: mockExistingOrderData.allocationStatus,
    }
    const expectedResult = Result.makeSuccess(expectedData)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
