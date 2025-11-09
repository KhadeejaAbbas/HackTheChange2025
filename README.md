# HackTheChange2025

Audio transcription service with cloud storage integration.

## Features

- Audio transcription using AWS Transcribe
- S3 cloud storage for results
- Clean, optimized codebase

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `backend/.env`:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
```

## Usage

Transcribe an audio file:
```bash
cd backend
python main.py samplevoice.mp3
```

## Project Structure

```
backend/
├── main.py           # Main application
├── transcription.py  # Transcription service
├── s3_storage.py    # S3 storage utility
└── .env             # Environment variables

frontend/
└── my-app/          # Next.js application

samplevoice.mp3      # Sample audio file
requirements.txt     # Python dependencies
```

## Development

- Backend: Python-based transcription and storage services
- Frontend: Next.js application (untouched)
- AWS: S3 storage and Transcribe service integration