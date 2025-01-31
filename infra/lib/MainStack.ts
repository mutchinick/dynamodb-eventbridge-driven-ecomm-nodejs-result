import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { DynamoDbConstruct } from './DynamoDbConstruct'
import { EventBusConstruct } from './EventBusConstruct'
import { PlaceOrderApiConstruct } from './orders/PlaceOrderApiConstruct'
import { SyncOrderWorkerConstruct } from './orders/SyncOrderWorkerConstruct'
import { SimulateRawEventApiConstruct } from './testing/SimulateRawEventApiConstruct'
import { AllocateOrderStockWorkerConstruct } from './warehouse/AllocateOrderStockWorkerConstruct'
import { RestockSkuApiConstruct } from './warehouse/RestockSkuApiConstruct'
import { RestockSkuWorkerConstruct } from './warehouse/RestockSkuWorkerConstruct'

export interface IMainStackProps extends StackProps {
  config: {
    prefix: string
  }
}

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: IMainStackProps) {
    super(scope, id, props)

    // Common
    const ddbConstructName = `${id}-DynamoDb`
    const ddbConstruct = new DynamoDbConstruct(this, ddbConstructName)

    const eventBusConstructName = `${id}-EventBus`
    const eventBusConstruct = new EventBusConstruct(this, eventBusConstructName, {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
    })

    // Orders
    const placeOrderApiConstructName = `${id}-PlaceOrderApi`
    new PlaceOrderApiConstruct(this, placeOrderApiConstructName, {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
    })

    const syncOrderWorkerConstructName = `${id}-SyncOrderWorker`
    new SyncOrderWorkerConstruct(this, syncOrderWorkerConstructName, {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
      eventBus: eventBusConstruct.eventBus,
    })

    // Testing
    const simulateRawEventApiConstructName = `${id}-SimulateRawEventApi`
    new SimulateRawEventApiConstruct(this, simulateRawEventApiConstructName, {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
    })

    // Warehouse
    const restockSkuApiConstructName = `${id}-RestockSkuApi`
    new RestockSkuApiConstruct(this, restockSkuApiConstructName, {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
    })

    const restockSkuWorkerConstructName = `${id}-RestockSkuWorker`
    new RestockSkuWorkerConstruct(this, restockSkuWorkerConstructName, {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
      eventBus: eventBusConstruct.eventBus,
    })

    const allocateOrderStockWorkerConstructName = `${id}-AllocateOrderStockWorker`
    new AllocateOrderStockWorkerConstruct(this, allocateOrderStockWorkerConstructName, {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
      eventBus: eventBusConstruct.eventBus,
    })
  }
}
