import { handler } from './simulateRawEventApi'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Testing Service handlers simulateRawEventApi tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
