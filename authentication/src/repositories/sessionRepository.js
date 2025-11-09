const {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const getDynamoDocumentClient = require("../config/dynamoClient");
const env = require("../config/env");

//  Create a new session in DynamoDB
async function createSession(sessionData) {
  const docClient = getDynamoDocumentClient();
  const sessionId = uuidv4();
  const timestamp = new Date().toISOString();

  const item = {
    sessionId: sessionId, // Primary key
    doctorId: sessionData.doctorId,
    patientId: sessionData.patientId || null,
    patientName: sessionData.patientName,
    doctorLanguage: sessionData.doctorLanguage,
    patientLanguage: sessionData.patientLanguage,
    status: sessionData.status || "scheduled",
    chatHistory: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    startTime: null,
    endTime: null,
  };

  await docClient.send(
    new PutCommand({
      TableName: env.dynamo.sessionsTable,
      Item: item,
    })
  );

  return item;
}

//  Get sessions by doctor ID using Scan with filter
async function getSessionsByDoctorId(doctorId) {
  const docClient = getDynamoDocumentClient();

  const result = await docClient.send(
    new ScanCommand({
      TableName: env.dynamo.sessionsTable,
      FilterExpression: "doctorId = :doctorId",
      ExpressionAttributeValues: {
        ":doctorId": doctorId,
      },
    })
  );

  return result.Items || [];
}

//  Get sessions by patient ID using Scan with filter
async function getSessionsByPatientId(patientId) {
  const docClient = getDynamoDocumentClient();

  const result = await docClient.send(
    new ScanCommand({
      TableName: env.dynamo.sessionsTable,
      FilterExpression: "patientId = :patientId",
      ExpressionAttributeValues: {
        ":patientId": patientId,
      },
    })
  );

  return result.Items || [];
}

//  Get a single session by ID
async function getSessionById(sessionId) {
  const docClient = getDynamoDocumentClient();

  const result = await docClient.send(
    new GetCommand({
      TableName: env.dynamo.sessionsTable,
      Key: { sessionId: sessionId }, // Use 'sessionId' as primary key
    })
  );

  return result.Item || null;
}

//  Update session status
async function updateSessionStatus(sessionId, status) {
  const docClient = getDynamoDocumentClient();
  const timestamp = new Date().toISOString();
  const updateExpression = ["#status = :status", "#updatedAt = :updatedAt"];
  const expressionAttributeNames = {
    "#status": "status",
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues = {
    ":status": status,
    ":updatedAt": timestamp,
  };

  // If status is 'active', set startTime
  if (status === "active") {
    updateExpression.push("#startTime = :startTime");
    expressionAttributeNames["#startTime"] = "startTime";
    expressionAttributeValues[":startTime"] = timestamp;
  }

  // If status is 'completed', set endTime
  if (status === "completed") {
    updateExpression.push("#endTime = :endTime");
    expressionAttributeNames["#endTime"] = "endTime";
    expressionAttributeValues[":endTime"] = timestamp;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: env.dynamo.sessionsTable,
      Key: { sessionId: sessionId },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes;
}

//  Add a chat message to a session
async function addChatMessage(sessionId, message) {
  const docClient = getDynamoDocumentClient();
  const timestamp = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: env.dynamo.sessionsTable,
      Key: { sessionId: sessionId },
      UpdateExpression:
        "SET #chatHistory = list_append(if_not_exists(#chatHistory, :emptyList), :message), #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#chatHistory": "chatHistory",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":message": [message],
        ":emptyList": [],
        ":updatedAt": timestamp,
      },
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes;
}

//  Delete a session
async function deleteSession(sessionId) {
  const docClient = getDynamoDocumentClient();

  await docClient.send(
    new DeleteCommand({
      TableName: env.dynamo.sessionsTable,
      Key: { sessionId: sessionId },
    })
  );

  return { success: true };
}

module.exports = {
  createSession,
  getSessionsByDoctorId,
  getSessionsByPatientId,
  getSessionById,
  updateSessionStatus,
  addChatMessage,
  deleteSession,
};
