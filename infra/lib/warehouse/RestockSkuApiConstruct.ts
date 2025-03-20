import { CfnOutput, Duration } from 'aws-cdk-lib'
import { CorsHttpMethod, HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { join } from 'path'

export interface IRestockSkuApiConstructProps {
  dynamoDbTable: Table
}

//
//
//
export class RestockSkuApiConstruct extends Construct {
  //
  //
  //
  constructor(scope: Construct, id: string, props: IRestockSkuApiConstructProps) {
    super(scope, id)
    const httpApi = this.createRestockSkuApiHttpApi(scope, id)
    const lambdaFunc = this.createRestockSkuApiFunction(scope, id, props.dynamoDbTable)
    this.createRestockSkuApiLambdaIntegration(id, lambdaFunc, httpApi)
  }

  //
  //
  //
  private createRestockSkuApiHttpApi(scope: Construct, id: string) {
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
      description: 'Warehouse RestockSkuAPI URL',
      value: httpApi.url ?? `Error in API deployment: ${httpApiUrlName}`,
    })

    return httpApi
  }

  //
  //
  //
  private createRestockSkuApiFunction(scope: Construct, id: string, dynamoDbTable: Table) {
    const lambdaFuncName = `${id}-Lambda`
    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, './restockSkuApiEntry.ts'),
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
  private createRestockSkuApiLambdaIntegration(id: string, lambdaFunc: NodejsFunction, httpApi: HttpApi) {
    const lambdaIntegrationName = `${id}-LambdaIntegration`
    const lambdaIntegration = new HttpLambdaIntegration(lambdaIntegrationName, lambdaFunc, {
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
    })

    httpApi.addRoutes({
      path: '/api/v1/warehouse/restockSku',
      methods: [HttpMethod.POST],
      integration: lambdaIntegration,
    })
  }
}
