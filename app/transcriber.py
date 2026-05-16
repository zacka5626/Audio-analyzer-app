from faster_whisper import WhisperModel

model = None


def get_model():

    global model

    if model is None:

        print("Loading Whisper model...")

        model = WhisperModel(
            "small",
            device="cpu",
            compute_type="int8"
        )

        print("Whisper model loaded.")

    return model


def transcribe_audio(audio_path: str):

    try:

        model = get_model()

        segments, info = model.transcribe(

            audio_path,

            beam_size=1,

            vad_filter=True,

            condition_on_previous_text=False,

            temperature=0.0
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