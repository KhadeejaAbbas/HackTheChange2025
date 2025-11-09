# HackTheChange2025 – Server API

This folder hosts the Express API that backs the inclusive healthcare platform. It wires Cognito for authentication and Amazon DynamoDB for doctor/patient profile storage.

## Getting Started
1. `npm install`
2. Copy config: `cp .env.example .env`
3. Fill in Cognito + AWS variables (`COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, optional `COGNITO_CLIENT_SECRET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`). Set `COGNITO_CLIENT_SECRET` only if your app client was created with a secret.
4. Create a DynamoDB table (partition key `userId` as `String`) and set `DYNAMODB_USERS_TABLE` to its name.
5. Run locally: `npm run dev`

## Signup Payloads
- `POST /auth/register/doctor`: `email`, `password`, `name`, `birthdate`, `gender`, optional `specialty`.
- `POST /auth/register/patient`: `email`, `password`, `name`, `birthdate`, `gender`, optional `patientId`, `age`, `condition`.

Common attributes (`email`, `name`, `birthdate`, `gender`) live in Cognito. Role-specific metadata (`userType`, specialty, demographics, empty `sessions` list) is stored in DynamoDB.

## Key Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register/doctor` | Register a doctor and add to the `Doctors` group. |
| POST | `/auth/register/patient` | Register a patient and add to the `Patients` group. |
| POST | `/auth/login` | Cognito USER_PASSWORD_AUTH flow returning tokens. |
| POST | `/auth/confirm` | Confirm sign-up with the emailed code. |
| POST | `/auth/resend-confirmation` | Resend the verification code. |

## Development Notes
- Data is written to the DynamoDB table defined by `DYNAMODB_USERS_TABLE`.
- Error responses use a consistent JSON shape via `HttpError` + error middleware.
- All routes are mounted under `/auth`; extend `src/routes` as new features (sessions, transcription) are added.
