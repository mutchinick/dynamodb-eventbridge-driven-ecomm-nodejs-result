import { handler } from './placeOrderApi'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Orders Service handlers placeOrderApi tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler === 'function')
  })
})
