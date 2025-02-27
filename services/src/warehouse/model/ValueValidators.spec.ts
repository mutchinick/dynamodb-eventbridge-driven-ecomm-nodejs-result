import { ValueValidators } from './ValueValidators'
import { WarehouseEventName } from './WarehouseEventName'

describe(`Warehouse Service ValueValidators tests`, () => {
  describe(`validSkuRestockedEventName tests`, () => {
    it(`throws if eventName is undefined`, () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validSkuRestockedEventName().parse(testValue)).toThrow()
    })

    it(`throws if eventName is not a WareHouseEventName`, () => {
      const testValue = 'mockInvalidValue'
      expect(() => ValueValidators.validSkuRestockedEventName().parse(testValue)).toThrow()
    })

    it(`is valid if eventName is a WarehouseEventName.SKU_RESTOCKED_EVENT`, () => {
      const testValue = WarehouseEventName.SKU_RESTOCKED_EVENT
      expect(() => ValueValidators.validSkuRestockedEventName().parse(testValue)).not.toThrow()
    })
  })

  describe(`validOrderCreatedEventName tests`, () => {
    it(`throws if eventName is undefined`, () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validOrderCreatedEventName().parse(testValue)).toThrow()
    })

    it(`throws if eventName is not a WareHouseEventName`, () => {
      const testValue = 'mockInvalidValue'
      expect(() => ValueValidators.validOrderCreatedEventName().parse(testValue)).toThrow()
    })

    it(`is valid if eventName is a WarehouseEventName.ORDER_CREATED_EVENT`, () => {
      const testValue = WarehouseEventName.ORDER_CREATED_EVENT
      expect(() => ValueValidators.validOrderCreatedEventName().parse(testValue)).not.toThrow()
    })
  })

  describe(`validSku tests`, () => {
    it(`throws if sku is undefined`, () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validSku().parse(testValue)).toThrow()
    })

    it(`throws if sku length < 4`, () => {
      const testValue = '123'
      expect(() => ValueValidators.validSku().parse(testValue)).toThrow()
    })

    it(`is valid if sku length >= 4`, () => {
      const testValue = '1234'
      expect(() => ValueValidators.validSku().parse(testValue)).not.toThrow()
    })
  })

  describe(`validUnits tests`, () => {
    it(`throws if units is undefined`, () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validUnits().parse(testValue)).toThrow()
    })

    it(`throws if units = 0`, () => {
      const testValue = 0
      expect(() => ValueValidators.validUnits().parse(testValue)).toThrow()
    })

    it(`throws if units < 0`, () => {
      const testValue = -1
      expect(() => ValueValidators.validUnits().parse(testValue)).toThrow()
    })

    it(`throws if units is not an integer`, () => {
      const testValue = 2.34
      expect(() => ValueValidators.validUnits().parse(testValue)).toThrow()
    })

    it(`is valid if units >= 1`, () => {
      const testValue = 1
      expect(() => ValueValidators.validUnits().parse(testValue)).not.toThrow()
    })
  })

  describe(`validLotId tests`, () => {
    it(`throws if lotId is undefined`, () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validLotId().parse(testValue)).toThrow()
    })

    it(`throws if lotId length < 4`, () => {
      const testValue = '123'
      expect(() => ValueValidators.validLotId().parse(testValue)).toThrow()
    })

    it(`is valid if lotId length >= 4`, () => {
      const testValue = '1234'
      expect(() => ValueValidators.validLotId().parse(testValue)).not.toThrow()
    })
  })

  describe(`validOrderId tests`, () => {
    it(`throws if orderId is undefined`, () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validOrderId().parse(testValue)).toThrow()
    })

    it(`throws if orderId length < 4`, () => {
      const testValue = '123'
      expect(() => ValueValidators.validOrderId().parse(testValue)).toThrow()
    })

    it(`is valid if orderId length >= 4`, () => {
      const testValue = '1234'
      expect(() => ValueValidators.validOrderId().parse(testValue)).not.toThrow()
    })
  })

  describe(`validCreatedAt tests`, () => {
    it(`throws if createdAt is undefined`, () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validCreatedAt().parse(testValue)).toThrow()
    })

    it(`throws if createdAt length < 4`, () => {
      const testValue = '123'
      expect(() => ValueValidators.validCreatedAt().parse(testValue)).toThrow()
    })

    it(`is valid if createdAt length >= 4`, () => {
      const testValue = '1234'
      expect(() => ValueValidators.validCreatedAt().parse(testValue)).not.toThrow()
    })
  })

  describe(`validUpdatedAt tests`, () => {
    it(`throws if updatedAt is undefined`, () => {
      const testValue = undefined as string
      expect(() => ValueValidators.validUpdatedAt().parse(testValue)).toThrow()
    })

    it(`throws if updatedAt length < 4`, () => {
      const testValue = '123'
      expect(() => ValueValidators.validUpdatedAt().parse(testValue)).toThrow()
    })

    it(`is valid if updatedAt length >= 4`, () => {
      const testValue = '1234'
      expect(() => ValueValidators.validUpdatedAt().parse(testValue)).not.toThrow()
    })
  })
})
