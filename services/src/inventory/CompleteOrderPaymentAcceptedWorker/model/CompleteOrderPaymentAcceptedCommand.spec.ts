import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Result } from '../../errors/Result'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import {
  CompleteOrderPaymentAcceptedCommand,
  CompleteOrderPaymentAcceptedCommandInput,
} from './CompleteOrderPaymentAcceptedCommand'
import { IncomingOrderPaymentAcceptedEvent } from './IncomingOrderPaymentAcceptedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 111
const mockPrice = 123.45
const mockUserId = 'mockUserId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate

function buildMockIncomingOrderPaymentAcceptedEvent(): TypeUtilsMutable<IncomingOrderPaymentAcceptedEvent> {
  const mockEvent: TypeUtilsMutable<IncomingOrderPaymentAcceptedEvent> = {
    eventName: mockEventName,
    eventData: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits, // Intentional mismatch with existingOrderAllocationData
      price: mockPrice,
      userId: mockUserId,
    },
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }
  return mockEvent
}

function buildMockExistingOrderAllocationData(): TypeUtilsMutable<OrderAllocationData> {
  const mockData: TypeUtilsMutable<OrderAllocationData> = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits + 1, // Intentional mismatch with incomingOrderPaymentAcceptedEvent
    price: mockPrice,
    userId: mockUserId,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
    allocationStatus: 'ALLOCATED',
  }
  return mockData
}

function buildMockCompleteOrderPaymentAcceptedCommandInput(): TypeUtilsMutable<CompleteOrderPaymentAcceptedCommandInput> {
  const mockValidInput: TypeUtilsMutable<CompleteOrderPaymentAcceptedCommandInput> = {
    existingOrderAllocationData: buildMockExistingOrderAllocationData(),
    incomingOrderPaymentAcceptedEvent: buildMockIncomingOrderPaymentAcceptedEvent(),
  }
  return mockValidInput
}

describe(`Inventory Service CompleteOrderPaymentAcceptedWorker
          CompleteOrderPaymentAcceptedCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input CompleteOrderPaymentAcceptedCommandInput
      is valid`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput: CompleteOrderPaymentAcceptedCommandInput = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput: CompleteOrderPaymentAcceptedCommandInput = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId is
      undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId is
      null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId is
      empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId = ''
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId is
      blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId = '      '
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId
      length < 4`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.orderId = '123'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku is
      undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku is
      empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku = ''
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku is
      blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku = '      '
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku length
      < 4`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.sku = '123'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units is
      undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units is
      null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units < 1`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units = 0
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units is
      not an integer`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units = 3.45
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units is
      not a number`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units = '1' as unknown as number
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.price edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.price is
      undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.price = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.price is
      null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.price = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.price < 0`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.price = -1
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.price is
      not a number`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.price = '1' as unknown as number
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId is
      undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId is
      null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId is
      empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId = ''
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId is
      blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId = '      '
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId
      length < 4`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.userId = '123'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt
      is empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt = ''
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt
      is blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt = '      '
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt
      length < 4`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.createdAt = '123'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt
      is empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt = ''
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt
      is blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt = '      '
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt
      length < 4`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.updatedAt = '123'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus
      is empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus = '' as never
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus
      is not an AllocationStatus`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus =
      'mockInvalidValue' as never
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus
      is 'DEALLOCATED_ORDER_CANCELED'`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus =
      'DEALLOCATED_ORDER_CANCELED'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus
      is 'COMPLETED_PAYMENT_ACCEPTED'`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.allocationStatus =
      'COMPLETED_PAYMENT_ACCEPTED'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName
      is empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName = '' as never
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName
      is blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName = '      ' as never
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName
      is not an ORDER_PAYMENT_ACCEPTED_EVENT`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventName =
      InventoryEventName.ORDER_CANCELED_EVENT as never
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt
      is empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt = ''
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt
      is blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt = '      '
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt
      length < 4`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.createdAt = '123'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt
      is empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt = ''
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt
      is blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt = '      '
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt
      length < 4`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.updatedAt = '123'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId
      is empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId = ''
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId
      is blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId = '      '
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId
      length < 4`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId = '123'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku
      is empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku = ''
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku
      is blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku = '      '
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku
      length < 4`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku = '123'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units
      < 1`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units = 0
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units
      is not an integer`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units = 3.45
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units
      is not a number`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.units =
      '1' as unknown as number
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.price edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.price
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.price = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.price
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.price = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.price
      < 0`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.price = -1
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.price
      is not a number`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.price =
      '1' as unknown as number
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId
      is undefined`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId = undefined
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId
      is null`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId = null
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId
      is empty`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId = ''
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId
      is blank`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId = '      '
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId
      length < 4`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.userId = '123'
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
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
  it(`returns the expected Success<CompleteOrderPaymentAcceptedCommand> if the
      execution path is successful`, () => {
    const mockCompleteOrderPaymentAcceptedCommandInput = buildMockCompleteOrderPaymentAcceptedCommandInput()
    const result = CompleteOrderPaymentAcceptedCommand.validateAndBuild(mockCompleteOrderPaymentAcceptedCommandInput)
    const expectedCommand: CompleteOrderPaymentAcceptedCommand = {
      commandData: {
        orderId: mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.orderId,
        sku: mockCompleteOrderPaymentAcceptedCommandInput.incomingOrderPaymentAcceptedEvent.eventData.sku,
        units: mockCompleteOrderPaymentAcceptedCommandInput.existingOrderAllocationData.units,
        updatedAt: mockDate,
        allocationStatus: 'COMPLETED_PAYMENT_ACCEPTED',
        expectedAllocationStatus: 'ALLOCATED',
      },
      options: {},
    }
    const expectedResult = Result.makeSuccess(expectedCommand)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
