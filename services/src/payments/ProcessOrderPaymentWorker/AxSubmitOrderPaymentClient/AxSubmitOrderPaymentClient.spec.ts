import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import {
  ISdkPaymentGatewayClient,
  SdkPaymentGatewayClientRequest,
  SdkPaymentGatewayClientResponse,
} from '../__external/SdkPaymentGatewayClient/SdkPaymentGatewayClient'
import { SubmitOrderPaymentCommand } from '../model/SubmitOrderPaymentCommand'
import { AxSubmitOrderPaymentClient, AxSubmitOrderPaymentClientOutput } from './AxSubmitOrderPaymentClient'

const mockPaymentsTableName = 'mockPaymentsTableName'

process.env.PAYMENTS_TABLE_NAME = mockPaymentsTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockOrderId = 'mockOrderId'
const mockPrice = 5.55
const mockSku = 'mockSku'
const mockUnits = 2
const mockUserId = 'mockUserId'
const mockAcceptedPaymentId = 'mockAcceptedPaymentId'
const mockRejectedPaymentId = 'mockRejectedPaymentId'

function buildMockSubmitOrderPaymentCommand(): TypeUtilsMutable<SubmitOrderPaymentCommand> {
  const mockClass = SubmitOrderPaymentCommand.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockSubmitOrderPaymentCommand = buildMockSubmitOrderPaymentCommand()

function buildMockSdkPaymentGatewayClientRequest(): SdkPaymentGatewayClientRequest {
  const request: SdkPaymentGatewayClientRequest = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return request
}

const expectedSdkPaymentGatewayClientRequest = buildMockSdkPaymentGatewayClientRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/

function buildMockSdkPaymentsClient_resolves(response: SdkPaymentGatewayClientResponse): ISdkPaymentGatewayClient {
  return { send: jest.fn().mockResolvedValue(response) } as unknown as ISdkPaymentGatewayClient
}

function buildMockSdkPaymentsClient_resolves_Accepted(): ISdkPaymentGatewayClient {
  const response: SdkPaymentGatewayClientResponse = { paymentId: mockAcceptedPaymentId, status: 'SDK_PAYMENT_ACCEPTED' }
  return { send: jest.fn().mockResolvedValue(response) } as unknown as ISdkPaymentGatewayClient
}

function buildMockSdkPaymentsClient_resolves_Rejected(): ISdkPaymentGatewayClient {
  const response: SdkPaymentGatewayClientResponse = { paymentId: mockRejectedPaymentId, status: 'SDK_PAYMENT_REJECTED' }
  return { send: jest.fn().mockResolvedValue(response) } as unknown as ISdkPaymentGatewayClient
}

function buildMockSdkPaymentsClient_throws(error?: unknown): ISdkPaymentGatewayClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as ISdkPaymentGatewayClient
}

describe(`Payments Service ProcessOrderPaymentWorker AxSubmitOrderPaymentClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SubmitOrderPaymentCommand edge cases
   ************************************************************/
  it(`does not return a Failure if the input SubmitOrderPaymentCommand is valid`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves_Accepted()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    const result = await axSubmitOrderPaymentClient.submitOrderPayment(mockSubmitOrderPaymentCommand)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommand is undefined`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves_Accepted()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    const mockTestCommand = undefined as SubmitOrderPaymentCommand
    const result = await axSubmitOrderPaymentClient.submitOrderPayment(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommand is null`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves_Accepted()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    const mockTestCommand = null as SubmitOrderPaymentCommand
    const result = await axSubmitOrderPaymentClient.submitOrderPayment(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommand is not an instance of the class`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves_Accepted()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    const mockTestCommand = { ...mockSubmitOrderPaymentCommand }
    const result = await axSubmitOrderPaymentClient.submitOrderPayment(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test SubmitOrderPaymentCommand.commandData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommand.commandData is undefined`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves_Accepted()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    const mockTestCommand = buildMockSubmitOrderPaymentCommand()
    mockTestCommand.commandData = undefined
    const result = await axSubmitOrderPaymentClient.submitOrderPayment(mockTestCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      SubmitOrderPaymentCommand.commandData is null`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves_Accepted()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    const mockTestCommand = buildMockSubmitOrderPaymentCommand()
    mockTestCommand.commandData = null
    const result = await axSubmitOrderPaymentClient.submitOrderPayment(mockTestCommand)
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
  it(`calls SdkPaymentGatewayClient.send a single time`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves_Accepted()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    await axSubmitOrderPaymentClient.submitOrderPayment(mockSubmitOrderPaymentCommand)
    expect(mockSdkPaymentsClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls SdkPaymentGatewayClient.send with the expected input`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves_Accepted()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    await axSubmitOrderPaymentClient.submitOrderPayment(mockSubmitOrderPaymentCommand)
    expect(mockSdkPaymentsClient.send).toHaveBeenCalledWith(expectedSdkPaymentGatewayClientRequest)
  })

  it(`returns a transient Failure of kind PaymentFailedError if
      SdkPaymentGatewayClient.send throws an Error`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_throws()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    const result = await axSubmitOrderPaymentClient.submitOrderPayment(mockSubmitOrderPaymentCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'PaymentFailedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a transient Failure of kind PaymentFailedError if
      SdkPaymentGatewayClient.send returns an invalid response`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves(undefined)
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    const result = await axSubmitOrderPaymentClient.submitOrderPayment(mockSubmitOrderPaymentCommand)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'PaymentFailedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<AxSubmitOrderPaymentClientOutput> with
      paymentStatus = 'PAYMENT_REJECTED' if the SdkPaymentGatewayClient rejects the
      payment`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves_Rejected()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    const result = await axSubmitOrderPaymentClient.submitOrderPayment(mockSubmitOrderPaymentCommand)
    const expectedOutput: AxSubmitOrderPaymentClientOutput = {
      orderId: mockOrderId,
      paymentId: mockRejectedPaymentId,
      paymentStatus: 'PAYMENT_REJECTED',
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<AxSubmitOrderPaymentClientOutput> with
      paymentStatus = 'PAYMENT_ACCEPTED' if the SdkPaymentGatewayClient accepts the
      payment`, async () => {
    const mockSdkPaymentsClient = buildMockSdkPaymentsClient_resolves_Accepted()
    const axSubmitOrderPaymentClient = new AxSubmitOrderPaymentClient(mockSdkPaymentsClient)
    const result = await axSubmitOrderPaymentClient.submitOrderPayment(mockSubmitOrderPaymentCommand)
    const expectedOutput: AxSubmitOrderPaymentClientOutput = {
      orderId: mockOrderId,
      paymentId: mockAcceptedPaymentId,
      paymentStatus: 'PAYMENT_ACCEPTED',
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
