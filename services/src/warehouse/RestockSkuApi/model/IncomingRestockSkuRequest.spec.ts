import { Result } from '../../errors/Result'
import { IncomingRestockSkuRequest, IncomingRestockSkuRequestInput } from './IncomingRestockSkuRequest'

function buildMockValidIncomingRestockSkuRequestInput(): IncomingRestockSkuRequestInput {
  const mockValidRequestInput: IncomingRestockSkuRequestInput = {
    sku: 'mockSku',
    units: 2,
    lotId: 'mockLotId',
  }
  return mockValidRequestInput
}

describe(`Warehouse Service RestockSkuApi IncomingRestockSkuRequest tests`, () => {
  //
  // Test IncomingRestockSkuRequestInput edge cases
  //
  it(`returns a Success if the input IncomingRestockSkuRequestInput is valid`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isSuccess(result)).toBe(true)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput is undefined`, async () => {
    const mockIncomingRestockSkuRequestInput = undefined as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput is null`, async () => {
    const mockIncomingRestockSkuRequestInput = null as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput is invalid`, async () => {
    const mockIncomingRestockSkuRequestInput = 'mockInvalidValue' as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingRestockSkuRequestInput.sku edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.sku is missing`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.sku
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.sku is undefined`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = undefined as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.sku is null`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = null as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.sku is empty`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '' as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.sku is blank`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '      ' as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.sku length < 4`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '123' as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingRestockSkuRequestInput.units edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.units is missing`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.units
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.units is undefined`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = undefined as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.units is null`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = null as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.units is empty`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = '' as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.units is not a number`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = '1' as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.units < 1`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = 0
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.units is not an integer`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = 2.34
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test IncomingRestockSkuRequestInput.lotId edge cases
  //
  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.lotId is missing`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.lotId
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.lotId is undefined`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = undefined as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.lotId is undefined`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = undefined as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.lotId is null`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = null as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.lotId is empty`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '' as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.lotId is blank`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '      ' as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient failure of kind InvalidArgumentsError if the input
      IncomingRestockSkuRequestInput.lotId length < 4`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '123' as never
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  //
  // Test expected results
  //
  it(`returns the expected Success<IncomingRestockSkuRequest> with the expected data`, async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    const expectedRequest: IncomingRestockSkuRequest = {
      sku: mockIncomingRestockSkuRequestInput.sku,
      units: mockIncomingRestockSkuRequestInput.units,
      lotId: mockIncomingRestockSkuRequestInput.lotId,
    }
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(result).toMatchObject(expectedResult)
  })
})
