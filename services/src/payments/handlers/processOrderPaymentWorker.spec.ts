import { handler } from './processOrderPaymentWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Payments Service handlers processOrderPaymentWorker tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
