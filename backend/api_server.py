from __future__ import annotations

import base64
import io
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse, JSONResponse

from pipeline_client import run_pipeline_from_bytes

app = FastAPI(title="HackTheChange Translation API")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/translate-audio")
async def translate_audio(
    file: UploadFile = File(...),
    target_language: str = Form("fr"),
    timeout: int = Form(180),
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Audio file is empty.")

    suffix = Path(file.filename or "audio.mp3").suffix or ".mp3"

    try:
        result = run_pipeline_from_bytes(
            contents,
            suffix=suffix,
            target_language=target_language,
            timeout=timeout,
            upload_audio_result=True,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    audio_b64 = result["audio"].get("audioBase64")
    if not audio_b64:
        raise HTTPException(status_code=500, detail="Pipeline returned no audio.")

    audio_bytes = base64.b64decode(audio_b64)
    filename = f"translated_{target_language}.mp3"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}

    return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg", headers=headers)


@app.post("/translate-audio/json")
async def translate_audio_with_metadata(
    file: UploadFile = File(...),
    target_language: str = Form("fr"),
    timeout: int = Form(180),
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Audio file is empty.")

    suffix = Path(file.filename or "audio.mp3").suffix or ".mp3"

    try:
        result = run_pipeline_from_bytes(
            contents,
            suffix=suffix,
            target_language=target_language,
            timeout=timeout,
            upload_audio_result=True,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return JSONResponse(result)
