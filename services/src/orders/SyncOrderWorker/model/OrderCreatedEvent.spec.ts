import { Result } from '../../errors/Result'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { OrderCreatedEvent, OrderCreatedEventInput } from './OrderCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockOrderData(): OrderData {
  return {
    orderId: 'mockOrderId',
    orderStatus: OrderStatus.ORDER_CREATED_STATUS,
    sku: 'mockSku',
    units: 14,
    price: 1897.99,
    userId: 'mockUserId',
    createdAt: 'mockCreatedAt',
    updatedAt: 'mockUpdatedAt',
  }
}

function buildMockOrderCreatedEventInput(): OrderCreatedEventInput {
  return {
    incomingEventName: OrderEventName.ORDER_PLACED_EVENT,
    orderData: buildMockOrderData(),
  }
}

describe(`Orders Service SyncOrderWorker OrderCreatedEvent tests`, () => {
  //
  // Test valid inputs
  //
  it(`returns a Success if the input OrderCreatedEventInput is valid`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  //
  // Test OrderCreatedEventInput edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput is undefined`, () => {
    const mockOrderCreatedEventInput = undefined as never
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput is null`, () => {
    const mockOrderCreatedEventInput = null as never
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput is invalid`, () => {
    const mockOrderCreatedEventInput = 'mockInvalidValue' as never
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test eventName edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is missing`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.incomingEventName
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = undefined
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = null
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = '' as OrderEventName
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = '      ' as OrderEventName
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is not an IncomingOrderEventName`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = 'mockEventName' as OrderEventName
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderCreatedEventInput.orderData edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData is missing`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData = undefined
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData = null
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData = {} as never
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderCreatedEventInput.orderData.orderId edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId is missing`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.orderId
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = undefined
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = null
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = ''
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = '      '
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = '123'
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderCreatedEventInput.orderData.orderStatus edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus is missing`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.orderStatus
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = undefined
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = null
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = '' as OrderStatus
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = '      ' as OrderStatus
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus not an OrderStatus`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = 'mockOrderStatus' as OrderStatus
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderCreatedEventInput.orderData.sku edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku is missing`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.sku
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = undefined
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = null
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = ''
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = '      '
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = '123'
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderCreatedEventInput.orderData.units edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units is missing`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.units
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = undefined
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = null
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units < 0`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = -1
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units == 0`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = 0
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units is not a number`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = '1' as unknown as number
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units is not an integer`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = 3.45
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderCreatedEventInput.orderData.price edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.price is missing`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.price
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.price is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = undefined
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.price is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = null
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.price < 0`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = -1
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.price is not a number`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = '1' as unknown as number
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderCreatedEventInput.orderData.userId edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId is missing`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.userId
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = undefined
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = null
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = ''
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = '      '
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = '123'
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderCreatedEventInput.orderData.createdAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt is missing`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.createdAt
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = undefined
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = null
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = ''
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = '      '
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = '123'
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test OrderCreatedEventInput.orderData.updatedAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt is missing`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    delete mockOrderCreatedEventInput.orderData.updatedAt
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = undefined
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = null
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = ''
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = '      '
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = '123'
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns te expected Success<OrderCreatedEvent? with the expected data`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    const expectedEvent: OrderCreatedEvent = {
      eventName: OrderEventName.ORDER_CREATED_EVENT,
      eventData: mockOrderCreatedEventInput.orderData,
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
