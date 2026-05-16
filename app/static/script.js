let mediaRecorder;
let audioChunks = [];


/* =========================
   Upload Audio
========================= */

async function uploadAudio() {

    const fileInput = document.getElementById("audioFile");

    if (!fileInput.files.length) {
        alert("Please select audio file");
        return;
    }

    const formData = new FormData();

    formData.append("file", fileInput.files[0]);

    sendAudioToServer(formData);
}


/* =========================
   Start Recording
========================= */

document.getElementById("startBtn")
    .addEventListener("click", async () => {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        mediaRecorder = new MediaRecorder(stream);

        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {

            const audioBlob =
                new Blob(audioChunks, {
                    type: "audio/webm"
                });

            const formData = new FormData();

            formData.append(
                "file",
                audioBlob,
                "recording.webm"
            );

            sendAudioToServer(formData);
        };

        mediaRecorder.start();

        document.getElementById("result").innerText =
            "🎙️ Recording started...";

        document.getElementById("startBtn").disabled = true;
        document.getElementById("stopBtn").disabled = false;

    } catch (error) {

        alert("Microphone access denied");
    }
});


/* =========================
   Stop Recording
========================= */

document.getElementById("stopBtn")
    .addEventListener("click", () => {

    mediaRecorder.stop();

    document.getElementById("result").innerText =
        "⏳ Processing audio...";

    document.getElementById("startBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;
});


/* =========================
   Send Audio To Backend
========================= */

async function sendAudioToServer(formData) {

    try {

        const response = await fetch("/transcribe", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        document.getElementById("result").innerText =
            data.transcription;

    } catch (error) {

        document.getElementById("result").innerText =
            "❌ Error processing audio";
    }
}