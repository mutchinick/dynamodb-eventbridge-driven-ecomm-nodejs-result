import { TestingError } from './TestingError'

describe('Testing Service TestingError tests', () => {
  describe('TestingError.getName', () => {
    it('returns the name property of an Error', () => {
      const expectedErrorName = 'expectedErrorName'
      const error = Error()
      error.name = expectedErrorName
      const actualErrorName = TestingError.getName(error)
      expect(actualErrorName).toBe(expectedErrorName)
    })
  })

  describe('TestingError.addName', () => {
    it('appends the input error name to the the name property of an Error', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      const expectedErrorName = `${error.name} ${inputErrorName}`
      TestingError.addName(error, inputErrorName)
      expect(error.name).toBe(expectedErrorName)
    })
  })

  describe('TestingError.hasName', () => {
    it('returns true if the name property of an Error is equal to the input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = inputErrorName
      expect(TestingError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns true if the name property of an Error starts with the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `${inputErrorName} otherErrorName`
      expect(TestingError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns true if the name property of an Error contains the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName ${inputErrorName} otherErrorName`
      expect(TestingError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns true if the name property of an Error ends with the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName ${inputErrorName}`
      expect(TestingError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns false if the name property of an Error is different than the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = 'someErrorName'
      expect(TestingError.hasName(error, inputErrorName)).toBe(false)
    })

    it('returns false if the name property of an Error does not contain the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName otherErrorName`
      expect(TestingError.hasName(error, inputErrorName)).toBe(false)
    })

    it('returns false if the name property of an Error contains the input error name as a substring of other error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName${inputErrorName}otherErrorName`
      expect(TestingError.hasName(error, inputErrorName)).toBe(false)
    })
  })

  describe('TestingError.doNotRetry', () => {
    it('returns true if the input Error has the name DoNotRetryError', () => {
      const error = Error()
      TestingError.addName(error, 'someErrorName')
      TestingError.addName(error, TestingError.DoNotRetryError)
      TestingError.addName(error, 'otherErrorName')
      expect(TestingError.doNotRetry(error)).toBe(true)
    })

    it('returns false if the input Error does non have the name DoNotRetryError', () => {
      const error = Error()
      TestingError.addName(error, 'someErrorName')
      TestingError.addName(error, 'otherErrorName')
      expect(TestingError.doNotRetry(error)).toBe(false)
    })
  })
})
