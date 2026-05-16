from faster_whisper import WhisperModel


# Load model once during startup
model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)


def transcribe_audio(audio_path: str):

    try:

        segments, info = model.transcribe(
            audio_path,

            # Faster streaming response
            beam_size=1,

            # Better real-time behavior
            vad_filter=True,

            # Lower latency
            condition_on_previous_text=False,

            # Language detection
            language="en"
        )

        text = ""

        for segment in segments:

            print(
                f"[{segment.start:.2f}s -> "
                f"{segment.end:.2f}s] "
                f"{segment.text}"
            )

            text += segment.text + " "

        return text.strip()

    except Exception as e:

        print("Transcription Error:", e)

        return ""