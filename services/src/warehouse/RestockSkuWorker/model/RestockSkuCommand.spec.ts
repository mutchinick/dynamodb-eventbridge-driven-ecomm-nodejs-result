import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'
import { RestockSkuCommand, RestockSkuCommandInput } from './RestockSkuCommand'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingSkuRestockedEvent = {
  -readonly [K in keyof IncomingSkuRestockedEvent]: IncomingSkuRestockedEvent[K]
}

type Mutable_RestockSkuCommandInput = {
  incomingSkuRestockedEvent: Mutable_IncomingSkuRestockedEvent
}

function buildMockValidIncomingSkuRestockedEvent(): Mutable_IncomingSkuRestockedEvent {
  const mockValidWarehouseEvent: Mutable_IncomingSkuRestockedEvent = {
    eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    eventData: {
      sku: 'mockSku',
      units: 12,
      lotId: 'mockLotId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidWarehouseEvent
}

function buildMockValidRestockSkuCommandInput() {
  const mockValidInput: Mutable_RestockSkuCommandInput = {
    incomingSkuRestockedEvent: buildMockValidIncomingSkuRestockedEvent(),
  }
  return mockValidInput
}

describe('Warehouse Service RestockSkuWorker RestockSkuCommand tests', () => {
  it('does not throw if the input RestockSkuCommandInput is valid', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).not.toThrow()
  })

  //
  // Test RestockSkuCommandInput edge cases
  //
  it('throws if the input RestockSkuCommandInput is undefined', () => {
    const mockRestockSkuCommandInput: RestockSkuCommandInput = undefined
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput is null', () => {
    const mockRestockSkuCommandInput: RestockSkuCommandInput = null
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  //
  // Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventName edge cases
  //
  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is missing', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    delete mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is undefined', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = undefined
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is null', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = null
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is empty', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = '' as never
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is blank', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = '      ' as never
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is not an SKU_RESTOCKED_EVENT', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = 'mockWarehouseEventName' as never
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  //
  // Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku edge cases
  //
  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is missing', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    delete mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is undefined', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = undefined
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is null', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = null
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is empty', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = ''
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is blank', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = '      '
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku length < 4', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = '123'
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  //
  // Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units edge cases
  //
  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is missing', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    delete mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is undefined', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = undefined
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is null', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = null
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units < 0', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = -1
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units == 0', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = 0
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is not an integer', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = 3.45
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is not a number', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = '1' as unknown as number
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  //
  // Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId edge cases
  //
  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is missing', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    delete mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is undefined', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = undefined
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is null', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = null
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is empty', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = ''
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is blank', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = '      '
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId length < 4', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = '123'
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  //
  // Test RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt edge cases
  //
  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is missing', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    delete mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is undefined', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = undefined
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is null', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = null
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is empty', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = ''
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is blank', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = '      '
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt length < 4', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = '123'
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  //
  // Test RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt edge cases
  //
  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is missing', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    delete mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is undefined', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = undefined
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is null', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = null
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is empty', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = ''
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is blank', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = '      '
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  it('throws if the input RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt length < 4', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = '123'
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).toThrow()
  })

  //
  // Test expected results
  //
  it('returns the expected RestockSkuCommand', () => {
    const mockRestockSkuCommandInput = buildMockValidRestockSkuCommandInput()
    const restockSkuCommand = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    const expected: RestockSkuCommand = {
      restockSkuData: {
        sku: mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku,
        units: mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units,
        lotId: mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      options: {},
    }
    expect(restockSkuCommand).toMatchObject(expected)
  })
})
