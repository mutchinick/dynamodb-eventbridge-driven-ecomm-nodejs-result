import { HttpResponse } from './HttpResponse'

describe('Shared Common HttpResponse tests', () => {
  test('HttpResponse.OK returns the expected 200 OK APIGatewayProxyStructuredResultV2 response', () => {
    const mockResponseBody = { mockItem1: 1, mockItem2: 'mockItem2' }
    const expectedResponse = {
      statusCode: 200,
      body: JSON.stringify(mockResponseBody),
    }
    const actualResponse = HttpResponse.OK(mockResponseBody)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  test('HttpResponse.Created returns the expected 201 Created APIGatewayProxyStructuredResultV2 response', () => {
    const mockResponseBody = { mockItem1: 1, mockItem2: 'mockItem2' }
    const expectedResponse = {
      statusCode: 201,
      body: JSON.stringify(mockResponseBody),
    }
    const actualResponse = HttpResponse.Created(mockResponseBody)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  test('HttpResponse.Accepted returns the expected 202 Accepted APIGatewayProxyStructuredResultV2 response', () => {
    const mockResponseBody = { mockItem1: 1, mockItem2: 'mockItem2' }
    const expectedResponse = {
      statusCode: 202,
      body: JSON.stringify(mockResponseBody),
    }
    const actualResponse = HttpResponse.Accepted(mockResponseBody)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  test('HttpResponse.InternalServerError returns the expected 500 Internal Server Error APIGatewayProxyStructuredResultV2 response', () => {
    const mockResponseBody = { message: 'Internal Server Error' }
    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify(mockResponseBody),
    }
    const actualResponse = HttpResponse.InternalServerError()
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  test('HttpResponse.BadRequestError returns the expected 400 Bad Request APIGatewayProxyStructuredResultV2 response', () => {
    const mockResponseBody = { message: 'Bad Request' }
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify(mockResponseBody),
    }
    const actualResponse = HttpResponse.BadRequestError()
    expect(actualResponse).toStrictEqual(expectedResponse)
  })
})
