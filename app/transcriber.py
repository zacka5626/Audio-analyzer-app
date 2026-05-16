from faster_whisper import WhisperModel

# Load model once
model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)


def transcribe_audio(audio_path: str):

    segments, info = model.transcribe(audio_path)

    full_text = ""

    for segment in segments:
        full_text += segment.text + " "

    return full_text.strip()