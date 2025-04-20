import { Result } from '../../errors/Result'
import {
  IncomingSimulateRawEventRequest,
  IncomingSimulateRawEventRequestInput,
} from './IncomingSimulateRawEventRequest'

const mockPk = 'mockPk'
const mockSk = 'mockSk'
const mockEventName = 'mockEventName'
const mockEventData = {}
const mockCreatedAt = 'mockCreatedAt'
const mockUpdatedAt = 'mockUpdatedAt'

function buildMockIncomingSimulateRawEventRequestInput(): IncomingSimulateRawEventRequestInput {
  const mockValidRequestInput: IncomingSimulateRawEventRequestInput = {
    pk: mockPk,
    sk: mockSk,
    eventName: mockEventName,
    eventData: mockEventData,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }
  return mockValidRequestInput
}

describe(`Testing Service SimulateRawEventApi IncomingSimulateRawEventRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingSimulateRawEventRequestInput is valid`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput is undefined`, async () => {
    const mockIncomingSimulateRawEventRequestInput = undefined as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput is null`, async () => {
    const mockIncomingSimulateRawEventRequestInput = null as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput.pk edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.pk is undefined`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = undefined as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.pk is null`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = null as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.pk is empty`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = '' as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.pk is blank`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = '      ' as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.pk is not a string`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = 123456 as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput.sk edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.sk is undefined`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = undefined as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.sk is null`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = null as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.sk is empty`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = '' as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.sk is blank`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = '      ' as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.sk is not a string`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = 123456 as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput.eventName edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.eventName is undefined`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = undefined as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.eventName is null`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = null as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.eventName is empty`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = '' as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.eventName is blank`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = '      ' as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.eventName is not a string`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = 123456 as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput.createdAt edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingSimulateRawEventRequestInput.createdAt is undefined`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = undefined as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.createdAt is null`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = null as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`does not return a Failure if the input IncomingSimulateRawEventRequestInput.createdAt is empty`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = '' as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`does not return a Failure if the input IncomingSimulateRawEventRequestInput.createdAt is blank`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = '      ' as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.createdAt is not a string`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = 123456 as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput.updatedAt edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingSimulateRawEventRequestInput.updatedAt is undefined`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = undefined as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.updatedAt is null`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = null as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`does not return a Failure if the input IncomingSimulateRawEventRequestInput.updatedAt is empty`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = '' as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`does not return a Failure if the input IncomingSimulateRawEventRequestInput.updatedAt is blank`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = '      ' as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input IncomingSimulateRawEventRequestInput.updatedAt is not a string`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = 123456 as never
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
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
  it(`returns the expected Success<IncomingSimulateRawEventRequest> if the execution path is successful`, async () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    const expectedRequest: IncomingSimulateRawEventRequest = {
      pk: mockIncomingSimulateRawEventRequestInput.pk,
      sk: mockIncomingSimulateRawEventRequestInput.sk,
      eventName: mockIncomingSimulateRawEventRequestInput.eventName,
      eventData: mockIncomingSimulateRawEventRequestInput.eventData,
      createdAt: mockIncomingSimulateRawEventRequestInput.createdAt,
      updatedAt: mockIncomingSimulateRawEventRequestInput.updatedAt,
    }
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
