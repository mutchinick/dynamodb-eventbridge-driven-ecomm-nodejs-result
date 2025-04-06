import { trimStringTo64 } from './trimStringTo64'

describe(`trimStringTo64 tests`, () => {
  it(`returns an identical string if the str.length < 64`, () => {
    const testString = Array(63).fill('x').join('')
    const result = trimStringTo64(testString)
    expect(result).toBe(testString)
  })

  it(`returns the expected string if the input str.length < 64`, () => {
    const testString = '123456'
    const result = trimStringTo64(testString)
    expect(result).toBe(testString)
  })

  it(`returns an identical string if the str.length = 64`, () => {
    const testString = Array(64).fill('x').join('')
    const result = trimStringTo64(testString)
    expect(result).toBe(testString)
  })

  it(`returns the expected string if the input str.length = 64`, () => {
    const testString = '0123456789012345678901234567890123456789012345678901234567891234'
    const result = trimStringTo64(testString)
    expect(result).toBe(testString)
  })

  it(`returns a string of length = 64 the input str.length > 64`, () => {
    const testString = Array(65).fill('x').join('')
    const result = trimStringTo64(testString)
    expect(result.length).toBe(64)
  })

  it(`returns the expected string if the input str.length > 64`, () => {
    const testString = '0123456789012345678901234567890123456789012345678901234567891234_'
    const result = trimStringTo64(testString)
    const expectedResult = '0123456789012345678901234567890123456789012345678901234567891234'
    expect(result).toBe(expectedResult)
  })
})
