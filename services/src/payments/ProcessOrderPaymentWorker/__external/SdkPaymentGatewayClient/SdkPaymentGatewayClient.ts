// The SdkPaymentGatewayClient is a simple mock implementation of a payment gateway client.
// So it does not follow the same error handling patterns as the rest of the project.
import { createHash } from 'crypto'

export type SdkPaymentGatewayClientRequest = {
  orderId: string
  sku: string
  units: number
  price: number
  userId: string
}

export type SdkPaymentGatewayClientResponse = {
  paymentId: string
  status: 'SDK_PAYMENT_ACCEPTED' | 'SDK_PAYMENT_REJECTED'
}

export interface ISdkPaymentGatewayClient {
  /**
   * @throws {Error}
   */
  send: (input: SdkPaymentGatewayClientRequest) => Promise<SdkPaymentGatewayClientResponse>
}

/**
 *
 */
export class SdkPaymentGatewayClient implements ISdkPaymentGatewayClient {
  /**
   * @throws {Error}
   */
  public async send(input: SdkPaymentGatewayClientRequest): Promise<SdkPaymentGatewayClientResponse> {
    // Reject the payment if the request is missing critical data. It can't be retried.
    if (
      !input ||
      typeof input.orderId !== 'string' ||
      typeof input.sku !== 'string' ||
      typeof input.units !== 'number' ||
      typeof input.price !== 'number' ||
      typeof input.userId !== 'string'
    ) {
      const response: SdkPaymentGatewayClientResponse = {
        paymentId: this.generatePaymentId(input?.orderId),
        status: 'SDK_PAYMENT_REJECTED',
      }
      return Promise.resolve(response)
    }

    // Reject the payment if the request price is out of range so we can force a payment rejection.
    if (input.price <= 0 || input.price >= 100000) {
      const response: SdkPaymentGatewayClientResponse = {
        paymentId: this.generatePaymentId(input.orderId),
        status: 'SDK_PAYMENT_REJECTED',
      }
      return Promise.resolve(response)
    }

    // Otherwise accept the payment ~30% of the time...
    const randomValue = Math.random()
    if (randomValue < 0.3) {
      const response: SdkPaymentGatewayClientResponse = {
        paymentId: this.generatePaymentId(input.orderId),
        status: 'SDK_PAYMENT_ACCEPTED',
      }
      return Promise.resolve(response)
    }

    // And fail the other ~70% of the time...
    throw new Error('Payment failed because the payment gateway is shaky')
  }

  /**
   * @throws {Error}
   */
  private generatePaymentId(orderId: string): string {
    const safeOrderId = orderId || ''
    const orderIdHash = createHash('md5').update(safeOrderId).digest('hex')
    const paymentId = orderIdHash.slice(0, 6).toUpperCase()
    return paymentId
  }
}
