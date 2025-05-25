import { CfnOutput } from 'aws-cdk-lib'
import { CorsHttpMethod, HttpApi } from 'aws-cdk-lib/aws-apigatewayv2'
import { Construct } from 'constructs'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPaymentsApiConstructProps {}

/**
 *
 */
export class PaymentsApiConstruct extends Construct {
  public readonly httpApi

  /**
   *
   */
  constructor(scope: Construct, id: string) {
    super(scope, id)
    this.httpApi = this.createPaymentsApiHttpApi(scope, id)
  }

  /**
   *
   */
  private createPaymentsApiHttpApi(scope: Construct, id: string): HttpApi {
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
      description: 'Payments API URL',
      value: httpApi.url ?? `Error in API deployment: ${httpApiUrlName}`,
    })

    return httpApi
  }
}
