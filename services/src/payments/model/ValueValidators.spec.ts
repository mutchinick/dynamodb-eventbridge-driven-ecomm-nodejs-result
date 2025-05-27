import { PaymentsEventName } from './PaymentsEventName'
import { PaymentStatus } from './PaymentStatus'
import { ValueValidators } from './ValueValidators'

describe(`Payments Service ValueValidators tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test validPaymentsEventName
   ************************************************************/
  describe(`validPaymentsEventName tests`, () => {
    it(`throws if the input eventName is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validPaymentsEventName().parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validPaymentsEventName().parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validPaymentsEventName().parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not a PaymentsEventName`, () => {
      const testInput = 'mockInvalidValue'
      expect(() => ValueValidators.validPaymentsEventName().parse(testInput)).toThrow()
    })

    it(`is valid if the input eventName is a PaymentsEventName like ORDER_STOCK_ALLOCATED_EVENT`, () => {
      const testInput: PaymentsEventName = PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT
      expect(() => ValueValidators.validPaymentsEventName().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input eventName is a PaymentsEventName like ORDER_CANCELED_EVENT`, () => {
      const testInput: PaymentsEventName = PaymentsEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validPaymentsEventName().parse(testInput)).not.toThrow()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test validPaymentsEventNameLiteral
   ************************************************************/
  describe(`validPaymentsEventNameLiteral tests`, () => {
    it(`throws if the input eventName is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validPaymentsEventNameLiteral(testInput).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validPaymentsEventNameLiteral(testInput).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is empty`, () => {
      const testInput = '' as never
      expect(() => ValueValidators.validPaymentsEventNameLiteral(testInput).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not a PaymentsEventName`, () => {
      const testInput = 'mockInvalidValue' as never
      expect(() => ValueValidators.validPaymentsEventNameLiteral(testInput).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not the expected PaymentsEventName`, () => {
      const testInput = PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT
      const expectedEventName = PaymentsEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameLiteral(expectedEventName).parse(testInput)).toThrow()
    })

    it(`is valid if the input eventName is the expected PaymentsEventName`, () => {
      const testInput = PaymentsEventName.ORDER_CANCELED_EVENT
      const expectedEventName = PaymentsEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameLiteral(expectedEventName).parse(testInput)).not.toThrow()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test validPaymentsEventNameGroup
   ************************************************************/
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

    it(`throws if the input eventName is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validPaymentsEventNameGroup(testEventGroup).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is empty`, () => {
      const testInput = '' as never
      expect(() => ValueValidators.validPaymentsEventNameGroup(testEventGroup).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not a PaymentsEventName`, () => {
      const testInput = 'mockInvalidValue' as never
      expect(() => ValueValidators.validPaymentsEventNameGroup([testInput]).parse(testInput)).toThrow()
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

    it(`is valid if the input eventName exists in an event group with a single event name`, () => {
      const testInput = PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT
      expect(() => ValueValidators.validPaymentsEventNameGroup([testInput]).parse(testInput)).not.toThrow()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test validOrderId
   ************************************************************/
  describe(`validOrderId tests`, () => {
    it(`throws if the input orderId is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validOrderId().parse(testInput)).toThrow()
    })

    it(`throws if the input orderId is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validOrderId().parse(testInput)).toThrow()
    })

    it(`throws if the input orderId is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validOrderId().parse(testInput)).toThrow()
    })

    it(`throws if the input orderId is blank`, () => {
      const testInput = '      '
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

  /*
   *
   *
   ************************************************************
   * Test validSku
   ************************************************************/
  describe(`validSku tests`, () => {
    it(`throws if the input sku is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validSku().parse(testInput)).toThrow()
    })

    it(`throws if the input sku is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validSku().parse(testInput)).toThrow()
    })

    it(`throws if the input sku is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validSku().parse(testInput)).toThrow()
    })

    it(`throws if the input sku is blank`, () => {
      const testInput = '      '
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

  /*
   *
   *
   ************************************************************
   * Test validUnits
   ************************************************************/
  describe(`validUnits tests`, () => {
    it(`throws if the input units is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validUnits().parse(testInput)).toThrow()
    })

    it(`throws if the input units is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validUnits().parse(testInput)).toThrow()
    })

    it(`throws if the input units is not a number`, () => {
      const testInput = '1' as never
      expect(() => ValueValidators.validUnits().parse(testInput)).toThrow()
    })

    it(`throws if the input units is not an integer`, () => {
      const testInput = 2.34
      expect(() => ValueValidators.validUnits().parse(testInput)).toThrow()
    })

    it(`throws if the input units === 0`, () => {
      const testInput = 0
      expect(() => ValueValidators.validUnits().parse(testInput)).toThrow()
    })

    it(`throws if the input units < 0`, () => {
      const testInput = -1
      expect(() => ValueValidators.validUnits().parse(testInput)).toThrow()
    })

    it(`is valid if the input units >= 1`, () => {
      const testInput = 1
      expect(() => ValueValidators.validUnits().parse(testInput)).not.toThrow()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test validPrice
   ************************************************************/
  describe(`validPrice tests`, () => {
    it(`throws if the input price is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validPrice().parse(testInput)).toThrow()
    })

    it(`throws if the input price is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validPrice().parse(testInput)).toThrow()
    })

    it(`throws if the input price is not a number`, () => {
      const testInput = '1' as never
      expect(() => ValueValidators.validPrice().parse(testInput)).toThrow()
    })

    it(`throws if the input price < 0`, () => {
      const testInput = -1
      expect(() => ValueValidators.validPrice().parse(testInput)).toThrow()
    })

    it(`is valid if the input price === 0`, () => {
      const testInput = 0
      expect(() => ValueValidators.validPrice().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input price > 0`, () => {
      const testInput = 1
      expect(() => ValueValidators.validPrice().parse(testInput)).not.toThrow()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test validUserId
   ************************************************************/
  describe(`validUserId tests`, () => {
    it(`throws if the input userId is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validUserId().parse(testInput)).toThrow()
    })

    it(`throws if the input userId is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validUserId().parse(testInput)).toThrow()
    })

    it(`throws if the input userId is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validUserId().parse(testInput)).toThrow()
    })

    it(`throws if the input userId is blank`, () => {
      const testInput = '      '
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

  /*
   *
   *
   ************************************************************
   * Test validCreatedAt
   ************************************************************/
  describe(`validCreatedAt tests`, () => {
    it(`throws if the input createdAt is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validCreatedAt().parse(testInput)).toThrow()
    })

    it(`throws if the input createdAt is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validCreatedAt().parse(testInput)).toThrow()
    })

    it(`throws if the input createdAt is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validCreatedAt().parse(testInput)).toThrow()
    })

    it(`throws if the input createdAt is blank`, () => {
      const testInput = '      '
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

  /*
   *
   *
   ************************************************************
   * Test validUpdatedAt
   ************************************************************/
  describe(`validUpdatedAt tests`, () => {
    it(`throws if the input updatedAt is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validUpdatedAt().parse(testInput)).toThrow()
    })

    it(`throws if the input updatedAt is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validUpdatedAt().parse(testInput)).toThrow()
    })

    it(`throws if the input updatedAt is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validUpdatedAt().parse(testInput)).toThrow()
    })

    it(`throws if the input updatedAt is blank`, () => {
      const testInput = '      '
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

  /*
   *
   *
   ************************************************************
   * Test validSortDirection
   ************************************************************/
  describe(`validSortDirection tests`, () => {
    it(`throws if the input sortDirection is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validSortDirection().parse(testInput)).toThrow()
    })

    it(`throws if the input sortDirection is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validSortDirection().parse(testInput)).toThrow()
    })

    it(`throws if the input sortDirection is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validSortDirection().parse(testInput)).toThrow()
    })

    it(`throws if the input sortDirection is not a SortDirection`, () => {
      const testInput = 'mockInvalidValue'
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

  /*
   *
   *
   ************************************************************
   * Test validLimit
   ************************************************************/
  describe(`validLimit tests`, () => {
    it(`throws if the input limit is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validLimit().parse(testInput)).toThrow()
    })

    it(`throws if the input limit is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validLimit().parse(testInput)).toThrow()
    })

    it(`throws if the input limit is not a number`, () => {
      const testInput = '2' as never
      expect(() => ValueValidators.validLimit().parse(testInput)).toThrow()
    })

    it(`throws if the input limit is not an integer`, () => {
      const testInput = 3.45
      expect(() => ValueValidators.validLimit().parse(testInput)).toThrow()
    })

    it(`throws if the input limit === 0`, () => {
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

    it(`is valid if the input limit >= 1 <= 1000`, () => {
      const testInputFor1 = 1
      const testInputFor1000 = 1000
      expect(() => ValueValidators.validLimit().parse(testInputFor1)).not.toThrow()
      expect(() => ValueValidators.validLimit().parse(testInputFor1000)).not.toThrow()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test validPaymentId
   ************************************************************/
  describe(`validPaymentId tests`, () => {
    it(`throws if the input paymentId is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validPaymentId().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentId is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validPaymentId().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentId is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validPaymentId().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentId is blank`, () => {
      const testInput = '      '
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

  /*
   *
   *
   ************************************************************
   * Test validPaymentStatus
   ************************************************************/
  describe(`validPaymentStatus tests`, () => {
    it(`throws if the input paymentStatus is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentStatus is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentStatus is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentStatus is not a PaymentStatus`, () => {
      const testInput = 'mockInvalidValue'
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).toThrow()
    })

    it(`is valid if the input paymentStatus is a PaymentStatus like PAYMENT_REJECTED`, () => {
      const testInput: PaymentStatus = 'PAYMENT_REJECTED'
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input paymentStatus is a PaymentStatus like PAYMENT_ACCEPTED`, () => {
      const testInput: PaymentStatus = 'PAYMENT_ACCEPTED'
      expect(() => ValueValidators.validPaymentStatus().parse(testInput)).not.toThrow()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test validPaymentRetries
   ************************************************************/
  describe(`validPaymentRetries tests`, () => {
    it(`throws if the input paymentRetries is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentRetries is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentRetries is not a number`, () => {
      const testInput = '2'
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentRetries is not an integer`, () => {
      const testInput = 3.45
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).toThrow()
    })

    it(`throws if the input paymentRetries < 0`, () => {
      const testInput = -1
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).toThrow()
    })

    it(`is valid if the input paymentRetries === 0`, () => {
      const testInput = 0
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input paymentRetries > 0`, () => {
      const testInput = 1
      expect(() => ValueValidators.validPaymentRetries().parse(testInput)).not.toThrow()
    })
  })
})
