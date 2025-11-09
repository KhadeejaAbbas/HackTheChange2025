const sessionService = require("../services/sessionService");

//  Create a new session (doctors only)
const createSession = async (req, res, next) => {
  try {
    const { patientName, patientLanguage, doctorLanguage } = req.body;

    const doctorId = req.user.sub;
    const userType = req.user["cognito:groups"]?.[0]?.toLowerCase();

    if (userType !== "doctors") {
      return res
        .status(403)
        .json({ error: "Only doctors can create sessions" });
    }

    if (!patientName || !patientLanguage || !doctorLanguage) {
      return res.status(400).json({
        error:
          "Missing required fields: patientName, patientLanguage, doctorLanguage",
      });
    }

    const session = await sessionService.createSession({
      doctorId,
      patientName,
      patientLanguage,
      doctorLanguage,
    });

    res.status(201).json({
      message: "Session created successfully",
      session,
    });
  } catch (error) {
    next(error);
  }
};

// Get all sessions for the current user
// Doctors see their sessions, patients see sessions they're part of
const getUserSessions = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const userType = req.user["cognito:groups"]?.[0]?.toLowerCase();

    const sessions = await sessionService.getUserSessions(userId, userType);

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

const getSessionById = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.sub;
    const userType = req.user["cognito:groups"]?.[0]?.toLowerCase();

    const session = await sessionService.getSessionById(
      sessionId,
      userId,
      userType
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ session });
  } catch (error) {
    next(error);
  }
};

const startSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.sub;
    const userType = req.user["cognito:groups"]?.[0]?.toLowerCase();

    const session = await sessionService.updateSessionStatus(
      sessionId,
      "active",
      userId,
      userType
    );

    res.json({
      message: "Session started",
      session,
    });
  } catch (error) {
    next(error);
  }
};

const endSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.sub;
    const userType = req.user["cognito:groups"]?.[0]?.toLowerCase();

    const session = await sessionService.updateSessionStatus(
      sessionId,
      "completed",
      userId,
      userType
    );

    res.json({
      message: "Session ended",
      session,
    });
  } catch (error) {
    next(error);
  }
};

const addMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { speaker, originalText, translatedText } = req.body;
    const userId = req.user.sub;
    const userType = req.user["cognito:groups"]?.[0]?.toLowerCase();

    if (!speaker || !originalText || !translatedText) {
      return res.status(400).json({
        error: "Missing required fields: speaker, originalText, translatedText",
      });
    }

    const session = await sessionService.addChatMessage(
      sessionId,
      { speaker, originalText, translatedText },
      userId,
      userType
    );

    res.json({
      message: "Message added",
      session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getUserSessions,
  getSessionById,
  startSession,
  endSession,
  addMessage,
};
