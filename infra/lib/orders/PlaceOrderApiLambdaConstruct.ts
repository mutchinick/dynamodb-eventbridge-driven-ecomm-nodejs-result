import { Duration } from 'aws-cdk-lib'
import { HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { join } from 'path'

export interface IPlaceOrderApiLambdaConstructProps {
  httpApi: HttpApi
  dynamoDbTable: Table
}

//
//
//
export class PlaceOrderApiLambdaConstruct extends Construct {
  //
  //
  //
  constructor(scope: Construct, id: string, props: IPlaceOrderApiLambdaConstructProps) {
    super(scope, id)
    const lambdaFunc = this.createPlaceOrderApiLambdaFunction(scope, id, props.dynamoDbTable)
    this.createPlaceOrderApiLambdaIntegration(id, lambdaFunc, props.httpApi)
  }

  //
  //
  //
  private createPlaceOrderApiLambdaFunction(scope: Construct, id: string, dynamoDbTable: Table) {
    const lambdaFuncName = `${id}-Lambda`
    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, './placeOrderApiLambdaEntry.ts'),
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
  private createPlaceOrderApiLambdaIntegration(id: string, lambdaFunc: NodejsFunction, httpApi: HttpApi) {
    const lambdaIntegrationName = `${id}-LambdaIntegration`
    const lambdaIntegration = new HttpLambdaIntegration(lambdaIntegrationName, lambdaFunc, {
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
    })

    httpApi.addRoutes({
      path: '/api/v1/orders/placeOrder',
      methods: [HttpMethod.POST],
      integration: lambdaIntegration,
    })
  }
}
