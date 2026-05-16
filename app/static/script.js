let mediaRecorder;
let websocket;
let stream;

let isRecording = false;


/* ======================================
   Upload Audio
====================================== */

async function uploadAudio() {

    const fileInput =
        document.getElementById("audioFile");

    if (!fileInput.files.length) {

        alert("Please select audio");

        return;
    }

    const formData = new FormData();

    formData.append(
        "file",
        fileInput.files[0]
    );

    document.getElementById("result").innerText =
        "⏳ Processing upload...";

    try {

        const response = await fetch(
            "/transcribe",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        document.getElementById("result").innerText =
            data.transcription;

    } catch (error) {

        console.error(error);

        document.getElementById("result").innerText =
            "❌ Upload transcription failed";
    }
}


/* ======================================
   Start Streaming
====================================== */

document.getElementById("startBtn")
.addEventListener("click", async () => {

    try {

        document.getElementById("result").innerText =
            "🎙️ Live transcription started...\n";

        stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        websocket = new WebSocket(
            "ws://127.0.0.1:8000/ws/transcribe"
        );

        websocket.onopen = () => {

            console.log("✅ WebSocket connected");

            isRecording = true;

            startChunkRecording();
        };

        websocket.onmessage = (event) => {

            console.log("📝", event.data);

            const result =
                document.getElementById("result");

            result.innerText += "\n" + event.data;
        };

        websocket.onerror = (error) => {

            console.error(
                "❌ WebSocket error:",
                error
            );
        };

        websocket.onclose = () => {

            console.log("🔌 WebSocket closed");
        };

        document.getElementById("startBtn").disabled = true;
        document.getElementById("stopBtn").disabled = false;

    } catch (error) {

        console.error(error);

        alert(
            "Microphone access denied"
        );
    }
});


/* ======================================
   Chunk Recording Loop
====================================== */

function startChunkRecording() {

    if (!isRecording) return;

    let audioChunks = [];

    mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm"
    });

    mediaRecorder.ondataavailable = (event) => {

        if (event.data.size > 0) {

            audioChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = async () => {

        const audioBlob = new Blob(
            audioChunks,
            {
                type: "audio/webm"
            }
        );

        console.log(
            "🎵 Finalized chunk:",
            audioBlob.size
        );

        if (
            websocket &&
            websocket.readyState === WebSocket.OPEN
        ) {

            const arrayBuffer =
                await audioBlob.arrayBuffer();

            websocket.send(arrayBuffer);

            console.log(
                "🚀 Chunk sent"
            );
        }

        // Continue loop
        if (isRecording) {

            startChunkRecording();
        }
    };

    mediaRecorder.start();

    console.log("🎤 Recording chunk...");

    // Record for 3 seconds
    setTimeout(() => {

        if (
            mediaRecorder &&
            mediaRecorder.state === "recording"
        ) {

            mediaRecorder.stop();
        }

    }, 3000);
}


/* ======================================
   Stop Streaming
====================================== */

document.getElementById("stopBtn")
.addEventListener("click", () => {

    console.log("🛑 Stopping stream");

    isRecording = false;

    if (
        mediaRecorder &&
        mediaRecorder.state === "recording"
    ) {

        mediaRecorder.stop();
    }

    if (
        websocket &&
        websocket.readyState === WebSocket.OPEN
    ) {

        websocket.close();
    }

    // Stop microphone tracks
    if (stream) {

        stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    document.getElementById("startBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;

    document.getElementById("result").innerText +=
        "\n\n🛑 Recording stopped.";
});