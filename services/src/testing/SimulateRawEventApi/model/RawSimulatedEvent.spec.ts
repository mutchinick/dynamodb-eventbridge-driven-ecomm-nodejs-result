import { Result } from '../../errors/Result'
import { RawSimulatedEvent, RawSimulatedEventInput } from './RawSimulatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockValidRawSimulatedEventInput() {
  const mockValidInput: RawSimulatedEventInput = {
    pk: 'mockPk',
    sk: 'mockSk',
    eventName: 'mockEventName',
    eventData: {},
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidInput
}

describe(`Testing Service SimulateRawEventApi RawSimulatedEvent tests`, () => {
  //
  // Test RawSimulatedEventData edge cases
  //
  it(`return a Success if the input RawSimulatedEventInput is valid`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput is undefined`, () => {
    const mockRawSimulatedEventInput = undefined as unknown as RawSimulatedEventInput
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput is null`, () => {
    const mockRawSimulatedEventInput = null as unknown as RawSimulatedEventInput
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test RawSimulatedEventData.pk edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.pk is missing`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.pk
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.pk is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = undefined
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.pk is null`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = null
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.pk is empty`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = ''
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.pk is blank`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = '      '
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test RawSimulatedEventData.sk edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.sk is missing`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.sk
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.sk is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = undefined
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.sk is null`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = null
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.sk is empty`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = ''
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.sk is blank`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = '      '
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test RawSimulatedEventData.eventName edge cases
  //
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.eventName is missing`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.eventName
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.eventName is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = undefined
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.eventName is null`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = null
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.eventName is empty`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = ''
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.eventName is blank`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = '      '
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test RawSimulatedEventData.createdAt edge cases
  //
  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is missing`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.createdAt
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.createdAt).toEqual(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = undefined
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.createdAt).toEqual(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is empty`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = ''
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.createdAt).toEqual(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is blank`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = '      '
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.createdAt).toEqual(mockDate)
  })

  //
  // Test RawSimulatedEventData.updatedAt edge cases
  //
  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is missing`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.updatedAt
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.updatedAt).toEqual(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = undefined
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.updatedAt).toEqual(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is empty`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = ''
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.updatedAt).toEqual(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is blank`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = '      '
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.updatedAt).toEqual(mockDate)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<RawSimulatedEvent> with eventName and eventData`, () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    const expectedEvent: RawSimulatedEvent = {
      pk: 'mockPk',
      sk: 'mockSk',
      eventName: 'mockEventName',
      eventData: {},
      createdAt: mockDate,
      updatedAt: mockDate,
      _tn: '#EVENT',
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(result).toMatchObject(expectedResult)
  })
})
