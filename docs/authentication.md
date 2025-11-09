# Inclusive Healthcare Platform – Authentication Foundation

## Vision
Create a multilingual clinical companion that removes communication barriers during appointments. Doctors initiate a secure session, speech is transcribed and translated to the patient’s preferred language, audio/text artifacts are stored, and a structured summary is written to the record. The first milestone is a robust identity layer for doctors and patients backed by Amazon Cognito.

## Domain Concepts (future data model)
| Entity   | Important Fields                                                                        |
|----------|-----------------------------------------------------------------------------------------|
| Doctor   | `doctor_id`, `name`, `specialty`, `patients[]` (references Patient entities)             |
| Patient  | `patient_id`, `name`, `age`, `condition`, `preferred_language`, `sessions[]`             |
| Session  | `session_id`, `doctor_id`, `patient_id`, `start/end`, `audio_uri`, `transcript`, `summary` |

Identity basics (email, name, birthdate, gender) stay in Cognito; every role-specific detail (userType, specialty, patient profile, session references) lives in Amazon DynamoDB so the schema can evolve without Cognito limitations.

## Authentication Architecture
- **Identity Provider:** A single Cognito User Pool with application clients for the server. Two Cognito groups (`Doctors`, `Patients`) distinguish capabilities.
- **User Metadata:** We no longer rely on Cognito custom attributes. Instead, the API persists `userType`, specialty, patient IDs, age, condition, and future profile data (including session history arrays) directly in DynamoDB alongside the linked Cognito `sub`.
- **Server Responsibilities:**
  1. Accept doctor/patient enrollment payloads.
  2. Call Cognito `SignUp` and add the user to the correct group.
  3. Provide login/token issuance via `InitiateAuth`.
  4. Offer confirmation helpers (`/auth/confirm`, `/auth/resend-confirmation`).
- **Environment:** `.env` holds all Cognito IDs plus AWS credentials that have permission to call admin APIs (group assignment).
- **DynamoDB Persistence:** The API writes doctor/patient profiles to a DynamoDB table (partition key `userId`). Each item stores the `userType`, demographics, and an empty `sessions` array so session history can accumulate over time.

## API Surface
| Endpoint | Purpose |
|----------|---------|
| `POST /auth/register/doctor` | Create a doctor account (`email`, `password`, `name`, `birthdate`, `gender`, optional `specialty`). |
| `POST /auth/register/patient` | Create a patient account (`email`, `password`, `name`, `birthdate`, `gender`, optional `patientId`, `age`, `condition`). |
| `POST /auth/login` | Exchange credentials for Cognito tokens (ID/Access/Refresh). |
| `POST /auth/confirm` | Confirm a user with the emailed verification code. |
| `POST /auth/resend-confirmation` | Resend the verification code. |

### Sample Doctor Registration
```bash
curl -X POST http://localhost:3000/auth/register/doctor \
  -H 'Content-Type: application/json' \
  -d '{
        "email": "dr.jane@example.com",
        "password": "ComplexP@ssw0rd",
        "name": "Dr. Jane Doe"
      }'
```

## Next Milestones
1. **Session Orchestration:** Add endpoints to start/close a visit, upload audio, and persist transcript pointers.
2. **Real-Time Media Services:** Integrate Amazon Transcribe/Fargate or WebRTC for live transcription + translation.
3. **Data Store:** Introduce a persistence layer (DynamoDB or PostgreSQL) for patients, doctors, and session history keyed by the IDs validated through Cognito.
4. **Client Applications:** Build separate clinician/patient front-ends that consume the auth + session APIs and surface multilingual transcripts.
