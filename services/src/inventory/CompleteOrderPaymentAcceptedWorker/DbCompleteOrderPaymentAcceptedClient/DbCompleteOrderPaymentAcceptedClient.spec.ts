import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { AllocationStatus } from '../../model/AllocationStatus'
import { InventoryEventName } from '../../model/InventoryEventName'
import { CompleteOrderPaymentAcceptedCommand } from '../model/CompleteOrderPaymentAcceptedCommand'
import { DbCompleteOrderPaymentAcceptedClient } from './DbCompleteOrderPaymentAcceptedClient'

const mockInventoryTableName = 'mockInventoryTableName'

process.env.INVENTORY_TABLE_NAME = mockInventoryTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'
const mockNewAllocationStatus: AllocationStatus = 'COMPLETED_PAYMENT_ACCEPTED'
const mockExpectedAllocationStatus: AllocationStatus = 'ALLOCATED'

function buildMockCompleteOrderPaymentAcceptedCommand(): TypeUtilsMutable<CompleteOrderPaymentAcceptedCommand> {
  const mockClass = CompleteOrderPaymentAcceptedCommand.validateAndBuild({
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
    incomingOrderPaymentAcceptedEvent: {
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

const mockCompleteOrderPaymentAcceptedCommand = buildMockCompleteOrderPaymentAcceptedCommand()

function buildMockDdbCommand(): UpdateCommand {
  const ddbCommand = new UpdateCommand({
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

describe(`Inventory Service CompleteOrderPaymentAcceptedWorker
          DbCompleteOrderPaymentAcceptedClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommand edge cases
   ************************************************************/
  it(`does not return a Failure if the input CompleteOrderPaymentAcceptedCommand is
      valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const result = await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const mockTestCommand = undefined as CompleteOrderPaymentAcceptedCommand
    const result = await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const mockTestCommand = null as CompleteOrderPaymentAcceptedCommand
    const result = await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommand is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const mockTestCommand = { ...mockCompleteOrderPaymentAcceptedCommand }
    const result = await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommand.commandData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const mockTestCommand = buildMockCompleteOrderPaymentAcceptedCommand()
    mockTestCommand.commandData = undefined
    const result = await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const mockTestCommand = buildMockCompleteOrderPaymentAcceptedCommand()
    mockTestCommand.commandData = null
    const result = await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockTestCommand)
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
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const result = await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidStockCompletionError if
      DynamoDBDocumentClient.send throws a ConditionalCheckFailedException error when
      completing the stock`, async () => {
    const mockError: Error = new ConditionalCheckFailedException({ $metadata: {}, message: '' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const result = await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidStockCompletionError')).toBe(true)
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
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const result = await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
