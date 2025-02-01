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

describe('Testing Service SimulateRawEventApi RawSimulatedEvent tests', () => {
  //
  // Test RawSimulatedEventData edge cases
  //
  it('does not throw if the input RawSimulatedEventInput is valid', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).not.toThrow()
  })

  it('throws if the input RawSimulatedEventInput is undefined', () => {
    const mockRawSimulatedEventInput = undefined as unknown as RawSimulatedEventInput
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput is null', () => {
    const mockRawSimulatedEventInput = null as unknown as RawSimulatedEventInput
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  //
  // Test RawSimulatedEventData.pk edge cases
  //
  it('throws if the input RawSimulatedEventInput.pk is missing', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.pk
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.pk is undefined', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = undefined
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.pk is null', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = null
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.pk is empty', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = ''
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.pk is blank', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = '      '
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  //
  // Test RawSimulatedEventData.sk edge cases
  //
  it('throws if the input RawSimulatedEventInput.sk is missing', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.sk
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.sk is undefined', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = undefined
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.sk is null', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = null
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.sk is empty', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = ''
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.sk is blank', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = '      '
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  //
  // Test RawSimulatedEventData.eventName edge cases
  //
  it('throws if the input RawSimulatedEventInput.eventName is missing', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.eventName
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.eventName is undefined', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = undefined
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.eventName is null', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = null
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.eventName is empty', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = ''
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  it('throws if the input RawSimulatedEventInput.eventName is blank', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = '      '
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).toThrow()
  })

  //
  // Test RawSimulatedEventData.createdAt edge cases
  //
  it('sets the current RawSimulatedEventInput.createdAt to the current date if it is missing', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.createdAt
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.createdAt).toBe(mockDate)
  })

  it('sets the current RawSimulatedEventInput.createdAt to the current date if it is undefined', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = undefined
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.createdAt).toBe(mockDate)
  })

  it('sets the current RawSimulatedEventInput.createdAt to the current date if it is empty', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = ''
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.createdAt).toBe(mockDate)
  })

  it('sets the current RawSimulatedEventInput.createdAt to the current date if it is blank', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = '      '
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.createdAt).toBe(mockDate)
  })

  //
  // Test RawSimulatedEventData.updatedAt edge cases
  //
  it('sets the current RawSimulatedEventInput.updatedAt to the current date if it is missing', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.updatedAt
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.updatedAt).toBe(mockDate)
  })

  it('sets the current RawSimulatedEventInput.updatedAt to the current date if it is undefined', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = undefined
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.updatedAt).toBe(mockDate)
  })

  it('sets the current RawSimulatedEventInput.updatedAt to the current date if it is empty', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = ''
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.updatedAt).toBe(mockDate)
  })

  it('sets the current RawSimulatedEventInput.updatedAt to the current date if it is blank', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = '      '
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.updatedAt).toBe(mockDate)
  })

  //
  // Test expected results
  //
  it('returns the expected RawSimulatedEvent with eventName and eventData', () => {
    const mockRawSimulatedEventInput = buildMockValidRawSimulatedEventInput()
    const expected: RawSimulatedEvent = {
      pk: 'mockPk',
      sk: 'mockSk',
      eventName: 'mockEventName',
      eventData: {},
      createdAt: mockDate,
      updatedAt: mockDate,
      _tn: '#EVENT',
    }
    const rawSimulatedEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(rawSimulatedEvent).toMatchObject(expected)
  })
})
