import { handler } from './restockSkuApi'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Inventory Service handlers restockSkuApi tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
