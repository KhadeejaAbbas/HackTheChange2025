const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const getDynamoDocumentClient = require('../config/dynamoClient');
const env = require('../config/env');

async function createPatient({
  id,
  name,
  email,
  patientId,
  age,
  condition,
  birthdate,
  gender,
}) {
  const docClient = getDynamoDocumentClient();
  const timestamp = new Date().toISOString();
  const item = {
    userId: id,
    entityType: 'patient',
    patientRecordId: id,
    patientId: patientId || id,
    name,
    email: email.toLowerCase(),
    age: age ? Number(age) : null,
    condition: condition || null,
    birthdate: birthdate || null,
    gender: gender || null,
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
  createPatient,
};
