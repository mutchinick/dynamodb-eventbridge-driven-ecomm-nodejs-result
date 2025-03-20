import { CfnOutput, Duration } from 'aws-cdk-lib'
import { CorsHttpMethod, HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { join } from 'path'

export interface ISimulateRawEventApiConstructProps {
  dynamoDbTable: Table
}

//
//
//
export class SimulateRawEventApiConstruct extends Construct {
  //
  //
  //
  constructor(scope: Construct, id: string, props: ISimulateRawEventApiConstructProps) {
    super(scope, id)
    const httpApi = this.createSimulateRawEventApiHttpApi(scope, id)
    const lambdaFunc = this.createSimulateRawEventApiFunction(scope, id, props.dynamoDbTable)
    this.createSimulateRawEventApiLambdaIntegration(id, lambdaFunc, httpApi)
  }

  //
  //
  //
  private createSimulateRawEventApiHttpApi(scope: Construct, id: string) {
    const httpApiName = `${id}-HttpApi`
    const httpApi = new HttpApi(scope, httpApiName, {
      apiName: httpApiName,
      corsPreflight: {
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
        allowMethods: [CorsHttpMethod.POST, CorsHttpMethod.OPTIONS],
        allowOrigins: ['*'],
        exposeHeaders: ['*'],
      },
    })

    const httpApiUrlName = `${id}-HttpApiUrl`
    new CfnOutput(scope, httpApiUrlName, {
      description: 'Testing SimulateRawEventAPI URL',
      value: httpApi.url ?? `Error in API deployment: ${httpApiUrlName}`,
    })

    return httpApi
  }

  //
  //
  //
  private createSimulateRawEventApiFunction(scope: Construct, id: string, dynamoDbTable: Table) {
    const lambdaFuncName = `${id}-Lambda`
    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, './simulateRawEventApiEntry.ts'),
      environment: {
        EVENT_STORE_TABLE_NAME: dynamoDbTable.tableName,
      },
      timeout: Duration.seconds(10),
    })

    dynamoDbTable.grantReadWriteData(lambdaFunc)

    return lambdaFunc
  }

  //
  //
  //
  private createSimulateRawEventApiLambdaIntegration(id: string, lambdaFunc: NodejsFunction, httpApi: HttpApi) {
    const lambdaIntegrationName = `${id}-LambdaIntegration`
    const lambdaIntegration = new HttpLambdaIntegration(lambdaIntegrationName, lambdaFunc, {
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
    })

    httpApi.addRoutes({
      path: '/api/v1/testing/simulateRawEvent',
      methods: [HttpMethod.POST],
      integration: lambdaIntegration,
    })
  }
}
