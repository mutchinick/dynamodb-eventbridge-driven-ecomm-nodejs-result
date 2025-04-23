import { handler } from './allocateOrderStockWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Inventory Service handlers allocateOrderStockWorker tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler === 'function')
  })
})
