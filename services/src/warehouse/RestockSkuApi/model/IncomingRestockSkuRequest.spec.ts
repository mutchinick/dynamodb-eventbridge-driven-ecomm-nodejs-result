import { IncomingRestockSkuRequest, IncomingRestockSkuRequestInput } from './IncomingRestockSkuRequest'

function buildMockValidIncomingRestockSkuRequestInput(): IncomingRestockSkuRequestInput {
  const mockValidRequestInput: IncomingRestockSkuRequestInput = {
    sku: 'mockSku',
    units: 2,
    lotId: 'mockLotId',
  }
  return mockValidRequestInput
}

describe('Warehouse Service RestockSkuApi IncomingRestockSkuRequest tests', () => {
  //
  // Test IncomingRestockSkuRequestInput edge cases
  //
  it('does not throw if the input IncomingRestockSkuRequestInput is valid', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).not.toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput is undefined', async () => {
    const mockIncomingRestockSkuRequestInput = undefined as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput is null', async () => {
    const mockIncomingRestockSkuRequestInput = null as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput is invalid', async () => {
    const mockIncomingRestockSkuRequestInput = 'mockInvalidValue' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  //
  // Test IncomingRestockSkuRequestInput.sku edge cases
  //
  it('throws if the input IncomingRestockSkuRequestInput.sku is missing', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.sku
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.sku is undefined', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = undefined as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.sku is null', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = null as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.sku is empty', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.sku is blank', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '      ' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.sku length < 4', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '123' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  //
  // Test IncomingRestockSkuRequestInput.units edge cases
  //
  it('throws if the input IncomingRestockSkuRequestInput.units is missing', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.units
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.units is undefined', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = undefined as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.units is null', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = null as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.units is empty', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = '' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.units is not a number', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = '1' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.units < 1', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = 0
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.units is not an integer', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = 2.34
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  //
  // Test IncomingRestockSkuRequestInput.lotId edge cases
  //
  it('throws if the input IncomingRestockSkuRequestInput.lotId is missing', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.lotId
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.lotId is undefined', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = undefined as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.lotId is undefined', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = undefined as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.lotId is null', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = null as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.lotId is empty', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.lotId is blank', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '      ' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  it('throws if the input IncomingRestockSkuRequestInput.lotId length < 4', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '123' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow()
  })

  //
  // Test expected results
  //
  it('returns the expected IncomingRestockSkuRequest if the input is valid', async () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    const expected = mockIncomingRestockSkuRequestInput
    expect(result).toMatchObject(expected)
  })
})
