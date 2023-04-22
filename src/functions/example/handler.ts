import { middyfy } from '@libs/lambda'
import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse
} from '@libs/api-gateway'
import schema from './schema'

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  return formatJSONResponse({
    message: `Hello, welcome to the exciting Serverless world!`,
    event
  })
}

export const main = middyfy(handler)
