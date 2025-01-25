import { OrderStatus } from './OrderStatus'
import { ValueValidators } from './ValueValidators'

describe('Orders Service ValueValidators tests', () => {
  describe('validOrderId tests', () => {
    it('throws if orderId is undefined', () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validOrderId().parse(testValue)).toThrow()
    })

    it('throws if orderId length < 4', () => {
      const testValue = '123'
      expect(() => ValueValidators.validOrderId().parse(testValue)).toThrow()
    })

    it('is valid if orderId length >= 4', () => {
      const testValue = '1234'
      expect(() => ValueValidators.validOrderId().parse(testValue)).not.toThrow()
    })
  })

  describe('validOrderStatus tests', () => {
    it('throws if orderStatus is undefined', () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validOrderStatus().parse(testValue)).toThrow()
    })

    it('throws if orderStatus length < 4', () => {
      const testValue = '123'
      expect(() => ValueValidators.validOrderStatus().parse(testValue)).toThrow()
    })

    it('is valid if orderStatus is of type OrderStatus', () => {
      const testValue = OrderStatus.ORDER_CREATED_STATUS
      expect(() => ValueValidators.validOrderStatus().parse(testValue)).not.toThrow()
    })
  })

  describe('validSku tests', () => {
    it('throws if sku is undefined', () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validSku().parse(testValue)).toThrow()
    })

    it('throws if sku length < 4', () => {
      const testValue = '123'
      expect(() => ValueValidators.validSku().parse(testValue)).toThrow()
    })

    it('is valid if sku length >= 4', () => {
      const testValue = '1234'
      expect(() => ValueValidators.validSku().parse(testValue)).not.toThrow()
    })
  })

  describe('validQuantity tests', () => {
    it('throws if quantity is undefined', () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validQuantity().parse(testValue)).toThrow()
    })

    it('throws if quantity = 0', () => {
      const testValue = 0
      expect(() => ValueValidators.validQuantity().parse(testValue)).toThrow()
    })

    it('throws if quantity < 0', () => {
      const testValue = -1
      expect(() => ValueValidators.validQuantity().parse(testValue)).toThrow()
    })

    it('is valid if quantity >= 1', () => {
      const testValue = 1
      expect(() => ValueValidators.validQuantity().parse(testValue)).not.toThrow()
    })
  })

  describe('validPrice tests', () => {
    it('throws if price is undefined', () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validPrice().parse(testValue)).toThrow()
    })

    it('throws if price < 0', () => {
      const testValue = -1
      expect(() => ValueValidators.validPrice().parse(testValue)).toThrow()
    })

    it('is valid if price == 0', () => {
      const testValue = 0
      expect(() => ValueValidators.validPrice().parse(testValue)).not.toThrow()
    })

    it('is valid if price > 0', () => {
      const testValue = 1
      expect(() => ValueValidators.validPrice().parse(testValue)).not.toThrow()
    })
  })

  describe('validUserId tests', () => {
    it('throws if userId is undefined', () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validUserId().parse(testValue)).toThrow()
    })

    it('throws if userId length < 4', () => {
      const testValue = '123'
      expect(() => ValueValidators.validUserId().parse(testValue)).toThrow()
    })

    it('is valid if userId length >= 4', () => {
      const testValue = '1234'
      expect(() => ValueValidators.validUserId().parse(testValue)).not.toThrow()
    })
  })

  describe('validCreatedAt tests', () => {
    it('throws if createdAt is undefined', () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validCreatedAt().parse(testValue)).toThrow()
    })

    it('throws if createdAt length < 4', () => {
      const testValue = '123'
      expect(() => ValueValidators.validCreatedAt().parse(testValue)).toThrow()
    })

    it('is valid if createdAt length >= 4', () => {
      const testValue = '1234'
      expect(() => ValueValidators.validCreatedAt().parse(testValue)).not.toThrow()
    })
  })

  describe('validUpdatedAt tests', () => {
    it('throws if updatedAt is undefined', () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validUpdatedAt().parse(testValue)).toThrow()
    })

    it('throws if updatedAt length < 4', () => {
      const testValue = '123'
      expect(() => ValueValidators.validUpdatedAt().parse(testValue)).toThrow()
    })

    it('is valid if updatedAt length >= 4', () => {
      const testValue = '1234'
      expect(() => ValueValidators.validUpdatedAt().parse(testValue)).not.toThrow()
    })
  })
})
