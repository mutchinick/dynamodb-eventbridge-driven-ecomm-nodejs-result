import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

export type SkuRestockedEventInput = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

type SkuRestockedEventData = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

type SkuRestockedEventProps = WarehouseEvent<WarehouseEventName.SKU_RESTOCKED_EVENT, SkuRestockedEventData>

export class SkuRestockedEvent implements SkuRestockedEventProps {
  //
  //
  //
  private constructor(
    public readonly eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    public readonly eventData: SkuRestockedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(
    skuRestockedEventInput: SkuRestockedEventInput,
  ): Success<SkuRestockedEvent> | Failure<'InvalidArgumentsError'> {
    const logContext = 'SkuRestockedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { skuRestockedEventInput })

    const propsResult = this.buildProps(skuRestockedEventInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logContext} exit failure:`, { propsResult, skuRestockedEventInput })
      return propsResult
    }

    const { eventName, eventData, createdAt, updatedAt } = propsResult.value
    const skuRestockedEvent = new SkuRestockedEvent(eventName, eventData, createdAt, updatedAt)
    const skuRestockedEventResult = Result.makeSuccess(skuRestockedEvent)
    console.info(`${logContext} exit success:`, { skuRestockedEventResult })
    return skuRestockedEventResult
  }

  //
  //
  //
  private static buildProps(
    skuRestockedEventInput: SkuRestockedEventInput,
  ): Success<SkuRestockedEventProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.validateInput(skuRestockedEventInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { sku, units, lotId } = skuRestockedEventInput
    const date = new Date().toISOString()
    const skuRestockedEventData: SkuRestockedEventData = { sku, units, lotId }
    const skuRestockedEventProps: SkuRestockedEventProps = {
      eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
      eventData: skuRestockedEventData,
      createdAt: date,
      updatedAt: date,
    }
    return Result.makeSuccess(skuRestockedEventProps)
  }

  //
  //
  //
  private static validateInput(
    skuRestockedEventInput: SkuRestockedEventData,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'SkuRestockedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const schema = z.object({
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      lotId: ValueValidators.validLotId(),
    })

    try {
      schema.parse(skuRestockedEventInput)
      return Result.makeSuccess()
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, skuRestockedEventInput })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, skuRestockedEventInput })
      return invalidArgsFailure
    }
  }
}
