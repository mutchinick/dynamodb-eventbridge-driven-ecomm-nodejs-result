import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { AllocationStatus } from '../../model/AllocationStatus'
import { InventoryEventName } from '../../model/InventoryEventName'
import { DeallocateOrderPaymentRejectedCommand } from '../model/DeallocateOrderPaymentRejectedCommand'
import { DbDeallocateOrderPaymentRejectedClient } from './DbDeallocateOrderPaymentRejectedClient'

const mockInventoryTableName = 'mockInventoryTableName'

process.env.INVENTORY_TABLE_NAME = mockInventoryTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = InventoryEventName.ORDER_PAYMENT_REJECTED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'
const mockNewAllocationStatus: AllocationStatus = 'DEALLOCATED_PAYMENT_REJECTED'
const mockExpectedAllocationStatus: AllocationStatus = 'ALLOCATED'

function buildMockDeallocateOrderPaymentRejectedCommand(): TypeUtilsMutable<DeallocateOrderPaymentRejectedCommand> {
  const mockClass = DeallocateOrderPaymentRejectedCommand.validateAndBuild({
    existingOrderAllocationData: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockDate,
      updatedAt: mockDate,
      allocationStatus: mockExpectedAllocationStatus,
    },
    incomingOrderPaymentRejectedEvent: {
      eventName: mockEventName,
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

const mockDeallocateOrderPaymentRejectedCommand = buildMockDeallocateOrderPaymentRejectedCommand()

function buildMockDdbCommand(): TransactWriteCommand {
  const ddbCommand = new TransactWriteCommand({
    TransactItems: [
      {
        Update: {
          TableName: mockInventoryTableName,
          Key: {
            pk: `INVENTORY#SKU#${mockSku}`,
            sk: `SKU#${mockSku}#ORDER_ID#${mockOrderId}#ORDER_ALLOCATION`,
          },
          UpdateExpression: 'SET #allocationStatus = :newAllocationStatus, #updatedAt = :updatedAt',
          ExpressionAttributeNames: {
            '#orderId': 'orderId',
            '#sku': 'sku',
            '#units': 'units',
            '#updatedAt': 'updatedAt',
            '#allocationStatus': 'allocationStatus',
          },
          ExpressionAttributeValues: {
            ':orderId': mockOrderId,
            ':sku': mockSku,
            ':units': mockUnits,
            ':updatedAt': mockDate,
            ':newAllocationStatus': mockNewAllocationStatus,
            ':expectedAllocationStatus': mockExpectedAllocationStatus,
          },
          ConditionExpression:
            'attribute_exists(pk) AND ' +
            'attribute_exists(sk) AND ' +
            '#orderId = :orderId AND ' +
            '#sku = :sku AND ' +
            '#units = :units AND ' +
            '#allocationStatus = :expectedAllocationStatus',
        },
      },
      {
        Update: {
          TableName: mockInventoryTableName,
          Key: {
            pk: `INVENTORY#SKU#${mockSku}`,
            sk: `SKU#${mockSku}`,
          },
          UpdateExpression: 'SET #units = #units + :units, #updatedAt = :updatedAt',
          ExpressionAttributeNames: {
            '#units': 'units',
            '#updatedAt': 'updatedAt',
          },
          ExpressionAttributeValues: {
            ':units': mockUnits,
            ':updatedAt': mockDate,
          },
          ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
        },
      },
    ],
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
function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Inventory Service DeallocateOrderPaymentRejectedWorker
          DbDeallocateOrderPaymentRejectedClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test DeallocateOrderPaymentRejectedCommand edge cases
   ************************************************************/
  it(`does not return a Failure if the input DeallocateOrderPaymentRejectedCommand is
      valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    const result = await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(
      mockDeallocateOrderPaymentRejectedCommand,
    )
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    const mockTestCommand = undefined as DeallocateOrderPaymentRejectedCommand
    const result = await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    const mockTestCommand = null as DeallocateOrderPaymentRejectedCommand
    const result = await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommand is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    const mockTestCommand = { ...mockDeallocateOrderPaymentRejectedCommand }
    const result = await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test DeallocateOrderPaymentRejectedCommand.commandData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    const mockTestCommand = buildMockDeallocateOrderPaymentRejectedCommand()
    mockTestCommand.commandData = undefined
    const result = await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    const mockTestCommand = buildMockDeallocateOrderPaymentRejectedCommand()
    mockTestCommand.commandData = null
    const result = await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(mockTestCommand)
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
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(mockDeallocateOrderPaymentRejectedCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(mockDeallocateOrderPaymentRejectedCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    const result = await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(
      mockDeallocateOrderPaymentRejectedCommand,
    )
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidStockDeallocationError if
      DynamoDBDocumentClient.send throws a TransactionCanceledException error when
      deallocating the stock`, async () => {
    const mockError: Error = new TransactionCanceledException({ $metadata: {}, message: '' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    const result = await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(
      mockDeallocateOrderPaymentRejectedCommand,
    )
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidStockDeallocationError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<void> if the execution path is successful`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbDeallocateOrderPaymentRejectedClient = new DbDeallocateOrderPaymentRejectedClient(mockDdbDocClient)
    const result = await dbDeallocateOrderPaymentRejectedClient.deallocateOrder(
      mockDeallocateOrderPaymentRejectedCommand,
    )
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
