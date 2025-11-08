from fastapi import FastAPI, Form
from fastapi.responses import FileResponse
from openai import OpenAI
import os
import tempfile

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/tts")
async def text_to_speech(text: str = Form(...)):
    # Generate audio using OpenAI TTS
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmpfile:
        response = client.audio.speech.create(
            model="gpt-4o-mini-tts",  # OpenAI's TTS model
            voice="alloy",            # Choose a voice: 'alloy', 'verse', etc.
            input=text
        )
        tmpfile.write(response.read())
        tmpfile_path = tmpfile.name

    return FileResponse(tmpfile_path, media_type="audio/mpeg", filename="output.mp3")
