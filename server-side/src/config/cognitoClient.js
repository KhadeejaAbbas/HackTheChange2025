const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');
const env = require('./env');

let clientInstance;

function getCognitoClient() {
  if (!clientInstance) {
    if (!env.awsRegion) {
      throw new Error('AWS_REGION must be defined before creating a Cognito client');
    }

    const options = { region: env.awsRegion };

    if (env.awsAccessKeyId && env.awsSecretAccessKey) {
      options.credentials = {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey,
      };
    }

    clientInstance = new CognitoIdentityProviderClient(options);
  }

  return clientInstance;
}

module.exports = getCognitoClient;
