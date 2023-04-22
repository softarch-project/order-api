import { middyfy } from '@libs/lambda'
import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse
} from '@libs/api-gateway'
import schema from './schema'
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 } from 'uuid'

const BILLS_TABLE = process.env.BILLS_TABLE
const dynamoDbClientConfig: DynamoDBClientConfig = {
  maxAttempts: 3
}
const client = new DynamoDBClient(dynamoDbClientConfig)
const dynamoDbClient = DynamoDBDocumentClient.from(client)

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  const params = {
    TableName: BILLS_TABLE,
    Item: {
      billId: v4().toString(),
      createdAt: new Date().toISOString()
    }
  }

  try {
    await dynamoDbClient.send(new PutCommand(params))
    return formatJSONResponse({ billId: params.Item.billId })
  } catch (error) {
    console.log(error)
    return formatJSONResponse({ error: 'Could not create bill' })
  }
}

export const main = middyfy(handler)
