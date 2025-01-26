import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { IDbCreateOrderClient } from '../DbCreateOrderClient/DbCreateOrderClient'
import { IDbGetOrderClient } from '../DbGetOrderClient/DbGetOrderClient'
import { IDbUpdateOrderClient } from '../DbUpdateOrderClient/DbUpdateOrderClient'
import { IEsRaiseOrderCreatedEventClient } from '../EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { CreateOrderCommand } from '../model/CreateOrderCommand'
import { GetOrderCommand } from '../model/GetOrderCommand'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { OrderCreatedEvent } from '../model/OrderCreatedEvent'
import { UpdateOrderCommand } from '../model/UpdateOrderCommand'

export interface ISyncOrderWorkerService {
  syncOrder: (incomingOrderEvent: IncomingOrderEvent) => Promise<void>
}

export class SyncOrderWorkerService implements ISyncOrderWorkerService {
  //
  //
  //
  constructor(
    private readonly dbGetOrderClient: IDbGetOrderClient,
    private readonly dbCreateOrderClient: IDbCreateOrderClient,
    private readonly dbUpdateOrderClient: IDbUpdateOrderClient,
    private readonly esRaiseOrderCreatedEventClient: IEsRaiseOrderCreatedEventClient,
  ) {}

  //
  //
  //
  public async syncOrder(incomingOrderEvent: IncomingOrderEvent): Promise<void> {
    try {
      console.info('SyncOrderWorkerService.syncOrder init:', { incomingOrderEvent })
      const isOrderPlacedEvent = IncomingOrderEvent.isOrderPlacedEvent(incomingOrderEvent)
      if (isOrderPlacedEvent) {
        const orderData = await this.createOrder(incomingOrderEvent)
        await this.raiseOrderCreatedEvent(incomingOrderEvent.eventName, orderData)
      } else {
        await this.updateOrder(incomingOrderEvent)
      }
      console.info('SyncOrderWorkerService.syncOrder exit:')
    } catch (error) {
      console.error('SyncOrderWorkerService.syncOrder error:', { error })
      throw error
    }
  }

  //
  //
  //
  private async createOrder(incomingOrderEvent: IncomingOrderEvent): Promise<OrderData> {
    const orderId = incomingOrderEvent.eventData.orderId
    const getOrderCommand = GetOrderCommand.validateAndBuild({ orderId })
    let orderData = await this.dbGetOrderClient.getOrder(getOrderCommand)
    if (!orderData) {
      const createOrderCommand = CreateOrderCommand.validateAndBuild({ incomingOrderEvent })
      orderData = await this.dbCreateOrderClient.createOrder(createOrderCommand)
    }
    return orderData
  }

  //
  //
  //
  private async updateOrder(incomingOrderEvent: IncomingOrderEvent): Promise<void> {
    const orderId = incomingOrderEvent.eventData.orderId
    const getOrderCommand = GetOrderCommand.validateAndBuild({ orderId })
    const existingOrderData = await this.dbGetOrderClient.getOrder(getOrderCommand)
    if (existingOrderData) {
      const updateOrderCommand = UpdateOrderCommand.validateAndBuild({ existingOrderData, incomingOrderEvent })
      await this.dbUpdateOrderClient.updateOrder(updateOrderCommand)
    }
  }

  //
  //
  //
  private async raiseOrderCreatedEvent(incomingEventName: OrderEventName, orderData: OrderData): Promise<void> {
    const orderCreatedEvent = OrderCreatedEvent.validateAndBuild({ incomingEventName, orderData })
    await this.esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(orderCreatedEvent)
  }
}
