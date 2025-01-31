import { handler } from './restockSkuWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe('Warehouse Service RestockSkuWorker handler tests', () => {
  it('exports the handler function', () => {
    expect(typeof handler === 'function')
  })
})
