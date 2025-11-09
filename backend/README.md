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

### 1. `speech_to_text.py`
Wrapper around `transcription.TranscriptionService`. Provide a local audio file (mp3/wav/m4a). The script uploads temporarily to S3, runs Amazon Transcribe, and prints the transcript.

```
python speech_to_text.py samplevoice.mp3
```

Output:
```json
{
  "audioFile": "/abs/path/samplevoice.mp3",
  "transcript": "Recognized speech..."
}
```

### 2. `translate_text.py`
Translate any string between languages using Amazon Translate.

```
python translate_text.py "bonjour" --source fr --target en
```

### 3. `text_to_speech.py`
Convert text to audio in the specified language. Polly voice is chosen via the built-in `VOICE_MAP`.

```
python text_to_speech.py "Hello world" --target en --output hello.mp3
```

If you set `TTS_OUTPUT_BUCKET` (and optional `TTS_OUTPUT_PREFIX`) in `.env`, the Lambda version of this script also drops the MP3 into S3 for later retrieval.

### 4. `translate_and_speak.py`
Convenience command that chains translation + Polly synthesis in one go.

```
python translate_and_speak.py "hola" --source es --target en --output hola-en.mp3
```

### 5. `test_translation_flow.py`
Uploads a local audio clip, kicks off the Step Functions pipeline, and saves the translated audio output. Requires `STEP_FUNCTION_ARN` (state machine) plus the same bucket/region env vars.

```
python test_translation_flow.py \
  --audio samplevoice.mp3 \
  --target-language fr \
  --output translated.mp3
```
The script also writes the synthesized MP3 to `s3://output-translated-tts/output/<uuid>.mp3` by default. Override `RESULT_AUDIO_BUCKET` / `RESULT_AUDIO_PREFIX` in `.env` if you need a different destination.
