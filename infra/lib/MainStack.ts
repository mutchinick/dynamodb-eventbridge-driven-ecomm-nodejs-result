import { Stack, StackProps } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'
import { DynamoDbConstruct } from './common/DynamoDbConstruct'
import { EventBusConstruct } from './common/EventBusConstruct'
import { AllocateOrderStockWorkerConstruct } from './inventory/AllocateOrderStockWorkerConstruct'
import { DeallocateOrderPaymentRejectedWorkerConstruct } from './inventory/DeallocateOrderPaymentRejectedWorkerConstruct'
import { InventoryApiConstruct } from './inventory/InventoryApiConstruct'
import { ListSkusApiLambdaConstruct } from './inventory/ListSkusApiLambdaConstruct'
import { RestockSkuApiLambdaConstruct } from './inventory/RestockSkuApiLambdaConstruct'
import { RestockSkuWorkerConstruct } from './inventory/RestockSkuWorkerConstruct'
import { ListOrdersApiLambdaConstruct } from './orders/ListOrdersApiLambdaConstruct'
import { OrdersApiConstruct } from './orders/OrdersApiConstruct'
import { PlaceOrderApiLambdaConstruct } from './orders/PlaceOrderApiLambdaConstruct'
import { SyncOrderWorkerConstruct } from './orders/SyncOrderWorkerConstruct'
import { PaymentsApiConstruct } from './payments/PaymentsApiConstruct'
import { ProcessOrderPaymentWorkerConstruct } from './payments/ProcessOrderPaymentWorkerConstruct'
import { SimulateRawEventApiLambdaConstruct } from './testing/SimulateRawEventApiLambdaConstruct'
import { TestingApiConstruct } from './testing/TestingApiConstruct'
import { ListOrderPaymentsApiLambdaConstruct } from './payments/ListOrderPaymentsApiLambdaConstruct'

export interface IMainStackProps extends StackProps {
  config: {
    deploymentPrefix: string
  }
}

/**
 *
 */
export class MainStack extends Stack {
  /**
   *
   */
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

    // Payments
    this.createPaymentsService(id, dynamoDbTable, eventBus)
  }

  /**
   *
   */
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

  /**
   *
   */
  private createOrdersService(id: string, dynamoDbTable: Table, eventBus: EventBus): void {
    const serviceId = `${id}-Orders`

    // API
    const ordersApiConstructName = `${serviceId}-Api`
    const { httpApi } = new OrdersApiConstruct(this, ordersApiConstructName)

    const placeOrderApiLambdaName = `${serviceId}-PlaceOrderApi`
    new PlaceOrderApiLambdaConstruct(this, placeOrderApiLambdaName, {
      httpApi,
      dynamoDbTable,
    })

    const listOrdersApiLambdaName = `${serviceId}-ListOrdersApi`
    new ListOrdersApiLambdaConstruct(this, listOrdersApiLambdaName, {
      httpApi,
      dynamoDbTable,
    })

    // Workers
    const syncOrderWorkerConstructName = `${serviceId}-SyncOrderWorker`
    new SyncOrderWorkerConstruct(this, syncOrderWorkerConstructName, {
      dynamoDbTable,
      eventBus,
    })
  }

  /**
   *
   */
  private createTestingService(id: string, dynamoDbTable: Table): void {
    const serviceId = `${id}-Testing`

    // API
    const testingApiConstructName = `${serviceId}-Api`
    const { httpApi } = new TestingApiConstruct(this, testingApiConstructName)

    const simulateRawEventApiLambdaName = `${serviceId}-SimulateRawEventApi`
    new SimulateRawEventApiLambdaConstruct(this, simulateRawEventApiLambdaName, {
      httpApi,
      dynamoDbTable,
    })
  }

  /**
   *
   */
  private createInventoryService(id: string, dynamoDbTable: Table, eventBus: EventBus): void {
    const serviceId = `${id}-Inventory`

    // API
    const inventoryApiConstructName = `${serviceId}-Api`
    const { httpApi } = new InventoryApiConstruct(this, inventoryApiConstructName)

    const restockSkuApiConstructName = `${serviceId}-RestockSkuApi`
    new RestockSkuApiLambdaConstruct(this, restockSkuApiConstructName, {
      httpApi,
      dynamoDbTable,
    })

    const listSkusApiConstructName = `${serviceId}-ListSkusApi`
    new ListSkusApiLambdaConstruct(this, listSkusApiConstructName, {
      httpApi,
      dynamoDbTable,
    })

    // Workers
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
  }

  /**
   *
   */
  private createPaymentsService(id: string, dynamoDbTable: Table, eventBus: EventBus): void {
    const serviceId = `${id}-Payments`

    // API
    const paymentsApiConstructName = `${serviceId}-Api`
    const { httpApi } = new PaymentsApiConstruct(this, paymentsApiConstructName)

    const listOrderPaymentsApiConstructName = `${serviceId}-ListOrderPaymentsApi`
    new ListOrderPaymentsApiLambdaConstruct(this, listOrderPaymentsApiConstructName, {
      httpApi,
      dynamoDbTable,
    })

    // Workers
    const processOrderPaymentWorkerConstructName = `${serviceId}-ProcessOrderPaymentWorker`
    new ProcessOrderPaymentWorkerConstruct(this, processOrderPaymentWorkerConstructName, {
      dynamoDbTable,
      eventBus,
    })
  }
}
