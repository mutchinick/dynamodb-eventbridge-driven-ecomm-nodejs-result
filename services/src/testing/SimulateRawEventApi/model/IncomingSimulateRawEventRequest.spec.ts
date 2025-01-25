import {
  IncomingSimulateRawEventRequest,
  IncomingSimulateRawEventRequestInput,
} from './IncomingSimulateRawEventRequest'

function buildMockValidIncomingSimulateRawEventRequestInput(): IncomingSimulateRawEventRequestInput {
  const mockValidRequestInput: IncomingSimulateRawEventRequestInput = {
    pk: 'mockPk',
    sk: 'mockSk',
    eventName: 'mockEventName',
    eventData: {},
    createdAt: 'mockCreatedAt',
    updatedAt: 'mockUpdatedAt',
  }
  return mockValidRequestInput
}

describe('Testing Service SimulateRawEventApi IncomingSimulateRawEventRequest tests', () => {
  //
  // Test IncomingSimulateRawEventRequestInput edge cases
  //
  it('throws if the input IncomingSimulateRawEventRequestInput is undefined', async () => {
    const mockIncomingSimulateRawEventRequestInput = undefined as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput is null', async () => {
    const mockIncomingSimulateRawEventRequestInput = null as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput is invalid', async () => {
    const mockIncomingSimulateRawEventRequestInput = 'mockInvalidValue' as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  //
  // Test IncomingSimulateRawEventRequestInput.pk edge cases
  //
  it('throws if the input IncomingSimulateRawEventRequestInput.pk is missing', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    delete mockIncomingSimulateRawEventRequestInput.pk
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.pk is undefined', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = undefined as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.pk is null', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = null as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.pk is empty', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = '' as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.pk is blank', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = '      ' as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.pk is not a string', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = 123456 as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  //
  // Test IncomingSimulateRawEventRequestInput.sk edge cases
  //
  it('throws if the input IncomingSimulateRawEventRequestInput.sk is missing', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    delete mockIncomingSimulateRawEventRequestInput.sk
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.sk is undefined', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = undefined as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.sk is null', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = null as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.sk is empty', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = '' as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.sk is blank', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = '      ' as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.sk is not a string', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = 123456 as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  //
  // Test IncomingSimulateRawEventRequestInput.eventName edge cases
  //
  it('throws if the input IncomingSimulateRawEventRequestInput.eventName is missing', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    delete mockIncomingSimulateRawEventRequestInput.eventName
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.eventName is undefined', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = undefined as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.eventName is null', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = null as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.eventName is empty', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = '' as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.eventName is blank', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = '      ' as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.eventName is not a string', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = 123456 as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  //
  // Test IncomingSimulateRawEventRequestInput.createdAt edge cases
  //
  it('throws if the input IncomingSimulateRawEventRequestInput.createdAt is null', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = null as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.createdAt not a string', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = 123456 as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  //
  // Test IncomingSimulateRawEventRequestInput.updatedAt edge cases
  //
  it('throws if the input IncomingSimulateRawEventRequestInput.updatedAt is null', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = null as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  it('throws if the input IncomingSimulateRawEventRequestInput.updatedAt not a string', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = 123456 as never
    expect(() => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)).toThrow()
  })

  //
  // Test expected results
  //
  it('returns the expected IncomingSimulateRawEventRequest if the input is valid', async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockValidIncomingSimulateRawEventRequestInput()
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    const expected = mockIncomingSimulateRawEventRequestInput
    expect(result).toMatchObject(expected)
  })
})
