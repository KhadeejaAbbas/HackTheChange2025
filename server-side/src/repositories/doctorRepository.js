const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const getDynamoDocumentClient = require('../config/dynamoClient');
const env = require('../config/env');

async function createDoctor({
  id,
  name,
  email,
  specialty,
  birthdate,
  gender,
}) {
  const docClient = getDynamoDocumentClient();
  const timestamp = new Date().toISOString();
  const item = {
    userId: id,
    entityType: 'doctor',
    name,
    email: email.toLowerCase(),
    specialty: specialty || null,
    birthdate: birthdate || null,
    gender: gender || null,
    patients: [],
    sessions: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await docClient.send(new PutCommand({
    TableName: env.dynamo.usersTable,
    Item: item,
  }));

  return item;
}

module.exports = {
  createDoctor,
};
