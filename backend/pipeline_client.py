"""
Shared helpers for uploading audio, invoking the Step Functions pipeline,
and retrieving the translated speech.
"""

from __future__ import annotations

import base64
import json
import os
import time
import uuid
from pathlib import Path
from typing import Optional, Tuple

import boto3
from dotenv import load_dotenv

load_dotenv("backend/.env")

AWS_REGION = os.getenv("AWS_REGION", "ca-central-1")
MEDIA_BUCKET = os.getenv("TRANSCRIBE_MEDIA_BUCKET")
STATE_MACHINE_ARN = os.getenv("STEP_FUNCTION_ARN")
RESULT_BUCKET = os.getenv("RESULT_AUDIO_BUCKET", "output-translated-tts")
RESULT_PREFIX = os.getenv("RESULT_AUDIO_PREFIX", "output/")

if not MEDIA_BUCKET:
    raise RuntimeError("TRANSCRIBE_MEDIA_BUCKET must be set in the environment.")
if not STATE_MACHINE_ARN:
    raise RuntimeError("STEP_FUNCTION_ARN must be set in the environment.")

s3_client = boto3.client("s3", region_name=AWS_REGION)
sfn_client = boto3.client("stepfunctions", region_name=AWS_REGION)


def _put_audio_to_s3(data: bytes, suffix: str) -> str:
    key = f"audio/{uuid.uuid4()}{suffix}"
    s3_client.put_object(Bucket=MEDIA_BUCKET, Key=key, Body=data)
    return key


def upload_audio_file(path: Path) -> str:
    data = path.read_bytes()
    suffix = path.suffix.lower() or ".mp3"
    return _put_audio_to_s3(data, suffix)


def upload_audio_bytes(data: bytes, suffix: str = ".mp3") -> str:
    suffix = suffix if suffix.startswith(".") else f".{suffix}"
    return _put_audio_to_s3(data, suffix.lower())


def start_state_machine(payload: dict, timeout: int = 180) -> dict:
    execution = sfn_client.start_execution(
        stateMachineArn=STATE_MACHINE_ARN,
        input=json.dumps(payload),
    )
    arn = execution["executionArn"]
    deadline = time.time() + timeout
    while time.time() < deadline:
        resp = sfn_client.describe_execution(executionArn=arn)
        status = resp["status"]
        if status == "RUNNING":
            time.sleep(2)
            continue
        if status == "SUCCEEDED":
            return json.loads(resp["output"])
        raise RuntimeError(f"State machine ended with {status}: {resp.get('cause')}")
    sfn_client.stop_execution(executionArn=arn, error="Timeout", cause="Client timeout")
    raise TimeoutError("State machine execution timed out.")


def save_audio_to_s3(base64_audio: str) -> Optional[str]:
    if not RESULT_BUCKET:
        return None
    key = f"{RESULT_PREFIX.rstrip('/')}/{uuid.uuid4()}.mp3"
    s3_client.put_object(
        Bucket=RESULT_BUCKET,
        Key=key,
        Body=base64.b64decode(base64_audio),
        ContentType="audio/mpeg",
    )
    return f"s3://{RESULT_BUCKET}/{key}"


def parse_pipeline_output(raw: dict) -> Tuple[dict, dict, dict]:
    speech = raw.get("speechResult", {}).get("speech", {})
    translation = raw.get("translationResult", {}).get("translation", {})
    speech_audio = raw.get("speechAudioResult", {}).get("speechAudio", {})
    return speech, translation, speech_audio


def run_pipeline_from_file(
    audio_path: Path,
    target_language: str,
    timeout: int = 180,
    save_local_to: Optional[Path] = None,
    upload_audio_result: bool = True,
) -> dict:
    key = upload_audio_file(audio_path)
    payload = {
        "s3Bucket": MEDIA_BUCKET,
        "s3Key": key,
        "targetLanguage": target_language,
    }
    raw = start_state_machine(payload, timeout=timeout)
    speech, translation, speech_audio = parse_pipeline_output(raw)

    audio_b64 = speech_audio.get("audioBase64")
    local_path = None
    if audio_b64 and save_local_to:
        save_local_to.parent.mkdir(parents=True, exist_ok=True)
        save_local_to.write_bytes(base64.b64decode(audio_b64))
        local_path = str(save_local_to.resolve())

    s3_uri = None
    if audio_b64 and upload_audio_result:
        s3_uri = save_audio_to_s3(audio_b64)

    return {
        "speech": speech,
        "translation": translation,
        "audio": {**speech_audio, "audioS3Uri": s3_uri},
        "localFile": local_path,
    }


def run_pipeline_from_bytes(
    audio_bytes: bytes,
    suffix: str,
    target_language: str,
    timeout: int = 180,
    upload_audio_result: bool = True,
) -> dict:
    key = upload_audio_bytes(audio_bytes, suffix=suffix or ".mp3")
    payload = {
        "s3Bucket": MEDIA_BUCKET,
        "s3Key": key,
        "targetLanguage": target_language,
    }
    raw = start_state_machine(payload, timeout=timeout)
    speech, translation, speech_audio = parse_pipeline_output(raw)

    audio_b64 = speech_audio.get("audioBase64")
    s3_uri = None
    if audio_b64 and upload_audio_result:
        s3_uri = save_audio_to_s3(audio_b64)
        speech_audio["audioS3Uri"] = s3_uri

    return {
        "speech": speech,
        "translation": translation,
        "audio": speech_audio,
    }
