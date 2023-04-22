import type { AWS } from '@serverless/typescript'
import { functions } from 'functions'
import * as dotenv from 'dotenv'
dotenv.config()

const billsTableName = process.env.BILLS_TABLE_NAME
const ordersTableName = process.env.ORDERS_TABLE_NAME
const serviceName = 'order-api-' + (process.env.NODE_ENV ?? 'production')

const serverlessConfiguration: AWS = {
  service: serviceName,
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      BILLS_TABLE: billsTableName
    },
    region: 'ap-southeast-1',
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem'
            ],
            Resource: [
              {
                'Fn::GetAtt': ['BillsTable', 'Arn']
              },
              {
                'Fn::GetAtt': ['OrdersTable', 'Arn']
              }
            ]
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: functions,
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10
    }
  },
  resources: {
    Resources: {
      BillsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'billId',
              AttributeType: 'S'
            }
          ],
          KeySchema: [
            {
              AttributeName: 'billId',
              KeyType: 'HASH'
            }
          ],
          BillingMode: 'PAY_PER_REQUEST',
          TableName: billsTableName
        }
      },
      OrdersTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'orderId',
              AttributeType: 'S'
            }
          ],
          KeySchema: [
            {
              AttributeName: 'orderId',
              KeyType: 'HASH'
            }
          ],
          BillingMode: 'PAY_PER_REQUEST',
          TableName: ordersTableName
        }
      }
    }
  }
}

module.exports = serverlessConfiguration
