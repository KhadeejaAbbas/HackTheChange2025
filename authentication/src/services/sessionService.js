const sessionRepository = require("../repositories/sessionRepository");
const HttpError = require("../utils/httpError");

// Create a new session
const createSession = async ({
  doctorId,
  patientName,
  patientLanguage,
  doctorLanguage,
}) => {
  // Validate inputs
  if (!doctorId || !patientName || !patientLanguage || !doctorLanguage) {
    throw new HttpError(400, "Missing required fields");
  }

  // Validate language codes (basic validation)
  const validLanguages = ["en", "es", "fr", "de", "zh", "ar", "hi"];
  if (
    !validLanguages.includes(patientLanguage) ||
    !validLanguages.includes(doctorLanguage)
  ) {
    throw new HttpError(400, "Invalid language code");
  }

  const sessionData = {
    doctorId,
    patientName: patientName.trim(),
    patientLanguage,
    doctorLanguage,
    status: "scheduled",
  };

  const session = await sessionRepository.createSession(sessionData);
  return session;
};

// Get all sessions for a user (filtered by role)
const getUserSessions = async (userId, userType) => {
  let sessions;

  if (userType === "doctors") {
    // Doctors see all sessions they created
    sessions = await sessionRepository.getSessionsByDoctorId(userId);
  } else if (userType === "patients") {
    // Patients see sessions where they are the patient
    sessions = await sessionRepository.getSessionsByPatientId(userId);
  } else {
    throw new HttpError(400, "Invalid user type");
  }

  return sessions || [];
};

//  Get a specific session by ID with authorization check
const getSessionById = async (sessionId, userId, userType) => {
  const session = await sessionRepository.getSessionById(sessionId);

  if (!session) {
    throw new HttpError(404, "Session not found");
  }

  // Authorization: doctors can only see their own sessions, patients can only see sessions they're in
  if (userType === "doctors" && session.doctorId !== userId) {
    throw new HttpError(
      403,
      "Unauthorized: You can only access your own sessions"
    );
  }

  if (userType === "patients" && session.patientId !== userId) {
    throw new HttpError(
      403,
      "Unauthorized: You can only access your own sessions"
    );
  }

  return session;
};

//  Update session status
const updateSessionStatus = async (sessionId, status, userId, userType) => {
  // Validate status
  const validStatuses = ["scheduled", "active", "completed"];
  if (!validStatuses.includes(status)) {
    throw new HttpError(400, "Invalid status");
  }

  // Get session first to check authorization
  const session = await getSessionById(sessionId, userId, userType);

  const updatedSession = await sessionRepository.updateSessionStatus(
    sessionId,
    status
  );
  return updatedSession;
};

//  Add a chat message to a session
const addChatMessage = async (sessionId, message, userId, userType) => {
  // Validate message structure
  if (!message.speaker || !message.originalText || !message.translatedText) {
    throw new HttpError(400, "Invalid message format");
  }

  // Get session first to check authorization
  const session = await getSessionById(sessionId, userId, userType);

  const chatMessage = {
    speaker: message.speaker,
    timestamp: new Date().toISOString(),
    originalText: message.originalText,
    translatedText: message.translatedText,
  };

  const updatedSession = await sessionRepository.addChatMessage(
    sessionId,
    chatMessage
  );
  return updatedSession;
};

module.exports = {
  createSession,
  getUserSessions,
  getSessionById,
  updateSessionStatus,
  addChatMessage,
};
