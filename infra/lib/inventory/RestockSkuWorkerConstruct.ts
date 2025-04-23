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

export interface IRestockSkuWorkerConstructProps {
  dynamoDbTable: Table
  eventBus: EventBus
}

//
//
//
export class RestockSkuWorkerConstruct extends Construct {
  //
  //
  //
  constructor(scope: Construct, id: string, props: IRestockSkuWorkerConstructProps) {
    super(scope, id)
    const dlq = this.createRestockSkuWorkerDlq(scope, id)
    const queue = this.createRestockSkuWorkerQueue(scope, id, dlq)
    this.createRestockSkuWorkerFunction(scope, id, props.dynamoDbTable, queue)
    this.createRestockSkuWorkerRoutingRule(scope, id, props.dynamoDbTable, props.eventBus, queue)
  }

  //
  //
  //
  private createRestockSkuWorkerDlq(scope: Construct, id: string) {
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
  private createRestockSkuWorkerQueue(scope: Construct, id: string, dlq: Queue) {
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
  private createRestockSkuWorkerFunction(scope: Construct, id: string, dynamoDbTable: Table, queue: Queue) {
    const lambdaFuncName = `${id}-Lambda`
    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, './restockSkuWorkerEntry.ts'),
      environment: {
        EVENT_STORE_TABLE_NAME: dynamoDbTable.tableName,
        INVENTORY_TABLE_NAME: dynamoDbTable.tableName,
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
  private createRestockSkuWorkerRoutingRule(
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
                S: ['SKU_RESTOCKED_EVENT'],
              },
            },
          },
        },
      },
    })
    routingRule.addTarget(new SqsQueue(queue))
  }
}
