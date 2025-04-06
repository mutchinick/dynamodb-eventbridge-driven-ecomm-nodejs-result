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
import { trimStringTo64 } from '../utils/trimStringTo64'

export interface IDeallocateOrderPaymentRejectedWorkerConstructProps {
  dynamoDbTable: Table
  eventBus: EventBus
}

//
//
//
export class DeallocateOrderPaymentRejectedWorkerConstruct extends Construct {
  //
  //
  //
  constructor(scope: Construct, id: string, props: IDeallocateOrderPaymentRejectedWorkerConstructProps) {
    super(scope, id)
    const dlq = this.createDeallocateOrderPaymentRejectedWorkerDlq(scope, id)
    const queue = this.createDeallocateOrderPaymentRejectedWorkerQueue(scope, id, dlq)
    this.createDeallocateOrderPaymentRejectedWorkerFunction(scope, id, props.dynamoDbTable, queue)
    this.createDeallocateOrderPaymentRejectedWorkerRoutingRule(scope, id, props.dynamoDbTable, props.eventBus, queue)
  }

  //
  //
  //
  private createDeallocateOrderPaymentRejectedWorkerDlq(scope: Construct, id: string) {
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
  private createDeallocateOrderPaymentRejectedWorkerQueue(scope: Construct, id: string, dlq: Queue) {
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
  private createDeallocateOrderPaymentRejectedWorkerFunction(
    scope: Construct,
    id: string,
    dynamoDbTable: Table,
    queue: Queue,
  ) {
    const lambdaFuncName = trimStringTo64(`${id}-Lambda`)
    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, './deallocateOrderPaymentRejectedWorkerEntry.ts'),
      environment: {
        EVENT_STORE_TABLE_NAME: dynamoDbTable.tableName,
        WAREHOUSE_TABLE_NAME: dynamoDbTable.tableName,
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
  private createDeallocateOrderPaymentRejectedWorkerRoutingRule(
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
                S: ['ORDER_PAYMENT_REJECTED_EVENT'],
              },
            },
          },
        },
      },
    })
    routingRule.addTarget(new SqsQueue(queue))
  }
}
