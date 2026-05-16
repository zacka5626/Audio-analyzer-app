from fastapi import FastAPI, UploadFile, File
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

import shutil
import os

from app.transcriber import transcribe_audio

app = FastAPI(title="Audio Analyzer API")

UPLOAD_DIR = "app/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def home():

    with open("app/static/index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):

    file_path = f"{UPLOAD_DIR}/{file.filename}"

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Transcribe
    text = transcribe_audio(file_path)

    return {
        "filename": file.filename,
        "transcription": text
    }