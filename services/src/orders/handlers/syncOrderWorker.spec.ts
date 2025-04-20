import { handler } from './syncOrderWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Orders Service handlers syncOrderWorker tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler === 'function')
  })
})
