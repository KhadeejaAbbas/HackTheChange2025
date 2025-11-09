# Backend Workflow

## Overview

Audio transcription and translation pipeline using AWS services with S3 storage.

## Core Components

### 1. Audio Processing (`main.py`)

```bash
python main.py audio.mp3 --translate es fr
```

- Transcribes audio using AWS Transcribe
- Auto-detects language with AWS Comprehend
- Translates to multiple languages via AWS Translate
- Saves all results to S3

### 2. Individual Services

**Transcription** (`transcription.py`)

```bash
python transcription.py
```

- Basic audio-to-text conversion only

**Translation** (`translation.py`)

- Language detection and multi-language translation
- Supports 75+ languages
- Used by main.py workflow

**S3 Storage** (`s3_storage.py`)

- Upload/download text, JSON, and files
- Bucket management
- Content retrieval

### 3. AWS Services Test (`test.py`)

```bash
python test.py
```

- Tests Bedrock (AI text generation)
- Tests Comprehend Medical
- Lists and retrieves S3 data
- Validates all AWS integrations

## Workflow Steps

1. **Audio Input** → `main.py`
2. **Transcription** → AWS Transcribe
3. **Language Detection** → AWS Comprehend
4. **Translation** → AWS Translate (if requested)
5. **Storage** → S3 bucket with organized file structure

## S3 File Structure

```
hackthechange-transcripts/
├── transcripts/
│   ├── filename_timestamp.txt
│   └── filename_timestamp.json
└── translations/
    ├── filename_timestamp_es.txt
    └── filename_timestamp_fr.txt
```

## Quick Commands

```bash
# Full workflow with translation
python main.py audio.mp3 --translate es fr de

# Just transcription
python main.py audio.mp3 --no-s3

# Test all services
python test.py

# List supported languages
python main.py --list-languages
```
