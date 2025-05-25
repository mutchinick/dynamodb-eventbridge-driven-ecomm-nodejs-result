import { handler } from './listOrderPaymentsApi'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`OrderPayments Service handlers listOrderPaymentsApi tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
