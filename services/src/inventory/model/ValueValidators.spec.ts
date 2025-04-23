import { AllocationStatus } from './AllocationStatus'
import { ValueValidators } from './ValueValidators'
import { InventoryEventName } from './InventoryEventName'

describe(`Inventory Service ValueValidators tests`, () => {
  describe(`validSkuRestockedEventName tests`, () => {
    it(`throws if the input eventName is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validSkuRestockedEventName().parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not a WareHouseEventName`, () => {
      const testInput = 'mockInvalidValue'
      expect(() => ValueValidators.validSkuRestockedEventName().parse(testInput)).toThrow()
    })

    it(`is valid if the input eventName is a InventoryEventName.SKU_RESTOCKED_EVENT`, () => {
      const testInput = InventoryEventName.SKU_RESTOCKED_EVENT
      expect(() => ValueValidators.validSkuRestockedEventName().parse(testInput)).not.toThrow()
    })
  })

  describe(`validOrderCreatedEventName tests`, () => {
    it(`throws if the input eventName is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validOrderCreatedEventName().parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not a WareHouseEventName`, () => {
      const testInput = 'mockInvalidValue'
      expect(() => ValueValidators.validOrderCreatedEventName().parse(testInput)).toThrow()
    })

    it(`is valid if the input eventName is a InventoryEventName.ORDER_CREATED_EVENT`, () => {
      const testInput = InventoryEventName.ORDER_CREATED_EVENT
      expect(() => ValueValidators.validOrderCreatedEventName().parse(testInput)).not.toThrow()
    })
  })

  describe(`validOrderEventNameGroup tests`, () => {
    const testEventGroup: InventoryEventName[] = [
      InventoryEventName.ORDER_CANCELED_EVENT,
      InventoryEventName.ORDER_CREATED_EVENT,
      InventoryEventName.ORDER_PAYMENT_REJECTED_EVENT,
    ]

    it(`throws if the input eventName is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validOrderEventNameGroup(testEventGroup).parse(testInput)).toThrow()
    })

    it(`throws if the input the event group is empty`, () => {
      const testInput = InventoryEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validOrderEventNameGroup([]).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName does not exist in the event group`, () => {
      const testInput = InventoryEventName.SKU_RESTOCKED_EVENT
      expect(() => ValueValidators.validOrderEventNameGroup(testEventGroup).parse(testInput)).toThrow()
    })

    it(`is valid if the input eventName exists in the event group`, () => {
      const testInput = InventoryEventName.ORDER_CREATED_EVENT
      expect(() => ValueValidators.validOrderEventNameGroup(testEventGroup).parse(testInput)).not.toThrow()
    })

    it(`is valid if the input eventName exists in an event group with a single eventName`, () => {
      const testInput = InventoryEventName.ORDER_CREATED_EVENT
      expect(() => ValueValidators.validOrderEventNameGroup([testInput]).parse(testInput)).not.toThrow()
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

  describe(`validLotId tests`, () => {
    it(`throws if the input lotId is undefined`, () => {
      const testInput = undefined as string
      expect(() => ValueValidators.validLotId().parse(testInput)).toThrow()
    })

    it(`throws if the input lotId length < 4`, () => {
      const testInput = '123'
      expect(() => ValueValidators.validLotId().parse(testInput)).toThrow()
    })

    it(`is valid if the input lotId length >= 4`, () => {
      const testInput = '1234'
      expect(() => ValueValidators.validLotId().parse(testInput)).not.toThrow()
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

    it(`is valid if the input sortDirection === 'asc`, () => {
      const testInput = 'asc'
      expect(() => ValueValidators.validSortDirection().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input sortDirection === 'desc`, () => {
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

  describe(`validAllocationStatus tests`, () => {
    it(`throws if the input allocationStatus is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).toThrow()
    })

    it(`throws if the input allocationStatus a random string and not an AllocationStatus`, () => {
      const testInput = 'xyz'
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).toThrow()
    })

    it(`throws if the input allocationStatus is not the literal expectedAllocationStatus`, () => {
      const expectedAllocationStatus: AllocationStatus = 'ALLOCATED'
      const testInput: AllocationStatus = 'PAYMENT_REJECTED'
      expect(() => ValueValidators.validAllocationStatus(expectedAllocationStatus).parse(testInput)).toThrow()
    })

    it(`is valid if the input allocationStatus === 'ALLOCATED`, () => {
      const testInput: AllocationStatus = 'ALLOCATED'
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input allocationStatus === 'CANCELED`, () => {
      const testInput: AllocationStatus = 'CANCELED'
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input allocationStatus === 'PAYMENT_REJECTED`, () => {
      const testInput: AllocationStatus = 'PAYMENT_REJECTED'
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input allocationStatus is the literal expectedAllocationStatus`, () => {
      const expectedAllocationStatus: AllocationStatus = 'ALLOCATED'
      const testInput: AllocationStatus = 'ALLOCATED'
      expect(() => ValueValidators.validAllocationStatus(expectedAllocationStatus).parse(testInput)).not.toThrow()
    })
  })
})
