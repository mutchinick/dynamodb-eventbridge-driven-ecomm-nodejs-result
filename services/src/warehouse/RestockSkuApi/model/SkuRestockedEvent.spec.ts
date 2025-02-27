import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { SkuRestockedEvent, SkuRestockedEventInput } from './SkuRestockedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockValidSkuRestockedEventInput(): SkuRestockedEventInput {
  const mockValidInput: SkuRestockedEventInput = {
    sku: 'mockSku',
    units: 2,
    lotId: 'mockLotId',
  }
  return mockValidInput
}

describe(`Warehouse Service RestockSkuApi SkuRestockedEvent tests`, () => {
  //
  // Test SkuRestockedEventData edge cases
  //
  it(`returns a Success if the input SkuRestockedEventInput is valid`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput is undefined`, () => {
    const mockSkuRestockedEventInput = undefined as unknown as SkuRestockedEventInput
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput is null`, () => {
    const mockSkuRestockedEventInput = null as unknown as SkuRestockedEventInput
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test SkuRestockedEventData.sku edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.sku is missing`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    delete mockSkuRestockedEventInput.sku
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.sku is undefined`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = undefined
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.sku is null`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = null
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.sku is empty`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = ''
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.sku is blank`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = '      '
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.sku length < 4`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = '123'
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test SkuRestockedEventData.units edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.units is missing`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    delete mockSkuRestockedEventInput.units
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.units is undefined`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = undefined
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.units is null`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = null
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.units < 0`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = -1
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.units == 0`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = 0
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.units is not an integer`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = 2.34
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.units is not a number`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = '1' as unknown as number
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test SkuRestockedEventData.lotId edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId is missing`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    delete mockSkuRestockedEventInput.lotId
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId is undefined`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = undefined
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId is null`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = null
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId is empty`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = ''
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId is blank`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = '      '
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId length < 4`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = '123'
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<SkuRestockedEvent> with the expected data`, () => {
    const mockSkuRestockedEventInput = buildMockValidSkuRestockedEventInput()
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    const expectedEvent: SkuRestockedEvent = {
      eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
      eventData: {
        sku: mockSkuRestockedEventInput.sku,
        units: mockSkuRestockedEventInput.units,
        lotId: mockSkuRestockedEventInput.lotId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })
})
