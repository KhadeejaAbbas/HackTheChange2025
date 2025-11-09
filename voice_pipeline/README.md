# Voice Pipeline (Node.js)

Express API that proxies audio recordings to the existing AWS Step Functions/Lambda pipeline and returns translated speech.

## Prerequisites
- Node.js 18+
- AWS credentials with access to S3 + Step Functions (env vars or IAM role)
- `.env` file (reuses the backend/.env):
  ```env
  AWS_REGION=ca-central-1
  TRANSCRIBE_MEDIA_BUCKET=...
  STEP_FUNCTION_ARN=...
  RESULT_AUDIO_BUCKET=output-translated-tts
  RESULT_AUDIO_PREFIX=output/
  ```

## Install
```bash
cd voice_pipeline
npm install
```

## Run
```bash
node server.js           # or npm run dev
```
API defaults to `http://localhost:8080`.

## Endpoints
- `POST /translate-audio` – multipart form (`file`, `target_language`). Streams translated MP3 back.
- `POST /translate-audio/json` – same payload, but returns JSON `{ speech, translation, audio }` with Base64 audio.
- `GET /health` – simple status check.

Wire the frontend to this base URL to test the translation flow.
