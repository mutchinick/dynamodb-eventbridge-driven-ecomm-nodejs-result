import { WarehouseEventName } from '../../model/WarehouseEventName'
import { SkuRestockedEvent, SkuRestockedEventInput } from './SkuRestockedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockValidSkuRestockedEventInput() {
  const mockValidInput: SkuRestockedEventInput = {
    sku: 'mockSku',
    units: 2,
    lotId: 'mockLotId',
  }
  return mockValidInput
}

describe('Warehouse Service RestockSkuApi SkuRestockedEvent tests', () => {
  //
  // Test SkuRestockedEventData edge cases
  //
  it('does not throw if the input SkuRestockedEventInput is valid', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).not.toThrow()
  })

  it('throws if the input SkuRestockedEventInput is undefined', () => {
    const mockSkuRestockedEventInput = undefined as unknown as SkuRestockedEventInput
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput is null', () => {
    const mockSkuRestockedEventInput = null as unknown as SkuRestockedEventInput
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  //
  // Test SkuRestockedEventData.sku edge cases
  //
  it('throws if the input SkuRestockedEventInput.sku is missing', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    delete mockSkuRestockedEventInput.sku
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.sku is undefined', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = undefined
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.sku is null', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = null
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.sku is empty', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = ''
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.sku is blank', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = '      '
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.sku length < 4', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = '123'
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  //
  // Test SkuRestockedEventData.units edge cases
  //
  it('throws if the input SkuRestockedEventInput.units is missing', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    delete mockSkuRestockedEventInput.units
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.units is undefined', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = undefined
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.units is null', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = null
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.units < 0', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = -1
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.units == 0', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = 0
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.units is not an integer', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = 2.34
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.units is not a number', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = '1' as unknown as number
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  //
  // Test SkuRestockedEventData.lotId edge cases
  //
  it('throws if the input SkuRestockedEventInput.lotId is missing', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    delete mockSkuRestockedEventInput.lotId
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.lotId is undefined', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = undefined
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.lotId is null', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = null
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.lotId is empty', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = ''
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.lotId is blank', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = '      '
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  it('throws if the input SkuRestockedEventInput.lotId length < 4', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = '123'
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).toThrow()
  })

  //
  // Test expected results
  //
  it('returns the expected SkuRestockedEvent with eventName and eventData', () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    const expected: SkuRestockedEvent = {
      eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
      eventData: {
        sku: mockSkuRestockedEventInput.sku,
        units: mockSkuRestockedEventInput.units,
        lotId: mockSkuRestockedEventInput.lotId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const skuRestockedEvent = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(skuRestockedEvent).toMatchObject(expected)
  })
})
