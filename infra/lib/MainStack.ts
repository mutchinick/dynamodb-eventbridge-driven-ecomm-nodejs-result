import { Stack, StackProps } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'
import { DynamoDbConstruct } from './common/DynamoDbConstruct'
import { EventBusConstruct } from './common/EventBusConstruct'
import { ListOrdersApiLambdaConstruct } from './orders/ListOrdersApiLambdaConstruct'
import { OrdersApiConstruct } from './orders/OrdersApiConstruct'
import { PlaceOrderApiLambdaConstruct } from './orders/PlaceOrderApiLambdaConstruct'
import { SyncOrderWorkerConstruct } from './orders/SyncOrderWorkerConstruct'
import { SimulateRawEventApiLambdaConstruct } from './testing/SimulateRawEventApiLambdaConstruct'
import { TestingApiConstruct } from './testing/TestingApiConstruct'
import { AllocateOrderStockWorkerConstruct } from './inventory/AllocateOrderStockWorkerConstruct'
import { DeallocateOrderPaymentRejectedWorkerConstruct } from './inventory/DeallocateOrderPaymentRejectedWorkerConstruct'
import { ListSkusApiLambdaConstruct } from './inventory/ListSkusApiLambdaConstruct'
import { RestockSkuApiLambdaConstruct } from './inventory/RestockSkuApiLambdaConstruct'
import { RestockSkuWorkerConstruct } from './inventory/RestockSkuWorkerConstruct'

export interface IMainStackProps extends StackProps {
  config: {
    deploymentPrefix: string
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

    // Inventory
    this.createInventoryService(id, dynamoDbTable, eventBus)
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

    const ordersApiConstructName = `${serviceId}-Api`
    const { httpApi } = new OrdersApiConstruct(this, ordersApiConstructName)

    const placeOrderApiLambdaName = `${serviceId}-PlaceOrderApi`
    new PlaceOrderApiLambdaConstruct(this, placeOrderApiLambdaName, {
      httpApi,
      dynamoDbTable,
    })

    const syncOrderWorkerConstructName = `${serviceId}-SyncOrderWorker`
    new SyncOrderWorkerConstruct(this, syncOrderWorkerConstructName, {
      dynamoDbTable,
      eventBus,
    })

    const listOrdersApiLambdaName = `${serviceId}-ListOrdersApi`
    new ListOrdersApiLambdaConstruct(this, listOrdersApiLambdaName, {
      httpApi,
      dynamoDbTable,
    })
  }

  //
  //
  //
  private createTestingService(id: string, dynamoDbTable: Table): void {
    const serviceId = `${id}-Testing`

    const testingApiConstructName = `${serviceId}-Api`
    const { httpApi } = new TestingApiConstruct(this, testingApiConstructName)

    const simulateRawEventApiLambdaName = `${serviceId}-SimulateRawEventApi`
    new SimulateRawEventApiLambdaConstruct(this, simulateRawEventApiLambdaName, {
      httpApi,
      dynamoDbTable,
    })
  }

  //
  //
  //
  private createInventoryService(id: string, dynamoDbTable: Table, eventBus: EventBus) {
    const serviceId = `${id}-Inventory`

    const inventoryApiConstructName = `${serviceId}-Api`
    const { httpApi } = new TestingApiConstruct(this, inventoryApiConstructName)

    const restockSkuApiConstructName = `${serviceId}-RestockSkuApi`
    new RestockSkuApiLambdaConstruct(this, restockSkuApiConstructName, {
      httpApi,
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

    const deallocateOrderPaymentRejectedWorkerConstructName = `${serviceId}-DeallocateOrderPaymentRejectedWorker`
    new DeallocateOrderPaymentRejectedWorkerConstruct(this, deallocateOrderPaymentRejectedWorkerConstructName, {
      dynamoDbTable,
      eventBus,
    })

    const listSkusApiConstructName = `${serviceId}-ListSkusApi`
    new ListSkusApiLambdaConstruct(this, listSkusApiConstructName, {
      httpApi,
      dynamoDbTable,
    })
  }
}
