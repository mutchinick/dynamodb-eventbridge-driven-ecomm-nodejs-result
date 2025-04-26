import { Result } from '../../errors/Result'
import { RawSimulatedEvent, RawSimulatedEventInput } from './RawSimulatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockPk = 'mockPk'
const mockSk = 'mockSk'
const mockEventName = 'mockEventName'
const mockEventData = 'mockEventData'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate

function buildMockRawSimulatedEventInput(): RawSimulatedEventInput {
  const mockValidInput: RawSimulatedEventInput = {
    pk: mockPk,
    sk: mockSk,
    eventName: mockEventName,
    eventData: mockEventData,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }
  return mockValidInput
}

describe(`Testing Service SimulateRawEventApi RawSimulatedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test RawSimulatedEventInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input RawSimulatedEventInput is valid`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(false)
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

  /*
   *
   *
   ************************************************************
   * Test RawSimulatedEventInput.pk edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.pk is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = undefined
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.pk is null`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = null
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.pk is empty`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = ''
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.pk is blank`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = '      '
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test RawSimulatedEventInput.sk edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.sk is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = undefined
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.sk is null`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = null
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.sk is empty`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = ''
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.sk is blank`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = '      '
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test RawSimulatedEventInput.eventName edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.eventName is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = undefined
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.eventName is null`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = null
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.eventName is empty`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = ''
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RawSimulatedEventInput.eventName is blank`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = '      '
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test RawSimulatedEventInput.createdAt edge cases
   ************************************************************/
  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is
      undefined`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = undefined
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.createdAt).toEqual(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is
      empty`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = ''
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.createdAt).toEqual(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is
      blank`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = '      '
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.createdAt).toEqual(mockDate)
  })

  /*
   *
   *
   ************************************************************
   * Test RawSimulatedEventInput.updatedAt edge cases
   ************************************************************/
  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is
      undefined`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = undefined
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.updatedAt).toEqual(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is
      empty`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = ''
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.updatedAt).toEqual(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is
      blank`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = '      '
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(Result.isSuccess(result) && result.value.updatedAt).toEqual(mockDate)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<RawSimulatedEvent> if the execution path is
      successful`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    const result = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    const expectedEvent: RawSimulatedEvent = {
      pk: mockRawSimulatedEventInput.pk,
      sk: mockRawSimulatedEventInput.sk,
      eventName: mockRawSimulatedEventInput.eventName,
      eventData: mockRawSimulatedEventInput.eventData,
      createdAt: mockRawSimulatedEventInput.createdAt,
      updatedAt: mockRawSimulatedEventInput.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
