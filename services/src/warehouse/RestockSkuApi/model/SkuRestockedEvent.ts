import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

export type SkuRestockedEventData = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

export type SkuRestockedEventInput = SkuRestockedEventData

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
    try {
      this.validateInput(skuRestockedEventInput)
    } catch (error) {
      const logContext = 'SkuRestockedEvent.buildProps'
      console.error(`${logContext} error caught:`, { error })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { invalidArgsFailure, skuRestockedEventInput })
      return invalidArgsFailure
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
  private static validateInput(skuRestockedEventInput: SkuRestockedEventData): void {
    z.object({
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      lotId: ValueValidators.validLotId(),
    }).parse(skuRestockedEventInput)
  }
}
