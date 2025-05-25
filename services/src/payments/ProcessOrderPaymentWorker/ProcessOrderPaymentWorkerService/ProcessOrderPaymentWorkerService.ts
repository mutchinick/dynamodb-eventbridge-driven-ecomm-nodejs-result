import { IDbGetOrderPaymentClient } from '../../ProcessOrderPaymentWorker/DbGetOrderPaymentClient/DbGetOrderPaymentClient'
import { Failure, Result, Success } from '../../errors/Result'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentStatus } from '../../model/PaymentStatus'
import { IAxSubmitOrderPaymentClient } from '../AxSubmitOrderPaymentClient/AxSubmitOrderPaymentClient'
import { IDbRecordOrderPaymentClient } from '../DbRecordOrderPaymentClient/DbRecordOrderPaymentClient'
import { IEsRaiseOrderPaymentAcceptedEventClient } from '../EsRaiseOrderPaymentAcceptedEventClient/EsRaiseOrderPaymentAcceptedEventClient'
import { IEsRaiseOrderPaymentRejectedEventClient } from '../EsRaiseOrderPaymentRejectedEventClient/EsRaiseOrderPaymentRejectedEventClient'
import { GetOrderPaymentCommand, GetOrderPaymentCommandInput } from '../model/GetOrderPaymentCommand'
import { IncomingOrderStockAllocatedEvent } from '../model/IncomingOrderStockAllocatedEvent'
import { OrderPaymentAcceptedEvent, OrderPaymentAcceptedEventInput } from '../model/OrderPaymentAcceptedEvent'
import { OrderPaymentRejectedEvent, OrderPaymentRejectedEventInput } from '../model/OrderPaymentRejectedEvent'
import { RecordOrderPaymentCommand, RecordOrderPaymentCommandInput } from '../model/RecordOrderPaymentCommand'
import { SubmitOrderPaymentCommand, SubmitOrderPaymentCommandInput } from '../model/SubmitOrderPaymentCommand'

export interface IProcessOrderPaymentWorkerService {
  processOrderPayment: (
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'PaymentFailedError'>
    | Failure<'UnrecognizedError'>
  >
}

type SubmitOrderPaymentOutput = {
  paymentId: string
  paymentStatus: PaymentStatus
  failure?: Failure<'PaymentAlreadyAcceptedError' | 'PaymentAlreadyRejectedError' | 'PaymentFailedError'>
}

/**
 *
 */
export class ProcessOrderPaymentWorkerService implements IProcessOrderPaymentWorkerService {
  /**
   *
   */
  constructor(
    private readonly dbGetOrderPaymentClient: IDbGetOrderPaymentClient,
    private readonly axSubmitOrderPaymentClient: IAxSubmitOrderPaymentClient,
    private readonly dbRecordOrderPaymentClient: IDbRecordOrderPaymentClient,
    private readonly esRaiseOrderPaymentAcceptedEventClient: IEsRaiseOrderPaymentAcceptedEventClient,
    private readonly esRaiseOrderPaymentRejectedEventClient: IEsRaiseOrderPaymentRejectedEventClient,
  ) {}

  /**
   *
   */
  public async processOrderPayment(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'PaymentFailedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'ProcessOrderPaymentWorkerService.processOrderPayment'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent })

    // This worker has a slightly more complex state machine than the others because we want to
    // simulate Payment failures, cap the number of retries, handle errors produced by domain
    // invariants like a Payment already being Accepted or Rejected, and also deal with the case where
    // a new Payment is Accepted or Rejected, in which case we need to record it in the database and
    // throw if that recording fails so the system can retry it later. It gets a bit messy, and that's
    // why we made the other methods a little smarter to keep the orchestration logic as linear as
    // possible, otherwise we need to code too many branches and like I said, it's not pretty.

    const inputValidationResult = this.validateInput(incomingOrderStockAllocatedEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, incomingOrderStockAllocatedEvent })
      return inputValidationResult
    }

    // When it reads the Payment from the database
    const getOrderPaymentResult = await this.getOrderPayment(incomingOrderStockAllocatedEvent)
    if (Result.isFailure(getOrderPaymentResult)) {
      console.error(`${logContext} exit failure:`, { getOrderPaymentResult, incomingOrderStockAllocatedEvent })
      return getOrderPaymentResult
    }
    const existingOrderPaymentData = getOrderPaymentResult.value ?? undefined

    // When it submits the Payment to the gateway
    const submitOrderPaymentOutputResult = await this.submitOrderPayment(
      incomingOrderStockAllocatedEvent,
      existingOrderPaymentData,
    )

    if (Result.isFailure(submitOrderPaymentOutputResult)) {
      console.error(`${logContext} exit failure:`, {
        submitOrderPaymentOutputResult,
        incomingOrderStockAllocatedEvent,
        existingOrderPaymentData,
      })
      return submitOrderPaymentOutputResult
    }

    // When it records the Payment in the database
    const submitOrderPaymentOutput = submitOrderPaymentOutputResult.value
    const { paymentId, paymentStatus } = submitOrderPaymentOutput
    const recordOrderPaymentResult = await this.recordOrderPayment(
      incomingOrderStockAllocatedEvent,
      existingOrderPaymentData,
      paymentId,
      paymentStatus,
    )

    if (Result.isFailure(recordOrderPaymentResult)) {
      console.error(`${logContext} exit failure:`, {
        recordOrderPaymentResult,
        incomingOrderStockAllocatedEvent,
        existingOrderPaymentData,
      })
      return recordOrderPaymentResult
    }

    // When it raises the Payment Accepted event
    if (paymentStatus === 'PAYMENT_ACCEPTED') {
      const raiseEventResult = await this.raisePaymentAcceptedEvent(incomingOrderStockAllocatedEvent)
      Result.isFailure(raiseEventResult)
        ? console.error(`${logContext} exit failure:`, {
            raiseEventResult,
            existingOrderPaymentData,
            incomingOrderStockAllocatedEvent,
          })
        : console.info(`${logContext} exit success:`, {
            raiseEventResult,
            existingOrderPaymentData,
            incomingOrderStockAllocatedEvent,
          })
      return raiseEventResult
    }

    // When it raises the Payment Rejected event
    if (paymentStatus === 'PAYMENT_REJECTED') {
      const raiseEventResult = await this.raisePaymentRejectedEvent(incomingOrderStockAllocatedEvent)
      Result.isFailure(raiseEventResult)
        ? console.error(`${logContext} exit failure:`, {
            raiseEventResult,
            existingOrderPaymentData,
            incomingOrderStockAllocatedEvent,
          })
        : console.info(`${logContext} exit success:`, {
            raiseEventResult,
            existingOrderPaymentData,
            incomingOrderStockAllocatedEvent,
          })
      return raiseEventResult
    }

    // When it throws the Payment Failed error
    // We could check if paymentStatus === 'PAYMENT_FAILED', but the reality is that if we get here
    // it means that the Payment Failed and we need to throw the error.
    const unverifiedFailure = submitOrderPaymentOutput.failure
    const paymentFailure = Result.isFailureOfKind(unverifiedFailure, 'PaymentFailedError')
      ? unverifiedFailure
      : Result.makeFailure('PaymentFailedError', 'Unexpected payment error', true)
    console.info(`${logContext} exit success: from-error:`, {
      paymentFailure,
      existingOrderPaymentData,
      incomingOrderStockAllocatedEvent,
    })
    return paymentFailure as Failure<'PaymentFailedError'>
  }

  /**
   *
   */
  private validateInput(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'ProcessOrderPaymentWorkerService.validateInput'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent })

    if (incomingOrderStockAllocatedEvent instanceof IncomingOrderStockAllocatedEvent === false) {
      const errorMessage = `Expected IncomingOrderStockAllocatedEvent but got ${incomingOrderStockAllocatedEvent}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, incomingOrderStockAllocatedEvent })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async getOrderPayment(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
  ): Promise<Success<OrderPaymentData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'ProcessOrderPaymentWorkerService.getOrderPayment'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent })

    const { orderId } = incomingOrderStockAllocatedEvent.eventData
    const getOrderPaymentCommandInput: GetOrderPaymentCommandInput = { orderId }
    const getOrderPaymentCommandResult = GetOrderPaymentCommand.validateAndBuild(getOrderPaymentCommandInput)
    if (Result.isFailure(getOrderPaymentCommandResult)) {
      console.error(`${logContext} exit failure:`, { getOrderPaymentCommandResult, getOrderPaymentCommandInput })
      return getOrderPaymentCommandResult
    }

    const getOrderPaymentCommand = getOrderPaymentCommandResult.value
    const getOrderPaymentResult = await this.dbGetOrderPaymentClient.getOrderPayment(getOrderPaymentCommand)
    Result.isFailure(getOrderPaymentResult)
      ? console.error(`${logContext} exit failure:`, { getOrderPaymentResult, getOrderPaymentCommand })
      : console.info(`${logContext} exit success:`, { getOrderPaymentResult, getOrderPaymentCommand })

    return getOrderPaymentResult
  }

  /**
   *
   */
  private async submitOrderPayment(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
    existingOrderPaymentData: OrderPaymentData | undefined,
  ): Promise<Success<SubmitOrderPaymentOutput> | Failure<'InvalidArgumentsError'>> {
    const logContext = 'ProcessOrderPaymentWorkerService.submitOrderPayment'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent, existingOrderPaymentData })

    // When retries exceed 3 we return a Rejected Payment.
    if (existingOrderPaymentData?.paymentRetries >= 3) {
      const paymentOutput: SubmitOrderPaymentOutput = {
        paymentId: existingOrderPaymentData.paymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      console.info(`${logContext} exit success:`, {
        paymentOutput,
        incomingOrderStockAllocatedEvent,
        existingOrderPaymentData,
      })
      return Result.makeSuccess(paymentOutput)
    }

    // Otherwise we try to submit the Payment to the gateway.
    const { eventData } = incomingOrderStockAllocatedEvent
    const { orderId, sku, units, price, userId } = eventData
    const existingPaymentStatus = existingOrderPaymentData?.paymentStatus
    const submitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput = {
      orderId,
      sku,
      units,
      price,
      userId,
      existingPaymentStatus,
    }
    const submitOrderPaymentCommandResult = SubmitOrderPaymentCommand.validateAndBuild(submitOrderPaymentCommandInput)

    // When we get a PaymentAlreadyAcceptedError we return an Accepted Payment.
    // This case should not happen but it can in the event of a race condition.
    if (Result.isFailureOfKind(submitOrderPaymentCommandResult, 'PaymentAlreadyAcceptedError')) {
      const paymentOutput: SubmitOrderPaymentOutput = {
        paymentId: existingOrderPaymentData.paymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
        failure: submitOrderPaymentCommandResult,
      }
      console.info(`${logContext} exit success: from-error:`, {
        submitOrderPaymentCommandResult,
        submitOrderPaymentCommandInput,
      })
      return Result.makeSuccess(paymentOutput)
    }

    // When we get a PaymentAlreadyRejectedError we return an Rejected Payment.
    // This case should not happen but it can in the event of a race condition.
    if (Result.isFailureOfKind(submitOrderPaymentCommandResult, 'PaymentAlreadyRejectedError')) {
      const paymentOutput: SubmitOrderPaymentOutput = {
        paymentId: existingOrderPaymentData.paymentId,
        paymentStatus: 'PAYMENT_REJECTED',
        failure: submitOrderPaymentCommandResult,
      }
      console.info(`${logContext} exit success: from-error:`, {
        submitOrderPaymentCommandResult,
        submitOrderPaymentCommandInput,
      })
      return Result.makeSuccess(paymentOutput)
    }

    // When we get other kind of Failure we return it as is.
    if (Result.isFailure(submitOrderPaymentCommandResult)) {
      console.error(`${logContext} exit failure:`, {
        submitOrderPaymentCommandResult,
        submitOrderPaymentCommandInput,
      })
      return submitOrderPaymentCommandResult
    }

    const submitOrderPaymentCommand = submitOrderPaymentCommandResult.value
    const paymentClientOutputResult =
      await this.axSubmitOrderPaymentClient.submitOrderPayment(submitOrderPaymentCommand)

    // When we get a PaymentFailedError we return a Failed Payment with the original error.
    // The event will be sent back to the queue, and we will try to process it again, but we
    // don't fail here, because it still needs to be recorded in the database.
    if (Result.isFailureOfKind(paymentClientOutputResult, 'PaymentFailedError')) {
      const paymentOutput: SubmitOrderPaymentOutput = {
        paymentId: existingOrderPaymentData?.paymentId,
        paymentStatus: 'PAYMENT_FAILED',
        failure: paymentClientOutputResult,
      }
      console.info(`${logContext} exit success: from-error:`, {
        paymentClientOutputResult,
        submitOrderPaymentCommand,
      })
      return Result.makeSuccess(paymentOutput)
    }

    if (Result.isFailure(paymentClientOutputResult)) {
      console.error(`${logContext} exit failure:`, { paymentClientOutputResult, submitOrderPaymentCommand })
      return paymentClientOutputResult
    }

    // We want to return a Success<SubmitOrderPaymentOutput>
    const submitOrderPaymentOutput: SubmitOrderPaymentOutput = {
      paymentId: paymentClientOutputResult.value.paymentId,
      paymentStatus: paymentClientOutputResult.value.paymentStatus,
    }
    const submitOrderPaymentOutputResult = Result.makeSuccess(submitOrderPaymentOutput)
    console.info(`${logContext} exit success:`, { submitOrderPaymentOutputResult, submitOrderPaymentCommand })
    return submitOrderPaymentOutputResult
  }

  /**
   *
   */
  private async recordOrderPayment(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
    existingOrderPaymentData: OrderPaymentData | undefined,
    paymentId: string,
    newPaymentStatus: PaymentStatus,
  ): Promise<Success<OrderPaymentData> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'ProcessOrderPaymentWorkerService.recordOrderPayment'
    console.info(`${logContext} init:`, {
      incomingOrderStockAllocatedEvent,
      existingOrderPaymentData,
      paymentId,
      newPaymentStatus,
    })

    const { orderId, sku, units, price, userId } = incomingOrderStockAllocatedEvent.eventData
    const newOrderPaymentFields = { orderId, sku, units, price, userId, paymentId, paymentStatus: newPaymentStatus }
    const recordOrderPaymentCommandInput: RecordOrderPaymentCommandInput = {
      existingOrderPaymentData,
      newOrderPaymentFields,
    }

    const recordOrderPaymentCommandResult = RecordOrderPaymentCommand.validateAndBuild(recordOrderPaymentCommandInput)

    // When we get a PaymentAlreadyAcceptedError or PaymentAlreadyRejectedError we return the existing Payment.
    // This case should not happen but it can in the event of a race condition.
    if (
      Result.isFailureOfKind(recordOrderPaymentCommandResult, 'PaymentAlreadyAcceptedError') ||
      Result.isFailureOfKind(recordOrderPaymentCommandResult, 'PaymentAlreadyRejectedError')
    ) {
      console.info(`${logContext} exit success: from-error:`, {
        recordOrderPaymentCommandResult,
        recordOrderPaymentCommandInput,
      })
      return Result.makeSuccess(existingOrderPaymentData)
    }

    // When we get other kind of Failure we return it as is.
    if (Result.isFailure(recordOrderPaymentCommandResult)) {
      console.error(`${logContext} exit failure:`, {
        recordOrderPaymentCommandResult,
        recordOrderPaymentCommandInput,
      })
      return recordOrderPaymentCommandResult
    }

    const recordOrderPaymentCommand = recordOrderPaymentCommandResult.value
    const recordOrderPaymentResult = await this.dbRecordOrderPaymentClient.recordOrderPayment(recordOrderPaymentCommand)

    // Yes, again, because the database client also protects against these errors.
    // When we get a PaymentAlreadyAcceptedError or PaymentAlreadyRejectedError we return the existing Payment.
    // This case should not happen but it can in the event of a race condition.
    if (
      Result.isFailureOfKind(recordOrderPaymentResult, 'PaymentAlreadyAcceptedError') ||
      Result.isFailureOfKind(recordOrderPaymentResult, 'PaymentAlreadyRejectedError')
    ) {
      console.info(`${logContext} exit success: from-error:`, {
        recordOrderPaymentResult,
        recordOrderPaymentCommand,
      })
      return Result.makeSuccess(existingOrderPaymentData)
    }

    // When we get other kind of Failure we return it as is.
    if (Result.isFailure(recordOrderPaymentResult)) {
      console.error(`${logContext} exit failure:`, {
        recordOrderPaymentResult,
        recordOrderPaymentCommand,
      })
      return recordOrderPaymentResult
    }

    const newOrderPaymentData = recordOrderPaymentCommandResult.value.commandData
    const newOrderPaymentDataResult = Result.makeSuccess(newOrderPaymentData)
    console.info(`${logContext} exit success:`, {
      recordOrderPaymentResult,
      recordOrderPaymentCommand,
      newOrderPaymentDataResult,
    })

    return newOrderPaymentDataResult
  }

  /**
   *
   */
  private async raisePaymentAcceptedEvent(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'ProcessOrderPaymentWorkerService.raisePaymentAcceptedEvent'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent })

    const { orderId, sku, units, price, userId } = incomingOrderStockAllocatedEvent.eventData
    const orderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput = { orderId, sku, units, price, userId }
    const orderPaymentAcceptedEventResult = OrderPaymentAcceptedEvent.validateAndBuild(orderPaymentAcceptedEventInput)
    if (Result.isFailure(orderPaymentAcceptedEventResult)) {
      console.error(`${logContext} exit failure:`, { orderPaymentAcceptedEventResult, orderPaymentAcceptedEventInput })
      return orderPaymentAcceptedEventResult
    }

    const orderPaymentAcceptedEvent = orderPaymentAcceptedEventResult.value
    const raiseEventResult =
      await this.esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(orderPaymentAcceptedEvent)
    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, orderPaymentAcceptedEvent })
      : console.info(`${logContext} exit success:`, { raiseEventResult, orderPaymentAcceptedEvent })

    return raiseEventResult
  }

  /**
   *
   */
  private async raisePaymentRejectedEvent(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateEventRaisedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'ProcessOrderPaymentWorkerService.raisePaymentRejectedEvent'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent })

    const { orderId, sku, units, price, userId } = incomingOrderStockAllocatedEvent.eventData
    const orderPaymentRejectedEventInput: OrderPaymentRejectedEventInput = { orderId, sku, units, price, userId }
    const orderPaymentRejectedEventResult = OrderPaymentRejectedEvent.validateAndBuild(orderPaymentRejectedEventInput)
    if (Result.isFailure(orderPaymentRejectedEventResult)) {
      console.error(`${logContext} exit failure:`, { orderPaymentRejectedEventResult, orderPaymentRejectedEventInput })
      return orderPaymentRejectedEventResult
    }

    const orderPaymentRejectedEvent = orderPaymentRejectedEventResult.value
    const raiseEventResult =
      await this.esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(orderPaymentRejectedEvent)

    Result.isFailure(raiseEventResult)
      ? console.error(`${logContext} exit failure:`, { raiseEventResult, orderPaymentRejectedEvent })
      : console.info(`${logContext} exit success:`, { raiseEventResult, orderPaymentRejectedEvent })

    return raiseEventResult
  }
}
