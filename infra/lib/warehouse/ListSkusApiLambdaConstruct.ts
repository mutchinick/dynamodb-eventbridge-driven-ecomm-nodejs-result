import { Duration } from 'aws-cdk-lib'
import { HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { join } from 'path'

export interface IListSkusApiLambdaConstructProps {
  httpApi: HttpApi
  dynamoDbTable: Table
}

//
//
//
export class ListSkusApiLambdaConstruct extends Construct {
  //
  //
  //
  constructor(scope: Construct, id: string, props: IListSkusApiLambdaConstructProps) {
    super(scope, id)
    const lambdaFunc = this.createListSkusApiLambdaFunction(scope, id, props.dynamoDbTable)
    this.createListSkusApiLambdaIntegration(id, lambdaFunc, props.httpApi)
  }

  //
  //
  //
  private createListSkusApiLambdaFunction(scope: Construct, id: string, dynamoDbTable: Table) {
    const lambdaFuncName = `${id}-Lambda`
    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, './listSkusApiLambdaEntry.ts'),
      environment: {
        WAREHOUSE_TABLE_NAME: dynamoDbTable.tableName,
      },
      timeout: Duration.seconds(10),
    })

    dynamoDbTable.grantReadWriteData(lambdaFunc)

    return lambdaFunc
  }

  //
  //
  //
  private createListSkusApiLambdaIntegration(id: string, lambdaFunc: NodejsFunction, httpApi: HttpApi) {
    const lambdaIntegrationName = `${id}-LambdaIntegration`
    const lambdaIntegration = new HttpLambdaIntegration(lambdaIntegrationName, lambdaFunc, {
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
    })

    httpApi.addRoutes({
      path: '/api/v1/warehouse/listSkus',
      methods: [HttpMethod.POST],
      integration: lambdaIntegration,
    })
  }
}
