import { IncomingPlaceOrderRequest, IncomingPlaceOrderRequestInput } from './IncomingPlaceOrderRequest'

function buildMockValidIncomingPlaceOrderRequestInput(): IncomingPlaceOrderRequestInput {
  const mockValidRequestInput: IncomingPlaceOrderRequestInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    quantity: 2,
    price: 3.98,
    userId: 'mockUserId',
  }
  return mockValidRequestInput
}

describe('Orders Service PlaceOrderApi IncomingPlaceOrderRequest tests', () => {
  //
  // Test IncomingPlaceOrderRequestInput edge cases
  //
  it('does not throw if the input IncomingPlaceOrderRequestInput is valid', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).not.toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput is undefined', async () => {
    const mockIncomingPlaceOrderRequestInput = undefined as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput is null', async () => {
    const mockIncomingPlaceOrderRequestInput = null as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput is invalid', async () => {
    const mockIncomingPlaceOrderRequestInput = 'mockInvalidValue' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  //
  // Test IncomingPlaceOrderRequestInput.orderId edge cases
  //
  it('throws if the input IncomingPlaceOrderRequestInput.orderId is missing', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.orderId
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.orderId is undefined', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = undefined as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.orderId is null', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = null as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.orderId is empty', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.orderId is blank', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '      ' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.orderId length < 4', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '123' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  //
  // Test IncomingPlaceOrderRequestInput.sku edge cases
  //
  it('throws if the input IncomingPlaceOrderRequestInput.sku is missing', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.sku
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.sku is undefined', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = undefined as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.sku is null', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = null as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.sku is empty', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.sku is blank', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '      ' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.sku length < 4', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '123' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  //
  // Test IncomingPlaceOrderRequestInput.quantity edge cases
  //
  it('throws if the input IncomingPlaceOrderRequestInput.quantity is missing', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.quantity
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.quantity is undefined', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.quantity = undefined as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.quantity is null', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.quantity = null as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.quantity is empty', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.quantity = '' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.quantity is not a number', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.quantity = '1' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.quantity < 1', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.quantity = 0
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.quantity is not an integer', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.quantity = 3.45
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  //
  // Test IncomingPlaceOrderRequestInput.price edge cases
  //
  it('throws if the input IncomingPlaceOrderRequestInput.price is missing', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.price
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.price is undefined', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = undefined as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.price is null', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = null as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.price is empty', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = '' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.price is not a number', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = '0' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.price < 0', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = -1
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  //
  // Test IncomingPlaceOrderRequestInput.userId edge cases
  //
  it('throws if the input IncomingPlaceOrderRequestInput.userId is missing', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.userId
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.userId is undefined', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = undefined as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.userId is undefined', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = undefined as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.userId is null', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = null as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.userId is empty', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.userId is blank', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '      ' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  it('throws if the input IncomingPlaceOrderRequestInput.userId length < 4', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '123' as never
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).toThrow()
  })

  //
  // Test expected results
  //
  it('returns the expected IncomingPlaceOrderRequest if the input is valid', async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockValidIncomingPlaceOrderRequestInput()
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    const expected = mockIncomingPlaceOrderRequestInput
    expect(result).toMatchObject(expected)
  })
})
