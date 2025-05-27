import { handler } from './listOrdersApi'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Orders Service handlers listOrdersApi tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
