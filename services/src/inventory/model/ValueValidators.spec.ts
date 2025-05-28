import { AllocationStatus } from './AllocationStatus'
import { InventoryEventName } from './InventoryEventName'
import { ValueValidators } from './ValueValidators'

describe(`Inventory Service ValueValidators tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test validInventoryEventName
   ************************************************************/
  describe(`validInventoryEventName tests`, () => {
    it(`throws if the input eventName is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validInventoryEventName().parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validInventoryEventName().parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validInventoryEventName().parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not a InventoryEventName`, () => {
      const testInput = 'mockInvalidValue'
      expect(() => ValueValidators.validInventoryEventName().parse(testInput)).toThrow()
    })

    it(`is valid if the input eventName is a InventoryEventName like ORDER_STOCK_ALLOCATED_EVENT`, () => {
      const testInput: InventoryEventName = InventoryEventName.ORDER_STOCK_ALLOCATED_EVENT
      expect(() => ValueValidators.validInventoryEventName().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input eventName is a InventoryEventName like ORDER_CANCELED_EVENT`, () => {
      const testInput: InventoryEventName = InventoryEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validInventoryEventName().parse(testInput)).not.toThrow()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test validInventoryEventNameLiteral
   ************************************************************/
  describe(`validInventoryEventNameLiteral tests`, () => {
    it(`throws if the input eventName is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validInventoryEventNameLiteral(testInput).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validInventoryEventNameLiteral(testInput).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is empty`, () => {
      const testInput = '' as never
      expect(() => ValueValidators.validInventoryEventNameLiteral(testInput).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not a InventoryEventName`, () => {
      const testInput = 'mockInvalidValue' as never
      expect(() => ValueValidators.validInventoryEventNameLiteral(testInput).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not the expected InventoryEventName`, () => {
      const testInput = InventoryEventName.ORDER_PAYMENT_REJECTED_EVENT
      const expectedEventName = InventoryEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validInventoryEventNameLiteral(expectedEventName).parse(testInput)).toThrow()
    })

    it(`is valid if the input eventName is the expected InventoryEventName`, () => {
      const testInput = InventoryEventName.ORDER_CANCELED_EVENT
      const expectedEventName = InventoryEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validInventoryEventNameLiteral(expectedEventName).parse(testInput)).not.toThrow()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test validInventoryEventNameGroup
   ************************************************************/
  describe(`validInventoryEventNameGroup tests`, () => {
    const testEventGroup: InventoryEventName[] = [
      InventoryEventName.ORDER_CANCELED_EVENT,
      InventoryEventName.ORDER_STOCK_ALLOCATED_EVENT,
      InventoryEventName.ORDER_STOCK_DEPLETED_EVENT,
    ]

    it(`throws if the input eventName is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validInventoryEventNameGroup(testEventGroup).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validInventoryEventNameGroup(testEventGroup).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is empty`, () => {
      const testInput = '' as never
      expect(() => ValueValidators.validInventoryEventNameGroup(testEventGroup).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName is not a InventoryEventName`, () => {
      const testInput = 'mockInvalidValue' as never
      expect(() => ValueValidators.validInventoryEventNameGroup([testInput]).parse(testInput)).toThrow()
    })

    it(`throws if the input event group is empty`, () => {
      const testInput = InventoryEventName.ORDER_CANCELED_EVENT
      expect(() => ValueValidators.validInventoryEventNameGroup([]).parse(testInput)).toThrow()
    })

    it(`throws if the input eventName does not exist in the event group`, () => {
      const testInput = InventoryEventName.ORDER_CREATED_EVENT
      expect(() => ValueValidators.validInventoryEventNameGroup(testEventGroup).parse(testInput)).toThrow()
    })

    it(`is valid if the input eventName exists in the event group`, () => {
      const testInput = InventoryEventName.ORDER_STOCK_ALLOCATED_EVENT
      expect(() => ValueValidators.validInventoryEventNameGroup(testEventGroup).parse(testInput)).not.toThrow()
    })

    it(`is valid if the input eventName exists in an event group with a single event name`, () => {
      const testInput = InventoryEventName.ORDER_STOCK_DEPLETED_EVENT
      expect(() => ValueValidators.validInventoryEventNameGroup([testInput]).parse(testInput)).not.toThrow()
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
   * Test validAllocationStatus
   ************************************************************/
  describe(`validAllocationStatus tests`, () => {
    it(`throws if the input allocationStatus is undefined`, () => {
      const testInput = undefined as never
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).toThrow()
    })

    it(`throws if the input allocationStatus is null`, () => {
      const testInput = null as never
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).toThrow()
    })

    it(`throws if the input allocationStatus is empty`, () => {
      const testInput = ''
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).toThrow()
    })

    it(`throws if the input allocationStatus is not a AllocationStatus`, () => {
      const testInput = 'mockInvalidValue'
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).toThrow()
    })

    it(`is valid if the input allocationStatus is a AllocationStatus like ALLOCATED`, () => {
      const testInput: AllocationStatus = 'ALLOCATED'
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).not.toThrow()
    })

    it(`is valid if the input allocationStatus is a AllocationStatus like PAYMENT_REJECTED`, () => {
      const testInput: AllocationStatus = 'PAYMENT_REJECTED'
      expect(() => ValueValidators.validAllocationStatus().parse(testInput)).not.toThrow()
    })
  })
})
