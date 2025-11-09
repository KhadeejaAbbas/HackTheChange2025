const authService = require('../services/authService');

async function registerDoctor(req, res, next) {
  try {
    const result = await authService.registerDoctor(req.body);
    res.status(201).json({
      message: 'Doctor registration initiated. Please confirm the account via the verification code that was emailed.',
      userSub: result.userSub,
      status: result.status,
    });
  } catch (error) {
    next(error);
  }
}

async function registerPatient(req, res, next) {
  try {
    const result = await authService.registerPatient(req.body);
    res.status(201).json({
      message: 'Patient registration initiated. Please confirm the account via the verification code that was emailed.',
      userSub: result.userSub,
      status: result.status,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function confirmSignUp(req, res, next) {
  try {
    const result = await authService.confirmSignUp(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function resendConfirmationCode(req, res, next) {
  try {
    const result = await authService.resendConfirmationCode(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerDoctor,
  registerPatient,
  login,
  confirmSignUp,
  resendConfirmationCode,
};
