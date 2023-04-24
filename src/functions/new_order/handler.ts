import { middyfy } from '@libs/lambda'
import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse
} from '@libs/api-gateway'
import schema from './schema'
import { DynamoDBClientConfig, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 } from 'uuid'

const ORDERS_TABLE = process.env.ORDERS_TABLE
const dynamoDbClientConfig: DynamoDBClientConfig = {
  maxAttempts: 3
}
const client = new DynamoDBClient(dynamoDbClientConfig)
const dynamoDbClient = DynamoDBDocumentClient.from(client)

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const params = {
    TableName: ORDERS_TABLE,
    Item: {
      orderId: v4().toString(),
      billId: event.body.billId,
      createdAt: new Date().toISOString(),
      menuName: event.body.menuName,
      options: event.body.options,
      price: event.body.price,
      photoUrl: event.body.photoUrl
    }
  }

  try {
    await dynamoDbClient.send(new PutCommand(params))
    return formatJSONResponse({ orderId: params.Item.orderId })
  } catch (error) {
    console.log(error)
    return formatJSONResponse({ error: 'Could not create order' })
  }
}

export const main = middyfy(handler)
