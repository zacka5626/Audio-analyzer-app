from fastapi import FastAPI, UploadFile, File, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

import shutil
import os
import uuid

from app.transcriber import transcribe_audio

app = FastAPI(title="Audio Analyzer API")

UPLOAD_DIR = "app/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def home():

    with open("app/static/index.html", "r", encoding="utf-8") as f:
        return f.read()


# =========================================
# Upload Audio Endpoint
# =========================================

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):

    file_path = f"{UPLOAD_DIR}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = transcribe_audio(file_path)

    return {
        "filename": file.filename,
        "transcription": text
    }


# =========================================
# Real-Time WebSocket Streaming
# =========================================

@app.websocket("/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket):

    await websocket.accept()

    try:

        while True:

            audio_bytes = await websocket.receive_bytes()

            temp_filename = f"{uuid.uuid4()}.webm"

            temp_path = os.path.join(
                UPLOAD_DIR,
                temp_filename
            )

            with open(temp_path, "wb") as f:
                f.write(audio_bytes)

            try:

                text = transcribe_audio(temp_path)

                if text.strip():
                    await websocket.send_text(text)

            except Exception as e:

                await websocket.send_text(
                    f"ERROR: {str(e)}"
                )

            finally:

                if os.path.exists(temp_path):
                    os.remove(temp_path)

    except Exception as e:

        print("WebSocket disconnected:", e)