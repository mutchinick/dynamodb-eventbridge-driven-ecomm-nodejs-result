import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'
import { EsRaiseSkuRestockedEventClient } from './EsRaiseSkuRestockedEventClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockEventName = WarehouseEventName.SKU_RESTOCKED_EVENT
const mockSku = 'mockSku'
const mockUnits = 8
const mockLotId = 'mockLotId'

function buildMockSkuRestockedEvent(): TypeUtilsMutable<SkuRestockedEvent> {
  const mockClass = SkuRestockedEvent.validateAndBuild({
    sku: mockSku,
    units: mockUnits,
    lotId: mockLotId,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockSkuRestockedEvent = buildMockSkuRestockedEvent()

function buildMockDdbCommand(): PutCommand {
  const ddbCommand = new PutCommand({
    TableName: mockEventStoreTableName,
    Item: {
      pk: `EVENTS#SKU#${mockSku}`,
      sk: `EVENT#${mockEventName}#LOT_ID#${mockLotId}`,
      _tn: `EVENTS#EVENT`,
      _sn: `EVENTS`,
      eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
      eventData: {
        sku: mockSku,
        units: mockUnits,
        lotId: mockLotId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
      gsi1pk: `EVENTS#EVENT`,
      gsi1sk: `CREATED_AT#${mockDate}`,
    },
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

//
// Mock clients
//
function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws_ConditionalCheckFailedException(): DynamoDBDocumentClient {
  const error = new ConditionalCheckFailedException({ $metadata: {}, message: '' })
  return { send: jest.fn().mockRejectedValue(error) } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service RestockSkuApi EsRaiseSkuRestockedEventClient tests`, () => {
  //
  // Test SkuRestockedEvent edge cases
  //
  it(`returns a Success if the input SkuRestockedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const result = await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SkuRestockedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as SkuRestockedEvent
    const result = await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SkuRestockedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = null as SkuRestockedEvent
    const result = await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SkuRestockedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockSkuRestockedEvent()
    mockTestEvent.eventData = undefined
    const result = await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SkuRestockedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockSkuRestockedEvent()
    mockTestEvent.eventData = null
    const result = await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const result = await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateEventRaisedError
      if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const result = await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateEventRaisedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected result
  //
  it(`returns the expected Success<void> with the expected data`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const result = await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
