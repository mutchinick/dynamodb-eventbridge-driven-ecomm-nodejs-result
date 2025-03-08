import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { DynamoDbConstruct } from './common/DynamoDbConstruct'
import { EventBusConstruct } from './common/EventBusConstruct'
import { PlaceOrderApiConstruct } from './orders/PlaceOrderApiConstruct'
import { SyncOrderWorkerConstruct } from './orders/SyncOrderWorkerConstruct'
import { SimulateRawEventApiConstruct } from './testing/SimulateRawEventApiConstruct'
import { AllocateOrderStockWorkerConstruct } from './warehouse/AllocateOrderStockWorkerConstruct'
import { RestockSkuApiConstruct } from './warehouse/RestockSkuApiConstruct'
import { RestockSkuWorkerConstruct } from './warehouse/RestockSkuWorkerConstruct'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'

export interface IMainStackProps extends StackProps {
  config: {
    prefix: string
  }
}

//
//
//
export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: IMainStackProps) {
    super(scope, id, props)

    // Common
    const { dynamoDbTable, eventBus } = this.createCommon(id)

    // Orders
    this.createOrdersService(id, dynamoDbTable, eventBus)

    // Testing
    this.createTestingService(id, dynamoDbTable)

    // Warehouse
    this.createWarehouseService(id, dynamoDbTable, eventBus)
  }

  //
  //
  //
  private createCommon(id: string): {
    dynamoDbTable: Table
    eventBus: EventBus
  } {
    const serviceId = `${id}-Common`
    const ddbConstructName = `${serviceId}-DynamoDb`
    const ddbConstruct = new DynamoDbConstruct(this, ddbConstructName)

    const eventBusConstructName = `${serviceId}-EventBus`
    const eventBusConstruct = new EventBusConstruct(this, eventBusConstructName, {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
    })

    return {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
      eventBus: eventBusConstruct.eventBus,
    }
  }

  //
  //
  //
  private createOrdersService(id: string, dynamoDbTable: Table, eventBus: EventBus): void {
    const serviceId = `${id}-Orders`
    const placeOrderApiConstructName = `${serviceId}-PlaceOrderApi`
    new PlaceOrderApiConstruct(this, placeOrderApiConstructName, {
      dynamoDbTable,
    })

    const syncOrderWorkerConstructName = `${serviceId}-SyncOrderWorker`
    new SyncOrderWorkerConstruct(this, syncOrderWorkerConstructName, {
      dynamoDbTable,
      eventBus,
    })
  }

  //
  //
  //
  private createTestingService(id: string, dynamoDbTable: Table): void {
    const serviceId = `${id}-Testing`
    const simulateRawEventApiConstructName = `${serviceId}-SimulateRawEventApi`
    new SimulateRawEventApiConstruct(this, simulateRawEventApiConstructName, {
      dynamoDbTable,
    })
  }

  //
  //
  //
  private createWarehouseService(id: string, dynamoDbTable: Table, eventBus: EventBus) {
    const serviceId = `${id}-Warehouse`
    const restockSkuApiConstructName = `${serviceId}-RestockSkuApi`
    new RestockSkuApiConstruct(this, restockSkuApiConstructName, {
      dynamoDbTable,
    })

    const restockSkuWorkerConstructName = `${serviceId}-RestockSkuWorker`
    new RestockSkuWorkerConstruct(this, restockSkuWorkerConstructName, {
      dynamoDbTable,
      eventBus,
    })

    const allocateOrderStockWorkerConstructName = `${serviceId}-AllocateOrderStockWorker`
    new AllocateOrderStockWorkerConstruct(this, allocateOrderStockWorkerConstructName, {
      dynamoDbTable,
      eventBus,
    })
  }
}
