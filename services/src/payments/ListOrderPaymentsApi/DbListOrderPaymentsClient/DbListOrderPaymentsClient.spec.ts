import { DynamoDBDocumentClient, QueryCommand, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { type SortDirection } from '../../model/SortDirection'
import { ListOrderPaymentsCommand, ListOrderPaymentsCommandInput } from '../model/ListOrderPaymentsCommand'
import { DbListOrderPaymentsClient } from './DbListOrderPaymentsClient'

const mockPaymentsTableName = 'mockPaymentsTableName'

process.env.PAYMENTS_TABLE_NAME = mockPaymentsTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSortDirection = 'desc'
const mockLimit = 30

function buildMockListOrderPaymentsCommand(
  listOrderPaymentsCommandInput: ListOrderPaymentsCommandInput,
): TypeUtilsMutable<ListOrderPaymentsCommand> {
  const mockClass = ListOrderPaymentsCommand.validateAndBuild(listOrderPaymentsCommandInput)
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockListOrderPaymentsCommand = buildMockListOrderPaymentsCommand({})

/*
 *
 *
 ************************************************************
 * By OrderId
 ************************************************************/
function buildMockDdbCommand_ByOrderId(orderId: string): QueryCommand {
  const listPk = `PAYMENTS#ORDER_ID#${orderId}`
  const listSk = `ORDER_ID#${orderId}#ORDER_PAYMENT`
  const ddbCommand = new QueryCommand({
    TableName: mockPaymentsTableName,
    KeyConditionExpression: '#pk = :pk AND #sk = :sk',
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk',
    },
    ExpressionAttributeValues: {
      ':pk': listPk,
      ':sk': listSk,
    },
  })
  return ddbCommand
}

/*
 *
 *
 ************************************************************
 * List filtered (sortDirection and limit)
 ************************************************************/
function buildMockDdbCommand_ListFiltered(sortDirection: SortDirection, limit: number): QueryCommand {
  const indexName = 'gsi1pk-gsi1sk-index'
  const listGsi1pk = `PAYMENTS#ORDER_PAYMENT`
  const ddbCommand = new QueryCommand({
    TableName: mockPaymentsTableName,
    IndexName: indexName,
    KeyConditionExpression: '#gsi1pk = :gsi1pk',
    ExpressionAttributeNames: {
      '#gsi1pk': 'gsi1pk',
    },
    ExpressionAttributeValues: {
      ':gsi1pk': listGsi1pk,
    },
    ScanIndexForward: sortDirection !== 'desc',
    Limit: limit,
  })
  return ddbCommand
}

/*
 *
 *
 ************************************************************
 * List default (no filters)
 ************************************************************/
function buildMockDdbCommand_ListDefault(): QueryCommand {
  const indexName = 'gsi1pk-gsi1sk-index'
  const listGsi1pk = `PAYMENTS#ORDER_PAYMENT`
  const ddbCommand = new QueryCommand({
    TableName: mockPaymentsTableName,
    IndexName: indexName,
    KeyConditionExpression: '#gsi1pk = :gsi1pk',
    ExpressionAttributeNames: {
      '#gsi1pk': 'gsi1pk',
    },
    ExpressionAttributeValues: {
      ':gsi1pk': listGsi1pk,
    },
    ScanIndexForward: DbListOrderPaymentsClient.DEFAULT_SORT_DIRECTION === 'asc',
    Limit: DbListOrderPaymentsClient.DEFAULT_LIMIT,
  })
  return ddbCommand
}

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
const mockExistingOrderPaymentData: OrderPaymentData[] = [
  {
    orderId: mockOrderId,
    sku: 'mockSku',
    units: 1,
    price: 100,
    userId: 'mockUserId',
    createdAt: mockDate,
    updatedAt: mockDate,
    paymentId: 'mockPaymentId',
    paymentStatus: 'mockPaymentStatus' as never,
    paymentRetries: 0,
  },
  {
    orderId: `${mockOrderId}-2`,
    sku: 'mockSku-2',
    units: 1,
    price: 100,
    userId: 'mockUserId-2',
    createdAt: mockDate,
    updatedAt: mockDate,
    paymentId: 'mockPaymentId-2',
    paymentStatus: 'mockPaymentStatus-2' as never,
    paymentRetries: 0,
  },
]

function buildMockDdbDocClient_resolves(resulting: 'many' | 'one' | 'none' = 'many'): DynamoDBDocumentClient {
  const items =
    resulting === 'many' ? mockExistingOrderPaymentData : resulting === 'one' ? [mockExistingOrderPaymentData[0]] : []
  const itemsCount = items ? items.length : 0
  const mockGetCommandResult: QueryCommandOutput = {
    Items: items,
    Count: itemsCount,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockGetCommandResult) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_resolves_nullItems(): DynamoDBDocumentClient {
  const mockGetCommandResult: QueryCommandOutput = {
    Items: null,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockGetCommandResult) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Payments Service ListOrderPaymentsApi DbListOrderPaymentsClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test ListOrderPaymentsCommand edge cases
   ************************************************************/
  it(`does not return a Failure if the input ListOrderPaymentsCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockListOrderPaymentsCommand)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const mockTestCommand = undefined as ListOrderPaymentsCommand
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const mockTestCommand = null as ListOrderPaymentsCommand
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommand is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const mockTestCommand = { ...mockListOrderPaymentsCommand }
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrderPaymentsCommand.commandData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const mockTestCommand = buildMockListOrderPaymentsCommand({})
    mockTestCommand.commandData = undefined
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrderPaymentsCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const mockTestCommand = buildMockListOrderPaymentsCommand({})
    mockTestCommand.commandData = null
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockTestCommand)
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
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    await dbListOrderPaymentsClient.listOrderPayments(mockListOrderPaymentsCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input (list by orderId)`, async () => {
    const mockTestCommand = buildMockListOrderPaymentsCommand({ orderId: mockOrderId })
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    await dbListOrderPaymentsClient.listOrderPayments(mockTestCommand)
    const expectedDdbCommand = buildMockDdbCommand_ByOrderId(mockOrderId)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`calls DynamoDBDocumentClient.send with the expected input (list filtered)`, async () => {
    const mockTestCommand = buildMockListOrderPaymentsCommand({ sortDirection: mockSortDirection, limit: mockLimit })
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    await dbListOrderPaymentsClient.listOrderPayments(mockTestCommand)
    const expectedDdbCommand = buildMockDdbCommand_ListFiltered(mockSortDirection, mockLimit)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`calls DynamoDBDocumentClient.send with the expected input (list default)`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    await dbListOrderPaymentsClient.listOrderPayments(mockListOrderPaymentsCommand)
    const expectedDdbCommand = buildMockDdbCommand_ListDefault()
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockListOrderPaymentsCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  /*
   *
   *
   ************************************************************
   * Test expected result
   ************************************************************/
  it(`returns the expected empty Success<OrderPaymentData[]> if
      DynamoDBDocumentClient.send returns Items with null items`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_nullItems()
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockListOrderPaymentsCommand)
    const expectedOrderPayments: OrderPaymentData[] = []
    const expectedResult = Result.makeSuccess(expectedOrderPayments)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected empty Success<[]> if DynamoDBDocumentClient.send returns
      Items with no items`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves('none')
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockListOrderPaymentsCommand)
    const expectedOrderPayments: OrderPaymentData[] = []
    const expectedResult = Result.makeSuccess(expectedOrderPayments)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<OrderPaymentData[]> if DynamoDBDocumentClient.send
      returns Items with one item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves('one')
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockListOrderPaymentsCommand)
    const expectedOrderPayments: OrderPaymentData[] = [
      {
        orderId: mockExistingOrderPaymentData[0].orderId,
        sku: mockExistingOrderPaymentData[0].sku,
        units: mockExistingOrderPaymentData[0].units,
        price: mockExistingOrderPaymentData[0].price,
        userId: mockExistingOrderPaymentData[0].userId,
        createdAt: mockExistingOrderPaymentData[0].createdAt,
        updatedAt: mockExistingOrderPaymentData[0].updatedAt,
        paymentId: mockExistingOrderPaymentData[0].paymentId,
        paymentStatus: mockExistingOrderPaymentData[0].paymentStatus,
        paymentRetries: mockExistingOrderPaymentData[0].paymentRetries,
      },
    ]
    const expectedResult = Result.makeSuccess(expectedOrderPayments)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<OrderPaymentData[]> if DynamoDBDocumentClient.send
      returns Items with many items`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves('many')
    const dbListOrderPaymentsClient = new DbListOrderPaymentsClient(mockDdbDocClient)
    const result = await dbListOrderPaymentsClient.listOrderPayments(mockListOrderPaymentsCommand)
    const expectedOrderPayments: OrderPaymentData[] = [
      {
        orderId: mockExistingOrderPaymentData[0].orderId,
        sku: mockExistingOrderPaymentData[0].sku,
        units: mockExistingOrderPaymentData[0].units,
        price: mockExistingOrderPaymentData[0].price,
        userId: mockExistingOrderPaymentData[0].userId,
        createdAt: mockExistingOrderPaymentData[0].createdAt,
        updatedAt: mockExistingOrderPaymentData[0].updatedAt,
        paymentId: mockExistingOrderPaymentData[0].paymentId,
        paymentStatus: mockExistingOrderPaymentData[0].paymentStatus,
        paymentRetries: mockExistingOrderPaymentData[0].paymentRetries,
      },
      {
        orderId: mockExistingOrderPaymentData[1].orderId,
        sku: mockExistingOrderPaymentData[1].sku,
        units: mockExistingOrderPaymentData[1].units,
        price: mockExistingOrderPaymentData[1].price,
        userId: mockExistingOrderPaymentData[1].userId,
        createdAt: mockExistingOrderPaymentData[1].createdAt,
        updatedAt: mockExistingOrderPaymentData[1].updatedAt,
        paymentId: mockExistingOrderPaymentData[1].paymentId,
        paymentStatus: mockExistingOrderPaymentData[1].paymentStatus,
        paymentRetries: mockExistingOrderPaymentData[1].paymentRetries,
      },
    ]
    const expectedResult = Result.makeSuccess(expectedOrderPayments)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
