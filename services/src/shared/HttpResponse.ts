import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'

export class HttpResponse {
  public static OK(responseBody: object): APIGatewayProxyStructuredResultV2 {
    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
    }
  }

  public static Created(responseBody: object): APIGatewayProxyStructuredResultV2 {
    return {
      statusCode: 201,
      body: JSON.stringify(responseBody),
    }
  }

  public static Accepted(responseBody: object): APIGatewayProxyStructuredResultV2 {
    return {
      statusCode: 202,
      body: JSON.stringify(responseBody),
    }
  }

  public static InternalServerError(): APIGatewayProxyStructuredResultV2 {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
  }

  public static BadRequestError(): APIGatewayProxyStructuredResultV2 {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' }),
    }
  }
}
