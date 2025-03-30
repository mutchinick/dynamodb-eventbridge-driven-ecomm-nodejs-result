import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { IncomingOrderEvent } from './IncomingOrderEvent'
import { UpdateOrderCommand, UpdateOrderCommandInput } from './UpdateOrderCommand'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingOrderEvent() {
  const mockValidOrderEvent: TypeUtilsMutable<IncomingOrderEvent> = {
    eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
    eventData: {
      orderId: 'mockOrderId',
      orderStatus: OrderStatus.ORDER_CREATED_STATUS,
      sku: 'mockSku',
      units: 12,
      price: 1440,
      userId: 'mockUserId',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidOrderEvent
}

function buildMockOrderData() {
  const mockValidOrderData: OrderData = {
    orderId: 'mockOrderId',
    orderStatus: OrderStatus.ORDER_CREATED_STATUS,
    sku: 'mockSku',
    units: 12,
    price: 1440,
    userId: 'mockUserId',
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidOrderData
}

function buildMockUpdateOrderCommandInput() {
  const mockValidInput: TypeUtilsMutable<UpdateOrderCommandInput> = {
    existingOrderData: buildMockOrderData(),
    incomingOrderEvent: buildMockIncomingOrderEvent(),
  }
  return mockValidInput
}

describe(`Orders Service SyncOrderWorker UpdateOrderCommand tests`, () => {
  //
  // Test UpdateOrderCommandInput edge cases
  //
  it(`returns a Success if the input UpdateOrderCommandInput is valid`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput is undefined`, () => {
    const mockUpdateOrderCommandInput: UpdateOrderCommandInput = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput is null`, () => {
    const mockUpdateOrderCommandInput: UpdateOrderCommandInput = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.orderId edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      existingOrderData is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData = null
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_STOCK_ALLOCATED_EVENT
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.orderId
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = '' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = '      ' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = 'ABC' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.orderStatus edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.orderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = '' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = '      ' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus not an OrderStatus`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = 'mockInvalidValue' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.sku edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.sku
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = '' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = '      ' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = '      ' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.units edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.units
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.units = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.units = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units < 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.units = -1
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units == 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.units = 0
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units is not a number`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.units = '1' as unknown as number
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.price edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.price is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.price
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.price is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.price is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.price < 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = -1
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.price is not a number`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = '1' as unknown as number
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.userId edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.userId
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = ''
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = '      '
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = '123'
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.createdAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.createdAt
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = ''
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = '      '
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = '123'
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.updatedAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.updatedAt
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = ''
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = '      '
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = '123'
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventName edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventName
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = '' as OrderEventName
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = '      ' as OrderEventName
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is not an IncomingOrderEventName`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = 'mockOrderEventName' as OrderEventName
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = ''
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = '      '
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = '123'
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus edge cases
  //
  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = '' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = '      ' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is not an OrderStatus`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = 'mockOrderStatus' as OrderStatus
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.sku edge cases
  //
  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = ''
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = '      '
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.sku length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = '123'
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.units edge cases
  //
  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.units is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.units is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.units is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.units < 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = -1
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.units == 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = 0
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.units is not an integer`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = 3.45
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.units is not a number`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = '1' as unknown as number
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.price edge cases
  //
  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.price is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.price is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.price is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.price < 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = -1
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.price is not a number`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = '1' as unknown as number
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.userId edge cases
  //
  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = ''
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = '      '
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.userId length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = '123'
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt edge cases
  //
  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = ''
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = '      '
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = '123'
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt edge cases
  //
  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a Success if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = ''
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = '      '
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = '123'
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.createdAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.createdAt
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = ''
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = '      '
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = '123'
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.updatedAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = undefined
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = null
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = ''
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = '      '
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = '123'
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test order status transition errors
  // COMBAK: Somehow test all possible invalid transitions using a loop?
  //
  it(`returns a non-transient Failure of kind ForbiddenOrderStatusTransitionError error if the input
      existingOrderData.orderStatus is not valid for transition`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_CANCELED_STATUS
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_STOCK_ALLOCATED_EVENT
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'ForbiddenOrderStatusTransitionError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind RedundantOrderStatusTransitionError error if the input
      existingOrderData.orderStatus is not ready for transition`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_PAYMENT_ACCEPTED_EVENT
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'RedundantOrderStatusTransitionError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a transient Failure of kind NotReadyOrderStatusTransitionError error if the input
      existingOrderData.orderStatus is not ready for transition`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_CREATED_STATUS
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_FULFILLED_EVENT
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'NotReadyOrderStatusTransitionError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  //
  // Test expected results
  // COMBAK: Somehow test all possible valid transitions using a loop?
  //
  it(`returns the expected Success<UpdateOrderCommand> with orderStatus === ORDER_STOCK_ALLOCATED_STATUS`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    const expectedCommand: UpdateOrderCommand = {
      orderData: {
        orderId: mockUpdateOrderCommandInput.existingOrderData.orderId,
        orderStatus: OrderStatus.ORDER_STOCK_ALLOCATED_STATUS,
        updatedAt: mockDate,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })

  it(`returns the expected Success<UpdateOrderCommand> with orderStatus === ORDER_STOCK_DEPLETED_STATUS`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_STOCK_DEPLETED_EVENT
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    const expectedCommand: UpdateOrderCommand = {
      orderData: {
        orderId: mockUpdateOrderCommandInput.existingOrderData.orderId,
        orderStatus: OrderStatus.ORDER_STOCK_DEPLETED_STATUS,
        updatedAt: mockDate,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
