import { PaymentsEventName } from './PaymentsEventName'
import { PaymentStatus } from './PaymentStatus'
import { ValueValidators } from './ValueValidators'

describe(`Payments Service ValueValidators tests`, () => {
  describe(`validPaymentsEventNameLiteral tests`, () => {
    it(`throws if the input eventName is undefined`, () => {
      const testInput = undefined as never
      const expectedEventName = PaymentsEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameLiteral(expectedEventName).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is empty`, () => {
      const testInput = '' as never
      const expectedEventName = PaymentsEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameLiteral(expectedEventName).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not the expected PaymentsEventName`, () => {
      const testInput = PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT
      const expectedEventName = PaymentsEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameLiteral(expectedEventName).parse(testInput)).toThrow()
    })

    it(`is valid if the input eventName is the expected eventName`, () => {
      const testInput = PaymentsEventName.ORDER_CANCELED_EVENT
      const expectedEventName = PaymentsEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameLiteral(expectedEventName).parse(testInput)).not.toThrow()
    })
  })

  describe(`validPaymentsEventNameGroup tests`, () => {
    const testEventGroup: PaymentsEventName[] = [
      PaymentsEventName.ORDER_CANCELED_EVENT,
      PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
      PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT,
    ]

    it(`throws if the input eventName is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validPaymentsEventNameGroup(testEventGroup).parse(testInput)).toThrow()
    })

    it(`throws if the input event group is empty`, () => {
      const testInput = PaymentsEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameGroup([]).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName does not exist in the event group`, () => {
      const testInput = PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameGroup(testEventGroup).parse(testInput)).toThrow()
    })

    it(`is valid if the input eventName exists in the event group`, () => {
      const testInput = PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameGroup(testEventGroup).parse(testInput)).not.toThrow()
    })

    it(`is valid if the input eventName exists in an event group with a single eventName`, () => {
      const testInput = PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameGroup([testInput]).parse(testInput)).not.toThrow()
    })
  })

  describe(`validOrderId tests`, () => {
    it(`throws if the input orderId is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validOrderId().parse(testInput)).toThrow()
    })

    it(`throws if the input orderId length < 4`, () => {
      const testInput = '123'
      expect(() => ValueValidators.validOrderId().parse(testInput)).toThrow()
    })

    it(`is valid if the input orderId length >= 4`, () => {
      const testInput = '1234'
      expect(() => ValueValidators.validOrderId().parse(testInput)).not.toThrow()
    })
  })

  describe(`validSku tests`, () => {
    it(`throws if the input sku is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validSku().parse(testInput)).toThrow()
    })

    it(`throws if the input sku length < 4`, () => {
      const testInput = '123'
      expect(() => ValueValidators.validSku().parse(testInput)).toThrow()
    })

    it(`is valid if the input sku length >= 4`, () => {
      const testInput = '1234'
      expect(() => ValueValidators.validSku().parse(testInput)).not.toThrow()
    })
  })

  describe(`validUnits tests`, () => {
    it(`throws if the input units is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validUnits().parse(testInput)).toThrow()
    })

    it(`throws if the input units = 0`, () => {
      const testInput = 0
      expect(() => ValueValidators.validUnits().parse(testInput)).toThrow()
    })

    it(`throws if the input units < 0`, () => {
      const testInput = -1
      expect(() => ValueValidators.validUnits().parse(testInput)).toThrow()
    })

    it(`throws if the input units is not an integer`, () => {
      const testInput = 2.34
      expect(() => ValueValidators.validUnits().parse(testInput)).toThrow()
    })

    it(`is valid if the input units >= 1`, () => {
      const testInput = 1
      expect(() => ValueValidators.validUnits().parse(testInput)).not.toThrow()
    })
  })

  describe(`validPrice tests`, () => {
    it(`throws if the input price is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validPrice().parse(testInput)).toThrow()
    })

    it(`throws if the input price < 0`, () => {
      const testInput = -1
      expect(() => ValueValidators.validPrice().parse(testInput)).toThrow()
    })

    it(`is valid if the input price == 0`, () => {
      const testInput = 0
      expect(() => ValueValidators.validPrice().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input price > 0`, () => {
      const testInput = 1
      expect(() => ValueValidators.validPrice().parse(testInput)).not.toThrow()
    })
  })

  describe(`validUserId tests`, () => {
    it(`throws if the input userId is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validUserId().parse(testInput)).toThrow()
    })

    it(`throws if the input userId length < 4`, () => {
      const testInput = '123'
      expect(() => ValueValidators.validUserId().parse(testInput)).toThrow()
    })

    it(`is valid if the input userId length >= 4`, () => {
      const testInput = '1234'
      expect(() => ValueValidators.validUserId().parse(testInput)).not.toThrow()
    })
  })

  describe(`validCreatedAt tests`, () => {
    it(`throws if the input createdAt is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validCreatedAt().parse(testInput)).toThrow()
    })

    it(`throws if the input createdAt length < 4`, () => {
      const testInput = '123'
      expect(() => ValueValidators.validCreatedAt().parse(testInput)).toThrow()
    })

    it(`is valid if the input createdAt length >= 4`, () => {
      const testInput = '1234'
      expect(() => ValueValidators.validCreatedAt().parse(testInput)).not.toThrow()
    })
  })

  describe(`validUpdatedAt tests`, () => {
    it(`throws if the input updatedAt is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validUpdatedAt().parse(testInput)).toThrow()
    })

    it(`throws if the input updatedAt length < 4`, () => {
      const testInput = '123'
      expect(() => ValueValidators.validUpdatedAt().parse(testInput)).toThrow()
    })

    it(`is valid if the input updatedAt length >= 4`, () => {
      const testInput = '1234'
      expect(() => ValueValidators.validUpdatedAt().parse(testInput)).not.toThrow()
    })
  })

  describe(`validSortDirection tests`, () => {
    it(`throws if the input sortDirection is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validSortDirection().parse(testInput)).toThrow()
    })

    it(`throws if the input sortDirection a random string`, () => {
      const testInput = 'xyz'
      expect(() => ValueValidators.validSortDirection().parse(testInput)).toThrow()
    })

    it(`is valid if the input sortDirection === 'asc'`, () => {
      const testInput = 'asc'
      expect(() => ValueValidators.validSortDirection().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input sortDirection === 'desc'`, () => {
      const testInput = 'desc'
      expect(() => ValueValidators.validSortDirection().parse(testInput)).not.toThrow()
    })
  })

  describe(`validLimit tests`, () => {
    it(`throws if the input limit is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validLimit().parse(testInput)).toThrow()
    })

    it(`throws if the input limit = 0`, () => {
      const testInput = 0
      expect(() => ValueValidators.validLimit().parse(testInput)).toThrow()
    })

    it(`throws if the input limit < 0`, () => {
      const testInput = -1
      expect(() => ValueValidators.validLimit().parse(testInput)).toThrow()
    })

    it(`throws if the input limit > 1000`, () => {
      const testInput = 1001
      expect(() => ValueValidators.validLimit().parse(testInput)).toThrow()
    })

    it(`throws if the input limit is not an integer`, () => {
      const testInput = 3.45
      expect(() => ValueValidators.validLimit().parse(testInput)).toThrow()
    })

    it(`is valid if the input limit >= 1 <= 1000`, () => {
      const testInputFor1 = 1
      const testInputFor1000 = 1000
      expect(() => ValueValidators.validLimit().parse(testInputFor1)).not.toThrow()
      expect(() => ValueValidators.validLimit().parse(testInputFor1000)).not.toThrow()
    })
  })

  describe(`validPaymentStatus tests`, () => {
    it(`throws if the input paymentStatus is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentStatus a random string and not an PaymentStatus`, () => {
      const testInput = 'xyz'
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentStatus is not the literal expectedPaymentStatus`, () => {
      const expectedPaymentStatus: PaymentStatus = 'PAYMENT_ACCEPTED'
      const testInput: PaymentStatus = 'PAYMENT_REJECTED'
      expect(() => ValueValidators.validPaymentStatus(expectedPaymentStatus).parse(testInput)).toThrow()
    })

    it(`is valid if the input paymentStatus === 'PAYMENT_ACCEPTED'`, () => {
      const testInput: PaymentStatus = 'PAYMENT_ACCEPTED'
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input paymentStatus === 'PAYMENT_FAILED'`, () => {
      const testInput: PaymentStatus = 'PAYMENT_FAILED'
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input paymentStatus === 'PAYMENT_REJECTED'`, () => {
      const testInput: PaymentStatus = 'PAYMENT_REJECTED'
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input paymentStatus is the literal expectedPaymentStatus`, () => {
      const expectedPaymentStatus: PaymentStatus = 'PAYMENT_ACCEPTED'
      const testInput: PaymentStatus = 'PAYMENT_ACCEPTED'
      expect(() => ValueValidators.validPaymentStatus(expectedPaymentStatus).parse(testInput)).not.toThrow()
    })
  })

  describe(`validPaymentRetries tests`, () => {
    it(`throws if the input paymentRetries is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentRetries < 0`, () => {
      const testInput = -1
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentRetries is not an integer`, () => {
      const testInput = 3.45
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).toThrow()
    })

    it(`is valid if the input paymentRetries == 0`, () => {
      const testInput = 0
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input paymentRetries > 0`, () => {
      const testInput = 1
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).not.toThrow()
    })
  })

  describe(`validPaymentId tests`, () => {
    it(`throws if the input paymentId is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validPaymentId().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentId length < 4`, () => {
      const testInput = '123'
      expect(() => ValueValidators.validPaymentId().parse(testInput)).toThrow()
    })

    it(`is valid if the input paymentId length >= 4`, () => {
      const testInput = '1234'
      expect(() => ValueValidators.validPaymentId().parse(testInput)).not.toThrow()
    })
  })
})
