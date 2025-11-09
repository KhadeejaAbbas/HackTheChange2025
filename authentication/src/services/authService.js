const crypto = require("crypto");
const {
  SignUpCommand,
  AdminAddUserToGroupCommand,
  InitiateAuthCommand,
  AdminConfirmSignUpCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const HttpError = require("../utils/httpError");
const env = require("../config/env");
const getCognitoClient = require("../config/cognitoClient");
const doctorRepository = require("../repositories/doctorRepository");
const patientRepository = require("../repositories/patientRepository");

function buildSecretHash(username) {
  if (!env.cognito.clientSecret) {
    return undefined;
  }

  return crypto
    .createHmac("sha256", env.cognito.clientSecret)
    .update(`${username}${env.cognito.clientId}`)
    .digest("base64");
}

function mapCognitoError(error) {
  if (!error || !error.name) {
    return error;
  }

  switch (error.name) {
    case "UsernameExistsException":
      return new HttpError(409, "An account with this email already exists");
    case "InvalidPasswordException":
      return new HttpError(400, error.message);
    case "UserNotFoundException":
    case "NotAuthorizedException":
      return new HttpError(401, "Invalid credentials");
    case "UserNotConfirmedException":
      return new HttpError(403, "User account is not confirmed yet", {
        action: "CONFIRM_SIGN_UP",
      });
    default:
      return new HttpError(502, error.message || "Unexpected Cognito error");
  }
}

function buildAttributes({ email, name, birthdate, gender }) {
  const attributes = [];

  if (email) {
    attributes.push({ Name: "email", Value: email.toLowerCase() });
  }

  if (name) {
    attributes.push({ Name: "name", Value: name });
  }

  if (birthdate) {
    attributes.push({ Name: "birthdate", Value: birthdate });
  }

  if (gender) {
    attributes.push({ Name: "gender", Value: gender });
  }

  return attributes;
}

async function registerUser({
  email,
  password,
  name,
  birthdate,
  gender,
  groupName,
}) {
  if (!email || !password || !name) {
    throw new HttpError(400, "email, password and name are required");
  }

  env.assertCognitoConfig();
  const client = getCognitoClient();

  try {
    const secretHash = buildSecretHash(email);
    const signUpInput = {
      ClientId: env.cognito.clientId,
      Username: email,
      Password: password,
      UserAttributes: buildAttributes({
        email,
        name,
        birthdate,
        gender,
      }),
    };

    if (secretHash) {
      signUpInput.SecretHash = secretHash;
    }

    const signUpCommand = new SignUpCommand(signUpInput);

    const response = await client.send(signUpCommand);

    // Auto-confirm the user
    await client.send(
      new AdminConfirmSignUpCommand({
        UserPoolId: env.cognito.userPoolId,
        Username: email,
      })
    );

    if (groupName) {
      const addToGroupCommand = new AdminAddUserToGroupCommand({
        GroupName: groupName,
        UserPoolId: env.cognito.userPoolId,
        Username: email,
      });
      await client.send(addToGroupCommand);
    }

    return {
      userSub: response.UserSub,
      status: "CONFIRMED",
    };
  } catch (error) {
    throw mapCognitoError(error);
  }
}

async function registerDoctor(payload) {
  const { email, password, name, specialty, birthdate, gender } = payload;

  const registration = await registerUser({
    email,
    password,
    name,
    birthdate,
    gender,
    groupName: env.cognito.doctorGroupName,
  });

  await doctorRepository.createDoctor({
    id: registration.userSub,
    email,
    name,
    specialty,
    birthdate,
    gender,
  });

  return registration;
}

async function registerPatient(payload) {
  const {
    email,
    password,
    name,
    patientId,
    age,
    condition,
    birthdate,
    gender,
  } = payload;

  const registration = await registerUser({
    email,
    password,
    name,
    birthdate,
    gender,
    groupName: env.cognito.patientGroupName,
  });

  await patientRepository.createPatient({
    id: registration.userSub,
    email,
    name,
    patientId,
    age,
    condition,
    birthdate,
    gender,
  });

  return registration;
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new HttpError(400, "email and password are required");
  }

  env.assertCognitoConfig();
  const client = getCognitoClient();

  try {
    const authParameters = {
      USERNAME: email,
      PASSWORD: password,
    };

    const secretHash = buildSecretHash(email);
    if (secretHash) {
      authParameters.SECRET_HASH = secretHash;
    }

    const response = await client.send(
      new InitiateAuthCommand({
        ClientId: env.cognito.clientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: authParameters,
      })
    );

    return {
      tokens: response.AuthenticationResult,
      challengeName: response.ChallengeName,
      session: response.Session,
    };
  } catch (error) {
    throw mapCognitoError(error);
  }
}

module.exports = {
  registerDoctor,
  registerPatient,
  login,
};
