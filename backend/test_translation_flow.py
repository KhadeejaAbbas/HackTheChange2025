#!/usr/bin/env python3
"""
CLI helper that uploads an audio clip, runs the Step Functions pipeline,
and saves the translated speech locally (and to S3 via pipeline_client).
"""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_client import run_pipeline_from_file


def main():
    parser = argparse.ArgumentParser(description="End-to-end translation pipeline tester")
    parser.add_argument("--audio", required=True, help="Path to the source audio file (mp3/m4a/etc.)")
    parser.add_argument("--target-language", default="fr", help="Target language code (default: fr)")
    parser.add_argument(
        "--output",
        default="translated.mp3",
        help="Where to store the synthesized audio returned by the Step Function",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=180,
        help="Seconds to wait for the Step Function execution",
    )
    args = parser.parse_args()

    audio_path = Path(args.audio).expanduser().resolve()
    if not audio_path.exists():
        raise FileNotFoundError(audio_path)

    output_path = Path(args.output).expanduser().resolve()
    print("Running translation pipeline...")
    result = run_pipeline_from_file(
        audio_path,
        target_language=args.target_language,
        timeout=args.timeout,
        save_local_to=output_path,
        upload_audio_result=True,
    )

    print("\n=== Pipeline Results ===")
    print("Transcript:", result["speech"].get("transcriptText"))
    print("Translated:", result["translation"].get("translatedText"))
    print("Audio S3 URI:", result["audio"].get("audioS3Uri"))
    if result.get("localFile"):
        print(f"Saved synthesized audio locally to {result['localFile']}")
    else:
        print("No audio payload returned.")


if __name__ == "__main__":
    main()
