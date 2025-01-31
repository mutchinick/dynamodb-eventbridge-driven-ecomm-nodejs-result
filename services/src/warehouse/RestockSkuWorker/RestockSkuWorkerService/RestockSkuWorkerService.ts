import { IDbRestockSkuClient } from '../DbRestockSkuClient/DbRestockSkuClient'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { RestockSkuCommand } from '../model/RestockSkuCommand'

export interface IRestockSkuWorkerService {
  restockSku: (incomingSkuRestockedEvent: IncomingSkuRestockedEvent) => Promise<void>
}

export class RestockSkuWorkerService implements IRestockSkuWorkerService {
  //
  //
  //
  constructor(private readonly dbRestockSkuClient: IDbRestockSkuClient) {}

  //
  //
  //
  public async restockSku(incomingSkuRestockedEvent: IncomingSkuRestockedEvent): Promise<void> {
    try {
      console.info('RestockSkuWorkerService.restockSku init:', { incomingSkuRestockedEvent })
      const restockSkuCommand = RestockSkuCommand.validateAndBuild({ incomingSkuRestockedEvent })
      await this.dbRestockSkuClient.restockSku(restockSkuCommand)
      console.info('RestockSkuWorkerService.restockSku exit:')
    } catch (error) {
      console.error('RestockSkuWorkerService.restockSku error:', { error })
      throw error
    }
  }
}
