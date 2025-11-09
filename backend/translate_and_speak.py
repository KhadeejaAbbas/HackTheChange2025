"""
Translate text to a target language and synthesize speech with Amazon Polly.

Environment variables:
- AWS_REGION
- DEFAULT_TARGET_LANGUAGE (optional, defaults to 'en')
- DEFAULT_VOICE_ID (optional; voice fallback if language map has no entry)
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Dict

import boto3

AWS_REGION = os.getenv("AWS_REGION", "ca-central-1")
DEFAULT_TARGET_LANGUAGE = os.getenv("DEFAULT_TARGET_LANGUAGE", "en")
DEFAULT_VOICE_ID = os.getenv("DEFAULT_VOICE_ID", "Joanna")

translate_client = boto3.client("translate", region_name=AWS_REGION)
polly_client = boto3.client("polly", region_name=AWS_REGION)

VOICE_MAP: Dict[str, str] = {
    "en": "Joanna",
    "fr": "Celine",
    "es": "Lucia",
    "de": "Vicki",
    "it": "Bianca",
    "pt": "Camila",
    "hi": "Aditi",
    "ar": "Hoda",
    "ja": "Kazuha",
    "ko": "Seoyeon",
    "zh": "Zhiyu",
}


def translate_text(text: str, source_language: str, target_language: str) -> str:
    response = translate_client.translate_text(
        Text=text,
        SourceLanguageCode=source_language,
        TargetLanguageCode=target_language,
    )
    return response["TranslatedText"]


def synthesize_speech(text: str, language_code: str, output_path: Path) -> Path:
    voice_id = VOICE_MAP.get(language_code, DEFAULT_VOICE_ID)
    response = polly_client.synthesize_speech(
        OutputFormat="mp3",
        VoiceId=voice_id,
        Text=text,
    )
    audio_stream = response["AudioStream"].read()
    output_path.write_bytes(audio_stream)
    return output_path


def translate_and_speak(
    text: str,
    source_language: str,
    target_language: str = DEFAULT_TARGET_LANGUAGE,
    output_file: str = "polly-output.mp3",
) -> dict:
    translated = translate_text(text, source_language, target_language)
    audio_path = synthesize_speech(translated, target_language, Path(output_file))
    return {
        "sourceLanguage": source_language,
        "targetLanguage": target_language,
        "translatedText": translated,
        "audioFile": str(audio_path.resolve()),
    }


def main():
    parser = argparse.ArgumentParser(
        description="Translate text and synthesize the translated speech."
    )
    parser.add_argument("text", help="Input text to translate")
    parser.add_argument("--source", required=True, help="Source language code (e.g. en, fr)")
    parser.add_argument("--target", default=DEFAULT_TARGET_LANGUAGE, help="Target language code")
    parser.add_argument("--output", default="polly-output.mp3", help="Output audio file path")
    args = parser.parse_args()

    result = translate_and_speak(
        text=args.text,
        source_language=args.source,
        target_language=args.target,
        output_file=args.output,
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
