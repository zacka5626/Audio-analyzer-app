async function uploadAudio() {

    const fileInput = document.getElementById("audioFile");

    if (!fileInput.files.length) {
        alert("Please select an audio file");
        return;
    }

    const formData = new FormData();

    formData.append("file", fileInput.files[0]);

    document.getElementById("result").innerText =
        "Processing audio...";

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
            "Error processing audio";
    }
}