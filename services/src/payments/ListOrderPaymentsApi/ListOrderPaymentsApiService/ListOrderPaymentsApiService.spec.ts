import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { IDbListOrderPaymentsClient } from '../DbListOrderPaymentsClient/DbListOrderPaymentsClient'
import { IncomingListOrderPaymentsRequest } from '../model/IncomingListOrderPaymentsRequest'
import { ListOrderPaymentsCommand, ListOrderPaymentsCommandInput } from '../model/ListOrderPaymentsCommand'
import { ListOrderPaymentsApiService, ListOrderPaymentsApiServiceOutput } from './ListOrderPaymentsApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingListOrderPaymentsRequest(): TypeUtilsMutable<IncomingListOrderPaymentsRequest> {
  const mockClass = IncomingListOrderPaymentsRequest.validateAndBuild({})
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingListOrderPaymentsRequest = buildMockIncomingListOrderPaymentsRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
const mockExistingOrderPaymentData: OrderPaymentData[] = [
  {
    orderId: 'mockOrderId-1',
    sku: 'mockSku-1',
    units: 12,
    price: 100,
    userId: 'mockUserId-1',
    createdAt: mockDate,
    updatedAt: mockDate,
    paymentId: 'mockPaymentId-1',
    paymentStatus: 'mockPaymentStatus-1' as never,
    paymentRetries: 1,
  },
  {
    orderId: 'mockOrderId-2',
    sku: 'mockSku-2',
    units: 5,
    price: 50,
    userId: 'mockUserId-2',
    createdAt: mockDate,
    updatedAt: mockDate,
    paymentId: 'mockPaymentId-2',
    paymentStatus: 'mockPaymentStatus-2' as never,
    paymentRetries: 2,
  },
]

function buildMockDbListOrderPaymentsClient_succeeds(): IDbListOrderPaymentsClient {
  const mockResult = Result.makeSuccess(mockExistingOrderPaymentData)
  return { listOrderPayments: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockDbListOrderPaymentsClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IDbListOrderPaymentsClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? false,
  )
  return { listOrderPayments: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Payments Service ListOrderPaymentsApi ListOrderPaymentsApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListOrderPaymentsRequestInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingListOrderPaymentsRequest is valid`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_succeeds()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const result = await listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequest is undefined`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_succeeds()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const mockTestRequest = undefined as never
    const result = await listOrderPaymentsApiService.listOrderPayments(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequest is null`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_succeeds()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const mockTestRequest = null as never
    const result = await listOrderPaymentsApiService.listOrderPayments(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequest is not an instance of the class`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_succeeds()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const mockTestRequest = { ...mockIncomingListOrderPaymentsRequest }
    const result = await listOrderPaymentsApiService.listOrderPayments(mockTestRequest)
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
  it(`returns the same Failure if ListOrderPaymentsCommand.validateAndBuild returns a
      Failure`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_succeeds()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(ListOrderPaymentsCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
    const result = await listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls DbListOrderPaymentsClient.raiseListOrderPaymentsCommand a single time`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_succeeds()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    await listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)
    expect(mockDbListOrderPaymentsClient.listOrderPayments).toHaveBeenCalledTimes(1)
  })

  it(`calls DbListOrderPaymentsClient.raiseListOrderPaymentsCommand with the expected
      input`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_succeeds()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    await listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)
    const mockListOrderPaymentsCommandInput: ListOrderPaymentsCommandInput = { ...mockIncomingListOrderPaymentsRequest }
    const expectedListOrderPaymentsCommandResult = ListOrderPaymentsCommand.validateAndBuild(
      mockListOrderPaymentsCommandInput,
    )
    const expectedListOrderPaymentsCommand = Result.getSuccessValueOrThrow(expectedListOrderPaymentsCommandResult)
    expect(mockDbListOrderPaymentsClient.listOrderPayments).toHaveBeenCalledWith(expectedListOrderPaymentsCommand)
  })

  it(`returns the same Failure if
      DbListOrderPaymentsClient.raiseListOrderPaymentsCommand returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_fails(
      mockFailureKind,
      mockError,
      mockTransient,
    )
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const result = await listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)
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
  it(`returns the expected Success<ListOrderPaymentsApiServiceOutput> if the execution
      path is successful`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_succeeds()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const result = await listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)
    const expectedOutput: ListOrderPaymentsApiServiceOutput = {
      orderPayments: [
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
      ],
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(result).toStrictEqual(expectedResult)
  })
})
