import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { Failure, Result, Success } from '../../errors/Result'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { InventoryEvent } from '../../model/InventoryEvent'
import { InventoryEventName } from '../../model/InventoryEventName'

export type SkuRestockedEventInput = TypeUtilsPretty<Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>>

type SkuRestockedEventData = TypeUtilsPretty<Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>>

type SkuRestockedEventProps = InventoryEvent<InventoryEventName.SKU_RESTOCKED_EVENT, SkuRestockedEventData>

export class SkuRestockedEvent implements SkuRestockedEventProps {
  //
  //
  //
  private constructor(
    public readonly eventName: InventoryEventName.SKU_RESTOCKED_EVENT,
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
    const currentDate = new Date().toISOString()
    const skuRestockedEventProps: SkuRestockedEventProps = {
      eventName: InventoryEventName.SKU_RESTOCKED_EVENT,
      eventData: { sku, units, lotId },
      createdAt: currentDate,
      updatedAt: currentDate,
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
