import { APIGatewayProxyEvent } from 'aws-lambda'
import { formatJSONResponse } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'

const BILLS_TABLE = process.env.BILLS_TABLE
const dynamoDbClientConfig: DynamoDBClientConfig = {
  maxAttempts: 3
}
const client = new DynamoDBClient(dynamoDbClientConfig)
const dynamoDbClient = DynamoDBDocumentClient.from(client)

const handler = async (event: APIGatewayProxyEvent) => {
  const params = {
    TableName: BILLS_TABLE,
    Key: {
      billId: event.pathParameters.id
    }
  }

  try {
    const { Item } = await dynamoDbClient.send(new GetCommand(params))
    if (Item) {
      return formatJSONResponse(Item)
    } else {
      return formatJSONResponse({
        error: 'Could not find bill with provided "billId"'
      })
    }
  } catch (error) {
    console.log(error)
    return formatJSONResponse({ error: 'Could not retreive bill' })
  }
}

export const main = middyfy(handler)
