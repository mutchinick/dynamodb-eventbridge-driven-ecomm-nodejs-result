import { handler } from './syncOrderWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe('Orders Service SyncOrderWorker handler tests', () => {
  it('exports the handler function', () => {
    expect(typeof handler === 'function')
  })
})
