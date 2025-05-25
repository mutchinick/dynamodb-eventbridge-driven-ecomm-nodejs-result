// The SdkPaymentGatewayClient is a simple mock implementation of a payment gateway client.
// So it does not follow the same error handling patterns as the rest of the project.
import { createHash } from 'crypto'
import {
  SdkPaymentGatewayClient,
  SdkPaymentGatewayClientRequest,
  SdkPaymentGatewayClientResponse,
} from './SdkPaymentGatewayClient'

function generatePaymentId(orderId: string): string {
  const safeOrderId = orderId || ''
  const orderIdHash = createHash('md5').update(safeOrderId).digest('hex')
  const paymentId = orderIdHash.slice(0, 6).toUpperCase()
  return paymentId
}

const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'

function buildMockSdkPaymentGatewayClientInput(): SdkPaymentGatewayClientRequest {
  const mockTestInput: SdkPaymentGatewayClientRequest = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return mockTestInput
}

describe(`Payments Service ProcessOrderPaymentWorker External SdkPaymentGatewayClient
          tests`, () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /*
   *
   *
   ************************************************************
   * Test SdkPaymentGatewayClientInput edge cases
   ************************************************************/
  it(`rejects the payment if the input SdkPaymentGatewayClientInput is undefined`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = undefined as SdkPaymentGatewayClientRequest
    const response = await sdkPaymentGatewayClient.send(mockTestInput)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_REJECTED',
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`rejects the payment if the input SdkPaymentGatewayClientInput is null`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = null as SdkPaymentGatewayClientRequest
    const response = await sdkPaymentGatewayClient.send(mockTestInput)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_REJECTED',
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`rejects the payment if the input SdkPaymentGatewayClientInput.orderId is
      undefined`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = buildMockSdkPaymentGatewayClientInput()
    mockTestInput.orderId = undefined as never
    const response = await sdkPaymentGatewayClient.send(mockTestInput)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_REJECTED',
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`rejects the payment if the input SdkPaymentGatewayClientInput.sku is undefined`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = buildMockSdkPaymentGatewayClientInput()
    mockTestInput.sku = undefined as never
    const response = await sdkPaymentGatewayClient.send(mockTestInput)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_REJECTED',
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`rejects the payment if the input SdkPaymentGatewayClientInput.units is undefined`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = buildMockSdkPaymentGatewayClientInput()
    mockTestInput.units = undefined as never
    const response = await sdkPaymentGatewayClient.send(mockTestInput)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_REJECTED',
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`rejects the payment if the input SdkPaymentGatewayClientInput.price is undefined`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = buildMockSdkPaymentGatewayClientInput()
    mockTestInput.price = undefined as never
    const response = await sdkPaymentGatewayClient.send(mockTestInput)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_REJECTED',
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`rejects the payment if the input SdkPaymentGatewayClientInput.userId is
      undefined`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = buildMockSdkPaymentGatewayClientInput()
    mockTestInput.userId = undefined as never
    const response = await sdkPaymentGatewayClient.send(mockTestInput)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_REJECTED',
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`rejects the payment if the input SdkPaymentGatewayClientInput.price === 0`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = buildMockSdkPaymentGatewayClientInput()
    mockTestInput.price = 0
    const response = await sdkPaymentGatewayClient.send(mockTestInput)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_REJECTED',
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`rejects the payment if the input SdkPaymentGatewayClientInput.price < 0`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = buildMockSdkPaymentGatewayClientInput()
    mockTestInput.price = -1
    const response = await sdkPaymentGatewayClient.send(mockTestInput)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_REJECTED',
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`rejects the payment if the input SdkPaymentGatewayClientInput.price >= 100,000`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = buildMockSdkPaymentGatewayClientInput()
    mockTestInput.price = 100000
    const response = await sdkPaymentGatewayClient.send(mockTestInput)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_REJECTED',
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`can throw an Error or accept the payment if the input
      SdkPaymentGatewayClientInput.price is between 1 and 100,000`, async () => {
    const sdkPaymentGatewayClient = new SdkPaymentGatewayClient()
    const mockTestInput = buildMockSdkPaymentGatewayClientInput()

    // Mock the random value to be less than 0.3
    jest.spyOn(global.Math, 'random').mockReturnValue(0.2)
    const expectedResponse: SdkPaymentGatewayClientResponse = {
      paymentId: generatePaymentId(mockTestInput?.orderId),
      status: 'SDK_PAYMENT_ACCEPTED',
    }
    await expect(sdkPaymentGatewayClient.send(mockTestInput)).resolves.toStrictEqual(expectedResponse)

    // Mock the random value to be greater than or equal to 0.3
    jest.spyOn(global.Math, 'random').mockReturnValue(0.3)
    await expect(sdkPaymentGatewayClient.send(mockTestInput)).rejects.toThrow(Error)
  })
})
