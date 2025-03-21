import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'
import { EsRaiseSkuRestockedEventClient } from './EsRaiseSkuRestockedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

function buildMockSkuRestockedEvent(): TypeUtilsMutable<SkuRestockedEvent> {
  const mockClass = SkuRestockedEvent.validateAndBuild({
    sku: 'mockSku',
    units: 2,
    lotId: 'mockLotId',
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockSkuRestockedEvent = buildMockSkuRestockedEvent()

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `SKU#${mockSkuRestockedEvent.eventData.sku}`,
    sk: `EVENT#${mockSkuRestockedEvent.eventName}#LOT_ID#${mockSkuRestockedEvent.eventData.lotId}`,
    _tn: '#EVENT',
    ...mockSkuRestockedEvent,
  },
  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
})

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
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws a generic Error`, async () => {
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
