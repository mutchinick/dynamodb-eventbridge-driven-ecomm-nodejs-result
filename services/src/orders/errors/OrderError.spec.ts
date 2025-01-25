import { OrderError } from './OrderError'

describe('Orders Service OrderError tests', () => {
  describe('OrderError.getName', () => {
    it('returns the name property of an Error', () => {
      const expectedErrorName = 'expectedErrorName'
      const error = Error()
      error.name = expectedErrorName
      const actualErrorName = OrderError.getName(error)
      expect(actualErrorName).toBe(expectedErrorName)
    })
  })

  describe('OrderError.addName', () => {
    it('appends the input error name to the the name property of an Error', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      const expectedErrorName = `${error.name} ${inputErrorName}`
      OrderError.addName(error, inputErrorName)
      expect(error.name).toBe(expectedErrorName)
    })
  })

  describe('OrderError.hasName', () => {
    it('returns true if the name property of an Error is equal to the input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = inputErrorName
      expect(OrderError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns true if the name property of an Error starts with the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `${inputErrorName} otherErrorName`
      expect(OrderError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns true if the name property of an Error contains the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName ${inputErrorName} otherErrorName`
      expect(OrderError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns true if the name property of an Error ends with the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName ${inputErrorName}`
      expect(OrderError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns false if the name property of an Error is different than the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = 'someErrorName'
      expect(OrderError.hasName(error, inputErrorName)).toBe(false)
    })

    it('returns false if the name property of an Error does not contain the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName otherErrorName`
      expect(OrderError.hasName(error, inputErrorName)).toBe(false)
    })

    it('returns false if the name property of an Error contains the input error name as a substring of other error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName${inputErrorName}otherErrorName`
      expect(OrderError.hasName(error, inputErrorName)).toBe(false)
    })
  })

  describe('OrderError.doNotRetry', () => {
    it('returns true if the input Error has the name DoNotRetryError', () => {
      const error = Error()
      OrderError.addName(error, 'someErrorName')
      OrderError.addName(error, OrderError.DoNotRetryError)
      OrderError.addName(error, 'otherErrorName')
      expect(OrderError.doNotRetry(error)).toBe(true)
    })

    it('returns false if the input Error does non have the name DoNotRetryError', () => {
      const error = Error()
      OrderError.addName(error, 'someErrorName')
      OrderError.addName(error, 'otherErrorName')
      expect(OrderError.doNotRetry(error)).toBe(false)
    })
  })
})
