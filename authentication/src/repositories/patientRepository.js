const {
  PutCommand,
  ScanCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const getDynamoDocumentClient = require("../config/dynamoClient");
const env = require("../config/env");

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
    entityType: "patient",
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

  await docClient.send(
    new PutCommand({
      TableName: env.dynamo.usersTable,
      Item: item,
    })
  );

  return item;
}

// Get all patients
async function getAllPatients() {
  const docClient = getDynamoDocumentClient();

  const result = await docClient.send(
    new ScanCommand({
      TableName: env.dynamo.usersTable,
      FilterExpression: "entityType = :entityType",
      ExpressionAttributeValues: {
        ":entityType": "patient",
      },
    })
  );

  return result.Items || [];
}

// Get a patient by their userId
async function getPatientById(patientId) {
  const docClient = getDynamoDocumentClient();

  const result = await docClient.send(
    new GetCommand({
      TableName: env.dynamo.usersTable,
      Key: { userId: patientId },
    })
  );

  return result.Item || null;
}

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
};
