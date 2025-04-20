import { Result } from '../../errors/Result'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { SkuRestockedEvent, SkuRestockedEventInput } from './SkuRestockedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockSku = 'mockSku'
const mockUnits = 2
const mockLotId = 'mockLotId'

function buildMockSkuRestockedEventInput(): SkuRestockedEventInput {
  const mockValidInput: SkuRestockedEventInput = {
    sku: mockSku,
    units: mockUnits,
    lotId: mockLotId,
  }
  return mockValidInput
}

describe(`Orders Service RestockSkuApi cEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SkuRestockedEventInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input SkuRestockedEventInput is valid`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput is undefined`, () => {
    const mockSkuRestockedEventInput = undefined as unknown as SkuRestockedEventInput
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput is null`, () => {
    const mockSkuRestockedEventInput = null as unknown as SkuRestockedEventInput
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test SkuRestockedEventInput.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.sku is undefined`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = undefined
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.sku is null`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = null
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.sku is empty`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = ''
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.sku is blank`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = '      '
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.sku length < 4`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = '123'
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test SkuRestockedEventInput.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.units is undefined`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = undefined
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.units is null`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = null
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.units < 1`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = 0
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.units is not an integer`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = 3.45
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.units is not a number`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = '1' as unknown as number
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test SkuRestockedEventInput.lotId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.lotId is undefined`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = undefined
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.lotId is null`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = null
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.lotId is empty`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = ''
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.lotId is blank`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = '      '
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input SkuRestockedEventInput.lotId length < 4`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = '123'
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<SkuRestockedEvent> if the execution path is successful`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
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
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
