import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { FailureKind } from '../../errors/FailureKind'
import { Result } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { IDbListSkusClient } from '../DbListSkusClient/DbListSkusClient'
import { IncomingListSkusRequest } from '../model/IncomingListSkusRequest'
import { ListSkusCommand, ListSkusCommandInput } from '../model/ListSkusCommand'
import { ListSkusApiService, ListSkusApiServiceOutput } from './ListSkusApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingListSkusRequest(): TypeUtilsMutable<IncomingListSkusRequest> {
  const mockClass = IncomingListSkusRequest.validateAndBuild({})
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingListSkusRequest = buildMockIncomingListSkusRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
const mockExistingSkuData: RestockSkuData[] = [
  {
    sku: 'mockSku-1',
    units: 12,
    lotId: 'mockLotId-1',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
  {
    sku: `mockSku-2`,
    units: 6,
    lotId: 'mockLotId-2',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
]

function buildMockDbListSkusClient_succeeds(): IDbListSkusClient {
  const mockResult = Result.makeSuccess(mockExistingSkuData)
  return { listSkus: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockDbListSkusClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IDbListSkusClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? false,
  )
  return { listSkus: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Inventory Service ListSkusApi ListSkusApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListSkusRequestInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingListSkusRequest is valid`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_succeeds()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const result = await listSkusApiService.listSkus(mockIncomingListSkusRequest)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListSkusRequest is undefined`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_succeeds()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const mockTestRequest = undefined as never
    const result = await listSkusApiService.listSkus(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListSkusRequest is null`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_succeeds()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const mockTestRequest = null as never
    const result = await listSkusApiService.listSkus(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingListSkusRequest is not an instance of the class`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_succeeds()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const mockTestRequest = { ...mockIncomingListSkusRequest }
    const result = await listSkusApiService.listSkus(mockTestRequest)
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
  it(`returns the same Failure if ListSkusCommand.validateAndBuild returns a Failure`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_succeeds()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(ListSkusCommand, 'validateAndBuild').mockReturnValueOnce(expectedResult)
    const result = await listSkusApiService.listSkus(mockIncomingListSkusRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls DbListSkusClient.listSkus a single time`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_succeeds()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    await listSkusApiService.listSkus(mockIncomingListSkusRequest)
    expect(mockDbListSkusClient.listSkus).toHaveBeenCalledTimes(1)
  })

  it(`calls DbListSkusClient.listSkus with the expected input`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_succeeds()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    await listSkusApiService.listSkus(mockIncomingListSkusRequest)
    const mockListSkusCommandInput: ListSkusCommandInput = { ...mockIncomingListSkusRequest }
    const expectedListSkusCommandResult = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    const expectedListSkusCommand = Result.getSuccessValueOrThrow(expectedListSkusCommandResult)
    expect(mockDbListSkusClient.listSkus).toHaveBeenCalledWith(expectedListSkusCommand)
  })

  it(`returns the same Failure if DbListSkusClient.listSkus returns a
      Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockDbListSkusClient = buildMockDbListSkusClient_fails(mockFailureKind, mockError, mockTransient)
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const result = await listSkusApiService.listSkus(mockIncomingListSkusRequest)
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
  it(`returns the expected Success<ListSkusApiServiceOutput> if the execution path is
      successful`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_succeeds()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const result = await listSkusApiService.listSkus(mockIncomingListSkusRequest)
    const expectedOutput: ListSkusApiServiceOutput = {
      skus: [
        {
          sku: mockExistingSkuData[0].sku,
          units: mockExistingSkuData[0].units,
          lotId: mockExistingSkuData[0].lotId,
          createdAt: mockExistingSkuData[0].createdAt,
          updatedAt: mockExistingSkuData[0].updatedAt,
        },
        {
          sku: mockExistingSkuData[1].sku,
          units: mockExistingSkuData[1].units,
          lotId: mockExistingSkuData[1].lotId,
          createdAt: mockExistingSkuData[1].createdAt,
          updatedAt: mockExistingSkuData[1].updatedAt,
        },
      ],
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(result).toStrictEqual(expectedResult)
  })
})
