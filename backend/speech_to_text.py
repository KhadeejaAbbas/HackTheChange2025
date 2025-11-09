"""
Speech-to-text helper that runs Amazon Transcribe on a local audio file.

Steps:
1. Upload the audio file to the S3 bucket defined by TRANSCRIBE_MEDIA_BUCKET.
2. Start a transcription job (optionally auto-detect language).
3. Poll until the job finishes and download the transcript JSON.

Environment variables you must set:
- AWS_REGION
- TRANSCRIBE_MEDIA_BUCKET (where input audio is uploaded)
- TRANSCRIBE_OUTPUT_BUCKET (optional; defaults to media bucket)
"""

from __future__ import annotations

import argparse
import json
import os
import time
import uuid
from pathlib import Path
from typing import Optional
from urllib import request as urllib_request

import boto3

AWS_REGION = os.getenv("AWS_REGION", "ca-central-1")
MEDIA_BUCKET = os.getenv("TRANSCRIBE_MEDIA_BUCKET")
OUTPUT_BUCKET = os.getenv("TRANSCRIBE_OUTPUT_BUCKET", MEDIA_BUCKET)
POLL_INTERVAL_SECONDS = int(os.getenv("TRANSCRIBE_POLL_INTERVAL", "5"))

s3_client = boto3.client("s3", region_name=AWS_REGION)
transcribe_client = boto3.client("transcribe", region_name=AWS_REGION)


def _require_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        raise RuntimeError(f"{var_name} must be set in your environment.")
    return value


def upload_audio(local_path: Path, bucket: str, key: str) -> str:
    """Uploads an audio file to S3 and returns the s3:// URI."""
    s3_client.upload_file(str(local_path), bucket, key)
    return f"s3://{bucket}/{key}"


def download_transcript(transcript_uri: str) -> dict:
    """Fetches the transcript JSON produced by Transcribe."""
    with urllib_request.urlopen(transcript_uri) as response:
        payload = response.read()
    return json.loads(payload.decode("utf-8"))


def transcribe_audio(
    audio_path: str,
    job_name: Optional[str] = None,
    media_format: Optional[str] = None,
    language_code: Optional[str] = None,
    identify_language: bool = True,
) -> dict:
    """
    Runs a transcription job and returns a dict containing:
      - transcript (str)
      - language_code (str)
      - job_name (str)
      - transcript_uri (str)
    """
    bucket = _require_env("TRANSCRIBE_MEDIA_BUCKET")
    output_bucket = os.getenv("TRANSCRIBE_OUTPUT_BUCKET", bucket)

    audio_file = Path(audio_path)
    if not audio_file.exists():
        raise FileNotFoundError(audio_path)

    job_name = job_name or f"hackthechange-{uuid.uuid4()}"
    media_format = media_format or audio_file.suffix.lstrip(".").lower() or "mp3"
    s3_key = f"transcribe-input/{job_name}.{media_format}"

    media_uri = upload_audio(audio_file, bucket, s3_key)

    job_config = {
        "TranscriptionJobName": job_name,
        "Media": {"MediaFileUri": media_uri},
        "OutputBucketName": output_bucket,
        "MediaFormat": media_format,
    }

    if identify_language and not language_code:
        job_config["IdentifyLanguage"] = True
    else:
        job_config["LanguageCode"] = language_code or "en-US"

    transcribe_client.start_transcription_job(**job_config)

    while True:
        job = transcribe_client.get_transcription_job(
            TranscriptionJobName=job_name
        )["TranscriptionJob"]
        status = job["TranscriptionJobStatus"]
        if status in {"COMPLETED", "FAILED"}:
            break
        time.sleep(POLL_INTERVAL_SECONDS)

    if status == "FAILED":
        raise RuntimeError(f"Transcription job failed: {job.get('FailureReason')}")

    transcript_uri = job["Transcript"]["TranscriptFileUri"]
    transcript_json = download_transcript(transcript_uri)
    transcript_text = transcript_json["results"]["transcripts"][0]["transcript"]

    return {
        "job_name": job_name,
        "language_code": job.get("LanguageCode")
        or transcript_json["results"].get("language_code"),
        "transcript_uri": transcript_uri,
        "transcript": transcript_text,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Transcribe a local audio file via Amazon Transcribe"
    )
    parser.add_argument("audio_path", help="Path to the audio file (mp3, wav, m4a, etc.)")
    parser.add_argument("--language", dest="language_code", help="Force a language code")
    parser.add_argument(
        "--no-auto-language",
        action="store_true",
        help="Disable automatic language identification",
    )
    args = parser.parse_args()

    result = transcribe_audio(
        audio_path=args.audio_path,
        language_code=args.language_code,
        identify_language=not args.no_auto_language,
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
