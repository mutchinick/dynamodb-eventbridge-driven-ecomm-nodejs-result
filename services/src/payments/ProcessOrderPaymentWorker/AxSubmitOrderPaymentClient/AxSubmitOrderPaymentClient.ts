import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentStatus } from '../../model/PaymentStatus'
import {
  ISdkPaymentGatewayClient,
  SdkPaymentGatewayClientRequest,
  SdkPaymentGatewayClientResponse,
} from '../__external/SdkPaymentGatewayClient/SdkPaymentGatewayClient'
import { SubmitOrderPaymentCommand } from '../model/SubmitOrderPaymentCommand'

export type AxSubmitOrderPaymentClientOutput = Pick<OrderPaymentData, 'orderId' | 'paymentId' | 'paymentStatus'>

export interface IAxSubmitOrderPaymentClient {
  submitOrderPayment: (
    submitOrderPaymentCommand: SubmitOrderPaymentCommand,
  ) => Promise<
    Success<AxSubmitOrderPaymentClientOutput> | Failure<'PaymentFailedError'> | Failure<'InvalidArgumentsError'>
  >
}

/**
 *
 */
export class AxSubmitOrderPaymentClient implements IAxSubmitOrderPaymentClient {
  /**
   *
   */
  constructor(private readonly sdkPaymentsClient: ISdkPaymentGatewayClient) {}

  /**
   *
   */
  public async submitOrderPayment(
    submitOrderPaymentCommand: SubmitOrderPaymentCommand,
  ): Promise<
    Success<AxSubmitOrderPaymentClientOutput> | Failure<'PaymentFailedError'> | Failure<'InvalidArgumentsError'>
  > {
    const logContext = 'AxSubmitOrderPaymentClient.submitOrderPayment'
    console.info(`${logContext} init:`, { submitOrderPaymentCommand })

    const inputValidationResult = this.validateInput(submitOrderPaymentCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, submitOrderPaymentCommand })
      return inputValidationResult
    }

    const buildRequestResult = this.buildSdkPaymentRequest(submitOrderPaymentCommand)
    if (Result.isFailure(buildRequestResult)) {
      console.error(`${logContext} exit failure:`, { buildRequestResult, submitOrderPaymentCommand })
      return buildRequestResult
    }

    const request = buildRequestResult.value
    const sendSdkPaymentRequestResult = await this.sendSdkPaymentRequest(request)
    Result.isFailure(sendSdkPaymentRequestResult)
      ? console.error(`${logContext} exit failure:`, { sendSdkPaymentRequestResult, request })
      : console.info(`${logContext} exit success:`, { sendSdkPaymentRequestResult, request })

    return sendSdkPaymentRequestResult
  }

  /**
   *
   */
  private validateInput(
    submitOrderPaymentCommand: SubmitOrderPaymentCommand,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'AxSubmitOrderPaymentClient.validateInput'

    if (submitOrderPaymentCommand instanceof SubmitOrderPaymentCommand === false) {
      const errorMessage = `Expected SubmitOrderPaymentCommand but got ${submitOrderPaymentCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, submitOrderPaymentCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildSdkPaymentRequest(
    submitOrderPaymentCommand: SubmitOrderPaymentCommand,
  ): Success<SdkPaymentGatewayClientRequest> | Failure<'InvalidArgumentsError'> {
    const logContext = 'AxSubmitOrderPaymentClient.buildSdkCommand'

    try {
      // These should all be valid because we received a valid SubmitOrderPaymentCommand
      // nevertheless, we try-catch just out of caution.
      const { orderId, sku, units, price, userId } = submitOrderPaymentCommand.commandData
      const request: SdkPaymentGatewayClientRequest = { orderId, sku, units, price, userId }
      return Result.makeSuccess(request)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, submitOrderPaymentCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, submitOrderPaymentCommand })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendSdkPaymentRequest(
    request: SdkPaymentGatewayClientRequest,
  ): Promise<Success<AxSubmitOrderPaymentClientOutput> | Failure<'PaymentFailedError'>> {
    const logContext = 'AxSubmitOrderPaymentClient.sendSdkPaymentRequest'
    console.info(`${logContext} init:`, { request })

    // COMBAK: Don't really fancy this, but we are simulating an edge case here, and I didn't love the
    // other alternatives I could think of. Don't know if splitting the method would make it better.
    let response: SdkPaymentGatewayClientResponse | undefined
    try {
      response = await this.sdkPaymentsClient.send(request)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, request })
      const paymentFailure = Result.makeFailure('PaymentFailedError', error, true)
      console.error(`${logContext} exit failure:`, { paymentFailure, request })
      return paymentFailure
    }

    // Payment accepted
    if (response && response.status === 'SDK_PAYMENT_ACCEPTED') {
      const submitPaymentOutput = this.buildOutput(request.orderId, response.paymentId, 'PAYMENT_ACCEPTED')
      const submitPaymentOutputResult = Result.makeSuccess(submitPaymentOutput)
      console.info(`${logContext} exit success:`, { submitPaymentOutputResult, response, request })
      return submitPaymentOutputResult
    }

    // Payment rejected
    else if (response && response.status === 'SDK_PAYMENT_REJECTED') {
      const submitPaymentOutput = this.buildOutput(request.orderId, response.paymentId, 'PAYMENT_REJECTED')
      const submitPaymentOutputResult = Result.makeSuccess(submitPaymentOutput)
      console.info(`${logContext} exit success:`, { submitPaymentOutputResult, response, request })
      return submitPaymentOutputResult
    }

    // Payment failed
    else {
      const errorMessage = `Expected SdkPaymentGatewayClientResponse but got ${response}`
      const paymentFailure = Result.makeFailure('PaymentFailedError', errorMessage, true)
      console.error(`${logContext} exit failure:`, { paymentFailure, response, request })
      return paymentFailure
    }
  }

  /**
   *
   */
  private buildOutput(
    orderId: string,
    paymentId: string,
    paymentStatus: PaymentStatus,
  ): AxSubmitOrderPaymentClientOutput {
    const output: AxSubmitOrderPaymentClientOutput = { orderId, paymentId, paymentStatus }
    return output
  }
}
