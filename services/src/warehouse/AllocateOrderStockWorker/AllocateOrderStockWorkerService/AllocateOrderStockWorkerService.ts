import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'

export interface IAllocateOrderStockWorkerService {
  allocateOrderStock: (incomingOrderCreatedEvent: IncomingOrderCreatedEvent) => Promise<void>
}

export class AllocateOrderStockWorkerService implements IAllocateOrderStockWorkerService {
  //
  //
  //
  constructor(private readonly dbAllocateOrderStockClient: IDbAllocateOrderStockClient) {}

  //
  //
  //
  public async allocateOrderStock(incomingOrderCreatedEvent: IncomingOrderCreatedEvent): Promise<void> {
    try {
      console.info('AllocateOrderStockWorkerService.allocateOrderStock init:', { incomingOrderCreatedEvent })
      const allocateOrderStockCommand = AllocateOrderStockCommand.validateAndBuild({ incomingOrderCreatedEvent })
      await this.dbAllocateOrderStockClient.allocateOrderStock(allocateOrderStockCommand)
      console.info('AllocateOrderStockWorkerService.allocateOrderStock exit:')
    } catch (error) {
      console.error('AllocateOrderStockWorkerService.allocateOrderStock error:', { error })
      throw error
    }
  }
}
