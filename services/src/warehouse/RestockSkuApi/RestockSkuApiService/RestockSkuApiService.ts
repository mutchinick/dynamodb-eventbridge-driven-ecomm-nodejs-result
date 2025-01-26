import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { WarehouseError } from '../../errors/WarehouseError'
import { IEsRaiseSkuRestockedEventClient } from '../EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'

export interface IRestockSkuApiService {
  restockSku: (incomingRestockSkuRequest: IncomingRestockSkuRequest) => Promise<ServiceOutput>
}

export type ServiceOutput = TypeUtilsPretty<IncomingRestockSkuRequest>

export class RestockSkuApiService implements IRestockSkuApiService {
  //
  //
  //
  constructor(private readonly ddbSkuRestockedEventClient: IEsRaiseSkuRestockedEventClient) {}

  //
  //
  //
  public async restockSku(incomingRestockSkuRequest: IncomingRestockSkuRequest): Promise<ServiceOutput> {
    try {
      console.info('RestockSkuApiService.restockSku init:', { incomingRestockSkuRequest })
      await this.raiseSkuRestockedEvent(incomingRestockSkuRequest)
      const serviceOutput = this.buildServiceOutput(incomingRestockSkuRequest)
      console.info('RestockSkuApiService.restockSku exit:', { serviceOutput })
      return serviceOutput
    } catch (error) {
      console.error('RestockSkuApiService.restockSku error:', { error })
      if (WarehouseError.hasName(error, WarehouseError.InvalidEventRaiseOperationError_Redundant)) {
        const response = this.buildServiceOutput(incomingRestockSkuRequest)
        return response
      }
      throw error
    }
  }

  //
  //
  //
  private async raiseSkuRestockedEvent(incomingRestockSkuRequest: IncomingRestockSkuRequest) {
    const skuRestockedEvent = SkuRestockedEvent.validateAndBuild(incomingRestockSkuRequest)
    await this.ddbSkuRestockedEventClient.raiseSkuRestockedEvent(skuRestockedEvent)
  }

  //
  //
  //
  private buildServiceOutput(incomingRestockSkuRequest: IncomingRestockSkuRequest): ServiceOutput {
    return incomingRestockSkuRequest
  }
}
