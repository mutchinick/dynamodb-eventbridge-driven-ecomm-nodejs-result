import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { AllocateOrderStockCommand, AllocateOrderStockCommandInput } from './AllocateOrderStockCommand'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingOrderCreatedEvent = {
  -readonly [K in keyof IncomingOrderCreatedEvent]: IncomingOrderCreatedEvent[K]
}

type Mutable_AllocateOrderStockCommandInput = {
  incomingOrderCreatedEvent: Mutable_IncomingOrderCreatedEvent
}

function buildMockIncomingOrderCreatedEvent(): Mutable_IncomingOrderCreatedEvent {
  const mockValidWarehouseEvent: Mutable_IncomingOrderCreatedEvent = {
    eventName: WarehouseEventName.ORDER_CREATED_EVENT,
    eventData: {
      sku: 'mockSku',
      units: 12,
      orderId: 'mockOrderId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidWarehouseEvent
}

function buildMockAllocateOrderStockCommandInput(): Mutable_AllocateOrderStockCommandInput {
  const mockValidInput: Mutable_AllocateOrderStockCommandInput = {
    incomingOrderCreatedEvent: buildMockIncomingOrderCreatedEvent(),
  }
  return mockValidInput
}

describe(`Warehouse Service AllocateOrderStockWorker AllocateOrderStockCommand tests`, () => {
  //
  // Test AllocateOrderStockCommandInput edge cases
  //
  it(`returns a Success if the input AllocateOrderStockCommandInput is valid`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput is undefined`, () => {
    const mockAllocateOrderStockCommandInput: AllocateOrderStockCommandInput = undefined
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput is null`, () => {
    const mockAllocateOrderStockCommandInput: AllocateOrderStockCommandInput = null
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is missing`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is undefined`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName = undefined
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is null`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName = null
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is empty`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName = '' as never
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is blank`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName = '      ' as never
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is not an ORDER_CREATED_EVENT`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName = 'mockWarehouseEventName' as never
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku is missing`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku is undefined`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku = undefined
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku is null`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku = null
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku is empty`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku = ''
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku is blank`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku = '      '
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku length < 4`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku = '123'
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units is missing`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units is undefined`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = undefined
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units is null`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = null
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units < 0`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = -1
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units == 0`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = 0
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units is not an integer`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = 3.45
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units is not a number`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = '1' as unknown as number
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId is missing`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId is undefined`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId = undefined
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId is null`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId = null
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId is empty`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId = ''
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId is blank`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId = '      '
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId length < 4`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId = '123'
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt is missing`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt is undefined`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt = undefined
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt is null`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt = null
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt is empty`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt = ''
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt is blank`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt = '      '
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt length < 4`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt = '123'
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt is missing`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt is undefined`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt = undefined
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt is null`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt = null
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt is empty`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt = ''
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt is blank`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt = '      '
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt length < 4`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt = '123'
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<AllocateOrderStockCommand> with the expected data`, () => {
    const mockAllocateOrderStockCommandInput = buildMockAllocateOrderStockCommandInput()
    const result = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    const expectedCommand: AllocateOrderStockCommand = {
      allocateOrderStockData: {
        sku: mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku,
        units: mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units,
        orderId: mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toMatchObject(expectedResult)
  })
})
