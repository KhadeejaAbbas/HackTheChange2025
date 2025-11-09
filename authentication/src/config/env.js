const dotenv = require('dotenv');
const path = require("path");

// Load .env from authentication folder (parent of src)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  port: process.env.PORT || 3000,
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  dynamo: {
    usersTable: process.env.DYNAMODB_USERS_TABLE || 'HackTheChangeUsers',
  },
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
    clientSecret: process.env.COGNITO_CLIENT_SECRET,
    doctorGroupName: process.env.COGNITO_DOCTOR_GROUP || 'Doctors',
    patientGroupName: process.env.COGNITO_PATIENT_GROUP || 'Patients',
  },
};

function assertCognitoConfig() {
  const missing = [];
  if (!config.awsRegion) missing.push('AWS_REGION');
  if (!config.cognito.userPoolId) missing.push('COGNITO_USER_POOL_ID');
  if (!config.cognito.clientId) missing.push('COGNITO_CLIENT_ID');

  if (missing.length) {
    throw new Error(`Missing Cognito env vars: ${missing.join(', ')}`);
  }
}

module.exports = {
  ...config,
  assertCognitoConfig,
  assertDynamoConfig: () => {
    if (!config.dynamo.usersTable) {
      throw new Error('DYNAMODB_USERS_TABLE must be defined');
    }
  },
};
