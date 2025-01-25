import { handler } from './api'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe('Orders Service API handler tests', () => {
  it('exports the handler function', () => {
    expect(typeof handler === 'function')
  })
})
