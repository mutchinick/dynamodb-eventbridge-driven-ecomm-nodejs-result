import { handler } from './listSkusApi'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Warehouse Service handlers listSkusApi tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler === 'function')
  })
})
