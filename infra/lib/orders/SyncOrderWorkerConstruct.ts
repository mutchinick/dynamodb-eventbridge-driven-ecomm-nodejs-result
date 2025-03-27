import { Duration } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus, Rule } from 'aws-cdk-lib/aws-events'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'
import { join } from 'path'
import { settings } from '../settings'

export interface ISyncOrderWorkerConstructProps {
  dynamoDbTable: Table
  eventBus: EventBus
}

//
//
//
export class SyncOrderWorkerConstruct extends Construct {
  //
  //
  //
  constructor(scope: Construct, id: string, props: ISyncOrderWorkerConstructProps) {
    super(scope, id)
    const dlq = this.createSyncOrderWorkerDlq(scope, id)
    const queue = this.createSyncOrderWorkerQueue(scope, id, dlq)
    this.createSyncOrderWorkerFunction(scope, id, props.dynamoDbTable, queue)
    this.createSyncOrderWorkerRoutingRule(scope, id, props.dynamoDbTable, props.eventBus, queue)
  }

  //
  //
  //
  private createSyncOrderWorkerDlq(scope: Construct, id: string) {
    const dlqName = `${id}-Dlq`
    const dlq = new Queue(scope, dlqName, {
      queueName: dlqName,
      retentionPeriod: Duration.days(14),
    })
    return dlq
  }

  //
  //
  //
  private createSyncOrderWorkerQueue(scope: Construct, id: string, dlq: Queue) {
    const queueName = `${id}-Queue`
    const { maxReceiveCount, receiveMessageWaitTime, visibilityTimeout } = settings.SQS
    const queue = new Queue(scope, queueName, {
      queueName,
      visibilityTimeout,
      receiveMessageWaitTime,
      deadLetterQueue: {
        maxReceiveCount,
        queue: dlq,
      },
    })
    return queue
  }

  //
  //
  //
  private createSyncOrderWorkerFunction(scope: Construct, id: string, dynamoDbTable: Table, queue: Queue) {
    const lambdaFuncName = `${id}-Lambda`
    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, './syncOrderWorkerEntry.ts'),
      environment: {
        EVENT_STORE_TABLE_NAME: dynamoDbTable.tableName,
        ORDERS_TABLE_NAME: dynamoDbTable.tableName,
      },
      timeout: Duration.seconds(10),
    })

    const { batchSize, maxBatchingWindow, maxConcurrency, reportBatchItemFailures } = settings.LambdaSQS
    lambdaFunc.addEventSource(
      new SqsEventSource(queue, {
        batchSize,
        reportBatchItemFailures,
        maxBatchingWindow,
        maxConcurrency,
      }),
    )

    dynamoDbTable.grantReadWriteData(lambdaFunc)
    queue.grantConsumeMessages(lambdaFunc)

    return lambdaFunc
  }

  //
  //
  //
  private createSyncOrderWorkerRoutingRule(
    scope: Construct,
    id: string,
    dynamoDbTable: Table,
    eventBus: EventBus,
    queue: Queue,
  ) {
    const ruleName = `${id}-EventBridgeRoutingRule`
    const routingRule = new Rule(scope, ruleName, {
      eventBus,
      eventPattern: {
        source: ['event-store.dynamodb.stream'],
        detailType: ['DynamoDBStreamRecord'],
        detail: {
          eventSourceARN: [dynamoDbTable.tableStreamArn],
          eventName: ['INSERT'],
          eventSource: ['aws:dynamodb'],
          dynamodb: {
            NewImage: {
              eventName: {
                S: [
                  'ORDER_PLACED_EVENT',
                  'ORDER_CREATED_EVENT',
                  'ORDER_STOCK_ALLOCATED_EVENT',
                  'ORDER_STOCK_DEPLETED_EVENT',
                  'ORDER_PAYMENT_ACCEPTED_EVENT',
                  'ORDER_PAYMENT_REJECTED_EVENT',
                  'ORDER_FULFILLED_EVENT',
                  'ORDER_PACKAGED_EVENT',
                  'ORDER_SHIPPED_EVENT',
                  'ORDER_DELIVERED_EVENT',
                  'ORDER_CANCELED_EVENT',
                ],
              },
            },
          },
        },
      },
    })
    routingRule.addTarget(new SqsQueue(queue))
  }
}
