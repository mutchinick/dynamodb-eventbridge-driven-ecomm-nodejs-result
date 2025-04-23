import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'
import { RestockSkuCommand, RestockSkuCommandInput } from './RestockSkuCommand'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockEventName = InventoryEventName.SKU_RESTOCKED_EVENT
const mockSku = 'mockSku'
const mockUnits = 12
const mockLotId = 'mockLotId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate

function buildMockIncomingSkuRestockedEvent(): TypeUtilsMutable<IncomingSkuRestockedEvent> {
  const mockValidInventoryEvent: TypeUtilsMutable<IncomingSkuRestockedEvent> = {
    eventName: mockEventName,
    eventData: {
      sku: mockSku,
      units: mockUnits,
      lotId: mockLotId,
    },
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }
  return mockValidInventoryEvent
}

function buildMockRestockSkuCommandInput(): TypeUtilsMutable<RestockSkuCommandInput> {
  const mockValidInput: TypeUtilsMutable<RestockSkuCommandInput> = {
    incomingSkuRestockedEvent: buildMockIncomingSkuRestockedEvent(),
  }
  return mockValidInput
}

describe(`Inventory Service RestockSkuWorker RestockSkuCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input RestockSkuCommandInput is valid`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput is undefined`, () => {
    const mockRestockSkuCommandInput = undefined as never
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput is null`, () => {
    const mockRestockSkuCommandInput = null as never
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventName edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = undefined
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = null
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is empty`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = '' as never
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is blank`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = '      ' as never
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is not an
      SKU_RESTOCKED_EVENT`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = InventoryEventName.ORDER_CANCELED_EVENT as never
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = undefined
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = null
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is empty`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = ''
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError of kind
      'InvalidArgumentsError' if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is blank`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = '      '
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt length < 4`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = '123'
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = undefined
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = null
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is empty`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = ''
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is blank`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = '      '
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt length < 4`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = '123'
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = undefined
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = null
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is empty`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = ''
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is blank`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = '      '
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku length < 4`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = '123'
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = undefined
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = null
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units < 1`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = 0
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is not an
      integer`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = 3.45
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is not a number`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = '1' as unknown as number
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = undefined
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = null
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is empty`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = ''
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is blank`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = '      '
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId length < 4`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = '123'
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<RestockSkuCommand> if the execution path is
      successful`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    const expectedCommand: RestockSkuCommand = {
      commandData: {
        sku: mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku,
        units: mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units,
        lotId: mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
