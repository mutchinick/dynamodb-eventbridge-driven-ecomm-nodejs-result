import { DynamoDBDocumentClient, QueryCommand, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { type SortDirection } from '../../model/SortDirection'
import { ListOrdersCommand, ListOrdersCommandInput } from '../model/ListOrdersCommand'
import { DbListOrdersClient } from './DbListOrdersClient'

const mockOrdersTableName = 'mockOrdersTableName'

process.env.ORDERS_TABLE_NAME = mockOrdersTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSortDirection = 'desc'
const mockLimit = 30

function buildMockListOrdersCommand(
  listOrdersCommandInput: ListOrdersCommandInput,
): TypeUtilsMutable<ListOrdersCommand> {
  const mockClass = ListOrdersCommand.validateAndBuild(listOrdersCommandInput)
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockListOrdersCommand = buildMockListOrdersCommand({})

/*
 *
 *
 ************************************************************
 * By Order Id
 ************************************************************/
function buildMockDdbCommand_ByOrderId(orderId: string): QueryCommand {
  const orderListPk = `ORDERS#ORDER_ID#${orderId}`
  const orderListSk = `ORDER_ID#${orderId}`
  const ddbCommand = new QueryCommand({
    TableName: mockOrdersTableName,
    KeyConditionExpression: '#pk = :pk AND #sk = :sk',
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk',
    },
    ExpressionAttributeValues: {
      ':pk': orderListPk,
      ':sk': orderListSk,
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
  const orderListGsi1pk = `ORDERS#ORDER`
  const ddbCommand = new QueryCommand({
    TableName: mockOrdersTableName,
    IndexName: indexName,
    KeyConditionExpression: '#gsi1pk = :gsi1pk',
    ExpressionAttributeNames: {
      '#gsi1pk': 'gsi1pk',
    },
    ExpressionAttributeValues: {
      ':gsi1pk': orderListGsi1pk,
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
  const orderListGsi1pk = `ORDERS#ORDER`
  const ddbCommand = new QueryCommand({
    TableName: mockOrdersTableName,
    IndexName: indexName,
    KeyConditionExpression: '#gsi1pk = :gsi1pk',
    ExpressionAttributeNames: {
      '#gsi1pk': 'gsi1pk',
    },
    ExpressionAttributeValues: {
      ':gsi1pk': orderListGsi1pk,
    },
    ScanIndexForward: DbListOrdersClient.DEFAULT_SORT_DIRECTION === 'asc',
    Limit: DbListOrdersClient.DEFAULT_LIMIT,
  })
  return ddbCommand
}

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
const mockExistingOrderData: OrderData[] = [
  {
    orderId: mockOrderId,
    orderStatus: OrderStatus.ORDER_CREATED_STATUS,
    sku: 'mockSku',
    units: 2,
    price: 5.55,
    userId: 'mockUserId',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
  {
    orderId: `${mockOrderId}-2`,
    orderStatus: OrderStatus.ORDER_CREATED_STATUS,
    sku: 'mockSku',
    units: 2,
    price: 5.55,
    userId: 'mockUserId',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
]

function buildMockDdbDocClient_resolves(resulting: 'many' | 'one' | 'none' = 'many'): DynamoDBDocumentClient {
  const items = resulting === 'many' ? mockExistingOrderData : resulting === 'one' ? [mockExistingOrderData[0]] : []
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

describe(`Orders Service ListOrdersApi DbListOrdersClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test ListOrdersCommand edge cases
   ************************************************************/
  it(`does not return a Failure if the input ListOrdersCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const result = await dbListOrdersClient.listOrders(mockListOrdersCommand)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrdersCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const mockTestCommand = undefined as ListOrdersCommand
    const result = await dbListOrdersClient.listOrders(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrdersCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const mockTestCommand = null as ListOrdersCommand
    const result = await dbListOrdersClient.listOrders(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrdersCommand is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const mockTestCommand = { ...mockListOrdersCommand }
    const result = await dbListOrdersClient.listOrders(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrdersCommand.commandData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrdersCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const mockTestCommand = buildMockListOrdersCommand({})
    mockTestCommand.commandData = undefined
    const result = await dbListOrdersClient.listOrders(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      ListOrdersCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const mockTestCommand = buildMockListOrdersCommand({})
    mockTestCommand.commandData = null
    const result = await dbListOrdersClient.listOrders(mockTestCommand)
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
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    await dbListOrdersClient.listOrders(mockListOrdersCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input (list by orderId)`, async () => {
    const mockTestCommand = buildMockListOrdersCommand({ orderId: mockOrderId })
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    await dbListOrdersClient.listOrders(mockTestCommand)
    const expectedDdbCommand = buildMockDdbCommand_ByOrderId(mockOrderId)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`calls DynamoDBDocumentClient.send with the expected input (list filtered)`, async () => {
    const mockTestCommand = buildMockListOrdersCommand({ sortDirection: mockSortDirection, limit: mockLimit })
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    await dbListOrdersClient.listOrders(mockTestCommand)
    const expectedDdbCommand = buildMockDdbCommand_ListFiltered(mockSortDirection, mockLimit)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`calls DynamoDBDocumentClient.send with the expected input (list default)`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    await dbListOrdersClient.listOrders(mockListOrdersCommand)
    const expectedDdbCommand = buildMockDdbCommand_ListDefault()
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const result = await dbListOrdersClient.listOrders(mockListOrdersCommand)
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
  it(`returns the expected empty Success<OrderData[]> if DynamoDBDocumentClient.send
      returns Items with null items`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_nullItems()
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const result = await dbListOrdersClient.listOrders(mockListOrdersCommand)
    const expectedOrders: OrderData[] = []
    const expectedResult = Result.makeSuccess(expectedOrders)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected empty Success<[]> if DynamoDBDocumentClient.send returns
      Items with no items`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves('none')
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const result = await dbListOrdersClient.listOrders(mockListOrdersCommand)
    const expectedOrders: OrderData[] = []
    const expectedResult = Result.makeSuccess(expectedOrders)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<OrderData[]> if DynamoDBDocumentClient.send returns
      Items with one item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves('one')
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const result = await dbListOrdersClient.listOrders(mockListOrdersCommand)
    const expectedOrders: OrderData[] = [
      {
        orderId: mockExistingOrderData[0].orderId,
        orderStatus: mockExistingOrderData[0].orderStatus,
        sku: mockExistingOrderData[0].sku,
        units: mockExistingOrderData[0].units,
        price: mockExistingOrderData[0].price,
        userId: mockExistingOrderData[0].userId,
        createdAt: mockExistingOrderData[0].createdAt,
        updatedAt: mockExistingOrderData[0].updatedAt,
      },
    ]
    const expectedResult = Result.makeSuccess(expectedOrders)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<OrderData[]> if DynamoDBDocumentClient.send returns
      Items with many items`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves('many')
    const dbListOrdersClient = new DbListOrdersClient(mockDdbDocClient)
    const result = await dbListOrdersClient.listOrders(mockListOrdersCommand)
    const expectedOrders: OrderData[] = [
      {
        orderId: mockExistingOrderData[0].orderId,
        orderStatus: mockExistingOrderData[0].orderStatus,
        sku: mockExistingOrderData[0].sku,
        units: mockExistingOrderData[0].units,
        price: mockExistingOrderData[0].price,
        userId: mockExistingOrderData[0].userId,
        createdAt: mockExistingOrderData[0].createdAt,
        updatedAt: mockExistingOrderData[0].updatedAt,
      },
      {
        orderId: mockExistingOrderData[1].orderId,
        orderStatus: mockExistingOrderData[1].orderStatus,
        sku: mockExistingOrderData[1].sku,
        units: mockExistingOrderData[1].units,
        price: mockExistingOrderData[1].price,
        userId: mockExistingOrderData[1].userId,
        createdAt: mockExistingOrderData[1].createdAt,
        updatedAt: mockExistingOrderData[1].updatedAt,
      },
    ]
    const expectedResult = Result.makeSuccess(expectedOrders)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
