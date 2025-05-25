import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../../errors/Result'
import { PaymentStatus } from '../../model/PaymentStatus'
import { RecordOrderPaymentCommand } from '../model/RecordOrderPaymentCommand'

export interface IDbRecordOrderPaymentClient {
  recordOrderPayment: (
    recordOrderPaymentCommand: RecordOrderPaymentCommand,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'PaymentAlreadyRejectedError'>
    | Failure<'PaymentAlreadyAcceptedError'>
    | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class DbRecordOrderPaymentClient implements IDbRecordOrderPaymentClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
  public async recordOrderPayment(
    recordOrderPaymentCommand: RecordOrderPaymentCommand,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'PaymentAlreadyRejectedError'>
    | Failure<'PaymentAlreadyAcceptedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DbRecordOrderPaymentClient.recordOrderPayment'
    console.info(`${logContext} init:`, { recordOrderPaymentCommand })

    const inputValidationResult = this.validateInput(recordOrderPaymentCommand)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, recordOrderPaymentCommand })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbCommand(recordOrderPaymentCommand)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, recordOrderPaymentCommand })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, recordOrderPaymentCommand })
      : console.info(`${logContext} exit success:`, { sendCommandResult, recordOrderPaymentCommand })

    return sendCommandResult
  }

  /**
   *
   */
  private validateInput(
    recordOrderPaymentCommand: RecordOrderPaymentCommand,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbRecordOrderPaymentClient.validateInput'

    if (recordOrderPaymentCommand instanceof RecordOrderPaymentCommand === false) {
      const errorMessage = `Expected RecordOrderPaymentCommand but got ${recordOrderPaymentCommand}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, recordOrderPaymentCommand })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(
    recordOrderPaymentCommand: RecordOrderPaymentCommand,
  ): Success<UpdateCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'DbRecordOrderPaymentClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but UpdateCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.PAYMENTS_TABLE_NAME

      const { commandData } = recordOrderPaymentCommand
      const { orderId, sku, units, price, userId, createdAt, updatedAt } = commandData
      const { paymentId, paymentStatus, paymentRetries } = commandData

      const paymentPk = `PAYMENTS#ORDER_ID#${orderId}`
      const paymentSk = `ORDER_ID#${orderId}#PAYMENT`
      const paymentTn = `PAYMENTS#PAYMENT`
      const paymentSn = `PAYMENTS`
      const paymentGsi1Pk = `PAYMENTS#PAYMENT`
      const paymentGsi1Sk = `CREATED_AT#${createdAt}`

      const paymentAcceptedStatus: PaymentStatus = 'PAYMENT_ACCEPTED'
      const paymentRejectedStatus: PaymentStatus = 'PAYMENT_REJECTED'

      const ddbCommand = new UpdateCommand({
        TableName: tableName,
        Key: {
          pk: paymentPk,
          sk: paymentSk,
        },
        UpdateExpression:
          'SET ' +
          '#orderId = :orderId, ' +
          '#sku = :sku, ' +
          '#units = :units, ' +
          '#price = :price, ' +
          '#userId = :userId, ' +
          '#paymentId = :paymentId, ' +
          '#paymentStatus = :paymentStatus, ' +
          '#paymentRetries = :paymentRetries, ' +
          '#updatedAt = :updatedAt, ' +
          '#createdAt = if_not_exists(#createdAt, :createdAt), ' +
          '#_tn = :_tn, ' +
          '#_sn = :_sn, ' +
          '#gsi1pk = :gsi1pk, ' +
          '#gsi1sk = :gsi1sk',
        ExpressionAttributeNames: {
          '#orderId': 'orderId',
          '#sku': 'sku',
          '#units': 'units',
          '#price': 'price',
          '#userId': 'userId',
          '#paymentId': 'paymentId',
          '#paymentStatus': 'paymentStatus',
          '#paymentRetries': 'paymentRetries',
          '#updatedAt': 'updatedAt',
          '#createdAt': 'createdAt',
          '#_tn': '_tn',
          '#_sn': '_sn',
          '#gsi1pk': 'gsi1pk',
          '#gsi1sk': 'gsi1sk',
        },
        ExpressionAttributeValues: {
          ':orderId': orderId,
          ':sku': sku,
          ':units': units,
          ':price': price,
          ':userId': userId,
          ':paymentId': paymentId,
          ':paymentStatus': paymentStatus,
          ':paymentRetries': paymentRetries,
          ':updatedAt': updatedAt,
          ':createdAt': createdAt,
          ':_tn': paymentTn,
          ':_sn': paymentSn,
          ':gsi1pk': paymentGsi1Pk,
          ':gsi1sk': paymentGsi1Sk,
          ':paymentAcceptedStatus': paymentAcceptedStatus,
          ':paymentRejectedStatus': paymentRejectedStatus,
        },
        ConditionExpression: '#paymentStatus <> :paymentAcceptedStatus AND #paymentStatus <> :paymentRejectedStatus',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, recordOrderPaymentCommand })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, recordOrderPaymentCommand })
      return invalidArgsFailure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(
    ddbCommand: UpdateCommand,
  ): Promise<
    | Success<void>
    | Failure<'PaymentAlreadyRejectedError'>
    | Failure<'PaymentAlreadyAcceptedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logContext = 'DbRecordOrderPaymentClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult })
      return sendCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, ddbCommand })

      // When the existing payment has already been rejected then the status is final.
      // The record must not be updated, so it throws a non-transient PaymentAlreadyRejectedError to prevent retries.
      // Although this check exists when building the RecordOrderPaymentCommand, it's repeated here
      // to catch race conditions where other events may have already rejected the payment.
      if (this.isPaymentAlreadyRejectedError(error)) {
        const paymentFailure = Result.makeFailure('PaymentAlreadyRejectedError', error, false)
        console.error(`${logContext} exit failure:`, { paymentFailure, ddbCommand })
        return paymentFailure
      }

      // When the existing payment has already been accepted then the status is final.
      // The record must not be updated, so it throws a non-transient PaymentAlreadyAcceptedError to prevent retries.
      // Although this check exists when building the RecordOrderPaymentCommand, it's repeated here
      // to catch race conditions where other events may have already accepted the payment.
      if (this.isPaymentAlreadyAcceptedError(error)) {
        const paymentFailure = Result.makeFailure('PaymentAlreadyAcceptedError', error, false)
        console.error(`${logContext} exit failure:`, { paymentFailure, ddbCommand })
        return paymentFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
    }
  }

  /**
   *
   */
  private isPaymentAlreadyRejectedError(error: unknown): boolean {
    if (error instanceof ConditionalCheckFailedException) {
      const reason = error?.Item?.paymentStatus as unknown as PaymentStatus
      return reason === 'PAYMENT_REJECTED'
    }
    return false
  }

  /**
   *
   */
  private isPaymentAlreadyAcceptedError(error: unknown): boolean {
    if (error instanceof ConditionalCheckFailedException) {
      const reason = error?.Item?.paymentStatus as unknown as PaymentStatus
      return reason === 'PAYMENT_ACCEPTED'
    }
    return false
  }
}
