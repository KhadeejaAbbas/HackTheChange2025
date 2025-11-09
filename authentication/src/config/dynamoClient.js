const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const env = require('./env');

let documentClient;

function getDynamoDocumentClient() {
  if (!documentClient) {
    if (!env.awsRegion) {
      throw new Error('AWS_REGION must be set to initialize DynamoDB');
    }

    const clientConfig = { region: env.awsRegion };

    if (env.awsAccessKeyId && env.awsSecretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey,
      };
    }

    const baseClient = new DynamoDBClient(clientConfig);
    documentClient = DynamoDBDocumentClient.from(baseClient, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  return documentClient;
}

module.exports = getDynamoDocumentClient;
