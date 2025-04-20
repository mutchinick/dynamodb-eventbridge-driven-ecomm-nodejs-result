import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { IDbListOrdersClient } from '../DbListOrdersClient/DbListOrdersClient'
import { IncomingListOrdersRequest } from '../model/IncomingListOrdersRequest'
import { ListOrdersCommand, ListOrdersCommandInput } from '../model/ListOrdersCommand'
import { ListOrdersApiService, ListOrdersApiServiceOutput } from './ListOrdersApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingListOrdersRequest(): TypeUtilsMutable<IncomingListOrdersRequest> {
  const mockClass = IncomingListOrdersRequest.validateAndBuild({
    sortDirection: 'asc',
    limit: 10,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingListOrdersRequest = buildMockIncomingListOrdersRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
const mockExistingOrderData: OrderData[] = [
  {
    orderId: 'mockOrderId-1',
    orderStatus: OrderStatus.ORDER_DELIVERED_STATUS,
    sku: 'mockSku-1',
    units: 12,
    price: 5.55,
    userId: 'mockUserId-1',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
  {
    orderId: `mockOrderId-2`,
    orderStatus: OrderStatus.ORDER_STOCK_ALLOCATED_STATUS,
    sku: 'mockSku-2',
    units: 6,
    price: 3.22,
    userId: 'mockUserId-2',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
]

function buildMockDbListOrdersClient_succeeds(): IDbListOrdersClient {
  const mockResult = Result.makeSuccess(mockExistingOrderData)
  return { listOrders: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockDbListOrdersClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IDbListOrdersClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? false,
  )
  return { listOrders: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Orders Service ListOrdersApi ListOrdersApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListOrdersRequestInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingListOrdersRequest is valid`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_succeeds()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const result = await listOrdersApiService.listOrders(mockIncomingListOrdersRequest)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListOrdersRequest is undefined`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_succeeds()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const mockTestRequest = undefined as never
    const result = await listOrdersApiService.listOrders(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListOrdersRequest is null`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_succeeds()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const mockTestRequest = null as never
    const result = await listOrdersApiService.listOrders(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingListOrdersRequest is not an instance of the class`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_succeeds()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const mockTestRequest = { ...mockIncomingListOrdersRequest }
    const result = await listOrdersApiService.listOrders(mockTestRequest)
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
  it(`returns the same Failure if ListOrdersCommand.validateAndBuild returns a Failure`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_succeeds()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(ListOrdersCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
    const result = await listOrdersApiService.listOrders(mockIncomingListOrdersRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls DbListOrdersClient.raiseListOrdersCommand a single time`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_succeeds()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    await listOrdersApiService.listOrders(mockIncomingListOrdersRequest)
    expect(mockDbListOrdersClient.listOrders).toHaveBeenCalledTimes(1)
  })

  it(`calls DbListOrdersClient.raiseListOrdersCommand with the expected input`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_succeeds()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    await listOrdersApiService.listOrders(mockIncomingListOrdersRequest)
    const mockListOrdersCommandInput: ListOrdersCommandInput = { ...mockIncomingListOrdersRequest }
    const expectedListOrdersCommandResult = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    const expectedListOrdersCommand = Result.getSuccessValueOrThrow(expectedListOrdersCommandResult)
    expect(mockDbListOrdersClient.listOrders).toHaveBeenCalledWith(expectedListOrdersCommand)
  })

  it(`returns the same Failure if DbListOrdersClient.raiseListOrdersCommand returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockDbListOrdersClient = buildMockDbListOrdersClient_fails(mockFailureKind, mockError, mockTransient)
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const result = await listOrdersApiService.listOrders(mockIncomingListOrdersRequest)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<ListOrdersApiServiceOutput> if the execution path is successful`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_succeeds()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const result = await listOrdersApiService.listOrders(mockIncomingListOrdersRequest)
    const expectedOutput: ListOrdersApiServiceOutput = {
      orders: [
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
      ],
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(result).toStrictEqual(expectedResult)
  })
})
