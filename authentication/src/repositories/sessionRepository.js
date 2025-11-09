const {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const getDynamoDocumentClient = require("../config/dynamoClient");
const env = require("../config/env");

/**
 * Create a new session in DynamoDB
 */
async function createSession(sessionData) {
  const docClient = getDynamoDocumentClient();
  const sessionId = uuidv4();
  const timestamp = new Date().toISOString();

  const item = {
    sessionId,
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

/**
 * Get sessions by doctor ID using GSI
 */
async function getSessionsByDoctorId(doctorId) {
  const docClient = getDynamoDocumentClient();

  const result = await docClient.send(
    new QueryCommand({
      TableName: env.dynamo.sessionsTable,
      IndexName: "DoctorIdIndex",
      KeyConditionExpression: "doctorId = :doctorId",
      ExpressionAttributeValues: {
        ":doctorId": doctorId,
      },
      ScanIndexForward: false, // Sort by createdAt descending (newest first)
    })
  );

  return result.Items || [];
}

/**
 * Get sessions by patient ID using GSI
 */
async function getSessionsByPatientId(patientId) {
  const docClient = getDynamoDocumentClient();

  const result = await docClient.send(
    new QueryCommand({
      TableName: env.dynamo.sessionsTable,
      IndexName: "PatientIdIndex",
      KeyConditionExpression: "patientId = :patientId",
      ExpressionAttributeValues: {
        ":patientId": patientId,
      },
      ScanIndexForward: false, // Sort by createdAt descending (newest first)
    })
  );

  return result.Items || [];
}

/**
 * Get a single session by ID
 */
async function getSessionById(sessionId) {
  const docClient = getDynamoDocumentClient();

  const result = await docClient.send(
    new GetCommand({
      TableName: env.dynamo.sessionsTable,
      Key: { sessionId },
    })
  );

  return result.Item || null;
}

/**
 * Update session status
 */
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
      Key: { sessionId },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes;
}

/**
 * Add a chat message to a session
 */
async function addChatMessage(sessionId, message) {
  const docClient = getDynamoDocumentClient();
  const timestamp = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: env.dynamo.sessionsTable,
      Key: { sessionId },
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

module.exports = {
  createSession,
  getSessionsByDoctorId,
  getSessionsByPatientId,
  getSessionById,
  updateSessionStatus,
  addChatMessage,
};
