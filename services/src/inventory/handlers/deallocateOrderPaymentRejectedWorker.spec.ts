import { handler } from './deallocateOrderPaymentRejectedWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Inventory Service handlers deallocateOrderPaymentRejectedWorker tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler === 'function')
  })
})
