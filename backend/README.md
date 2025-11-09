# HackTheChange2025 – Backend Utilities

This folder contains Python helpers you can run locally while prototyping the end-to-end audio translation flows.

## Prerequisites
- Python 3.9+
- `pip install boto3`
- AWS credentials configured locally (via `aws configure` or environment variables)
- Environment variables:
  - `AWS_REGION`
  - `TRANSCRIBE_MEDIA_BUCKET` (+ optional `TRANSCRIBE_OUTPUT_BUCKET`) for speech-to-text
  - Optional overrides documented inside each script (`DEFAULT_TARGET_LANGUAGE`, `DEFAULT_VOICE_ID`, etc.)

## Scripts

### `speech_to_text.py`
Uploads a local audio file to S3, kicks off an Amazon Transcribe job, polls until completion, and prints the transcript JSON.

```
python speech_to_text.py samplevoice.mp3 \
  --language en-US          # or omit to auto-detect
```

Expected output:
```json
{
  "job_name": "hackthechange-...",
  "language_code": "en-US",
  "transcript_uri": "https://s3...",
  "transcript": "transcribed text ..."
}
```

### `translate_and_speak.py`
Translates text to a target language with Amazon Translate and synthesizes the result with Amazon Polly.

```
python translate_and_speak.py "bonjour tout le monde" --source fr --target en --output hello.mp3
```

Returns a JSON summary and writes the synthesized audio to `hello.mp3`.
