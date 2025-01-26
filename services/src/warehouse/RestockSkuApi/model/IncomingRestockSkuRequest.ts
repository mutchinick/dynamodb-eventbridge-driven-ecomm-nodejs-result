import { z } from 'zod'
import { WarehouseError } from '../../errors/WarehouseError'
import { SkuLotData } from '../../model/SkuLotData'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingRestockSkuRequestInput = Pick<SkuLotData, 'sku' | 'units' | 'lotId'>

type IncomingRestockSkuRequestProps = Pick<SkuLotData, 'sku' | 'units' | 'lotId'>

export class IncomingRestockSkuRequest implements IncomingRestockSkuRequestProps {
  //
  //
  //
  private constructor(
    public readonly sku: string,
    public readonly units: number,
    public readonly lotId: string,
  ) {}

  //
  //
  //
  public static validateAndBuild(incomingRestockSkuRequestInput: IncomingRestockSkuRequestInput) {
    try {
      const { sku, units, lotId } = this.buildIncomingRestockSkuRequestProps(incomingRestockSkuRequestInput)
      return new IncomingRestockSkuRequest(sku, units, lotId)
    } catch (error) {
      console.error('IncomingRestockSkuRequest.validateAndBuild', { error, incomingRestockSkuRequestInput })
      throw error
    }
  }

  //
  //
  //
  private static buildIncomingRestockSkuRequestProps(
    incomingRestockSkuRequestInput: IncomingRestockSkuRequestInput,
  ): IncomingRestockSkuRequestProps {
    try {
      const incomingRestockSkuRequest = z
        .object({
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          lotId: ValueValidators.validLotId(),
        })
        .parse(incomingRestockSkuRequestInput) as IncomingRestockSkuRequestProps
      return incomingRestockSkuRequest
    } catch (error) {
      console.error('RestockSkuApiController.buildIncomingRestockSkuRequest error:', { error })
      WarehouseError.addName(error, WarehouseError.InvalidArgumentsError)
      WarehouseError.addName(error, WarehouseError.DoNotRetryError)
      throw error
    }
  }
}
