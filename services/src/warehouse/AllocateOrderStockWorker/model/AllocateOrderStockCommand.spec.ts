import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'
import { AllocateOrderStockCommand, AllocateOrderStockCommandInput } from './AllocateOrderStockCommand'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingOrderCreatedEvent = {
  -readonly [K in keyof IncomingOrderCreatedEvent]: IncomingOrderCreatedEvent[K]
}

type Mutable_AllocateOrderStockCommandInput = {
  incomingOrderCreatedEvent: Mutable_IncomingOrderCreatedEvent
}

function buildMockValidIncomingOrderCreatedEvent(): Mutable_IncomingOrderCreatedEvent {
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

function buildMockValidAllocateOrderStockCommandInput() {
  const mockValidInput: Mutable_AllocateOrderStockCommandInput = {
    incomingOrderCreatedEvent: buildMockValidIncomingOrderCreatedEvent(),
  }
  return mockValidInput
}

describe('Warehouse Service AllocateOrderStockWorker AllocateOrderStockCommand tests', () => {
  it('does not throw if the input AllocateOrderStockCommandInput is valid', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).not.toThrow()
  })

  //
  // Test AllocateOrderStockCommandInput edge cases
  //
  it('throws if the input AllocateOrderStockCommandInput is undefined', () => {
    const mockAllocateOrderStockCommandInput: AllocateOrderStockCommandInput = undefined
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput is null', () => {
    const mockAllocateOrderStockCommandInput: AllocateOrderStockCommandInput = null
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName edge cases
  //
  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is missing', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is undefined', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName = undefined
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is null', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName = null
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is empty', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName = '' as never
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is blank', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName = '      ' as never
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName is not an ORDER_CREATED_EVENT', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventName = 'mockWarehouseEventName' as never
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku edge cases
  //
  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku is missing', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku is undefined', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku = undefined
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku is null', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku = null
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku is empty', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku = ''
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku is blank', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku = '      '
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku length < 4', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku = '123'
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units edge cases
  //
  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units is missing', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units is undefined', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = undefined
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units is null', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = null
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units < 0', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = -1
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units == 0', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = 0
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units is not an integer', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = 3.45
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units is not a number', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units = '1' as unknown as number
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId edge cases
  //
  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId is missing', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId is undefined', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId = undefined
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId is null', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId = null
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId is empty', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId = ''
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId is blank', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId = '      '
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId length < 4', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId = '123'
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt edge cases
  //
  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt is missing', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt is undefined', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt = undefined
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt is null', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt = null
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt is empty', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt = ''
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt is blank', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt = '      '
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt length < 4', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.createdAt = '123'
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  //
  // Test AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt edge cases
  //
  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt is missing', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    delete mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt is undefined', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt = undefined
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt is null', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt = null
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt is empty', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt = ''
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt is blank', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt = '      '
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  it('throws if the input AllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt length < 4', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.updatedAt = '123'
    expect(() => AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)).toThrow()
  })

  //
  // Test expected results
  //
  it('returns the expected AllocateOrderStockCommand', () => {
    const mockAllocateOrderStockCommandInput = buildMockValidAllocateOrderStockCommandInput()
    const allocateOrderStockCommand = AllocateOrderStockCommand.validateAndBuild(mockAllocateOrderStockCommandInput)
    const expected: AllocateOrderStockCommand = {
      allocateOrderStockData: {
        sku: mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.sku,
        units: mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.units,
        orderId: mockAllocateOrderStockCommandInput.incomingOrderCreatedEvent.eventData.orderId,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      options: {},
    }
    expect(allocateOrderStockCommand).toMatchObject(expected)
  })
})
