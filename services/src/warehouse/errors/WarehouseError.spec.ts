import { WarehouseError } from './WarehouseError'

describe('Warehouse Service WarehouseError tests', () => {
  describe('WarehouseError.getName', () => {
    it('returns the name property of an Error', () => {
      const expectedErrorName = 'expectedErrorName'
      const error = Error()
      error.name = expectedErrorName
      const actualErrorName = WarehouseError.getName(error)
      expect(actualErrorName).toBe(expectedErrorName)
    })
  })

  describe('WarehouseError.addName', () => {
    it('appends the input error name to the the name property of an Error', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      const expectedErrorName = `${error.name} ${inputErrorName}`
      WarehouseError.addName(error, inputErrorName)
      expect(error.name).toBe(expectedErrorName)
    })
  })

  describe('WarehouseError.hasName', () => {
    it('returns true if the name property of an Error is equal to the input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = inputErrorName
      expect(WarehouseError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns true if the name property of an Error starts with the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `${inputErrorName} otherErrorName`
      expect(WarehouseError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns true if the name property of an Error contains the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName ${inputErrorName} otherErrorName`
      expect(WarehouseError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns true if the name property of an Error ends with the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName ${inputErrorName}`
      expect(WarehouseError.hasName(error, inputErrorName)).toBe(true)
    })

    it('returns false if the name property of an Error is different than the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = 'someErrorName'
      expect(WarehouseError.hasName(error, inputErrorName)).toBe(false)
    })

    it('returns false if the name property of an Error does not contain the full input error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName otherErrorName`
      expect(WarehouseError.hasName(error, inputErrorName)).toBe(false)
    })

    it('returns false if the name property of an Error contains the input error name as a substring of other error name', () => {
      const inputErrorName = 'inputErrorName' as never
      const error = Error()
      error.name = `someErrorName${inputErrorName}otherErrorName`
      expect(WarehouseError.hasName(error, inputErrorName)).toBe(false)
    })
  })

  describe('WarehouseError.doNotRetry', () => {
    it('returns true if the input Error has the name DoNotRetryError', () => {
      const error = Error()
      WarehouseError.addName(error, 'someErrorName')
      WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      WarehouseError.addName(error, 'otherErrorName')
      expect(WarehouseError.doNotRetry(error)).toBe(true)
    })

    it('returns false if the input Error does non have the name DoNotRetryError', () => {
      const error = Error()
      WarehouseError.addName(error, 'someErrorName')
      WarehouseError.addName(error, 'otherErrorName')
      expect(WarehouseError.doNotRetry(error)).toBe(false)
    })
  })
})
