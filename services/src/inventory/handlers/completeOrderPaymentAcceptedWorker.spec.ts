import { handler } from './completeOrderPaymentAcceptedWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Inventory Service handlers completeOrderPaymentAcceptedWorker tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
