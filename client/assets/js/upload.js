const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const statusMessage = document.getElementById('statusMessage');

fileInput.addEventListener('change', () => {
    fileName.textContent = fileInput.files.length ? fileInput.files[0].name : '';
});

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileInput.files.length) {
        statusMessage.textContent = "Please select an image first.";
        statusMessage.className = "mt-4 text-sm font-medium text-center text-yellow-600";
        return;
    }
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // UI state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    statusMessage.textContent = "Processing image...";

    // Determine upload URL:
    // - If the page is opened via file://, or the page origin does not match the expected backend origin
    //   (for example you're serving static files with `python -m http.server` on port 8000),
    //   point to the Flask backend at http://localhost:5000.
    // - Otherwise use relative '/upload' so the same origin works when Flask serves the client.
    const BACKEND_ORIGIN = 'http://localhost:5000';
    const UPLOAD_URL = (location.protocol === 'file:' || location.origin !== BACKEND_ORIGIN) ? `${BACKEND_ORIGIN}/upload` : '/upload';

    try {
        const response = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
        const result = await response.json();
        if (response.ok) {
            // Show the analyzed sender ID and whether it's legit
            if (result.is_known) {
                statusMessage.textContent = `✔ Legitimate sender ID detected: ${result.sender_id}`;
                statusMessage.className = "mt-4 text-sm font-medium text-center text-green-600";
            } else {
                statusMessage.textContent = `⚠ Sender ID "${result.sender_id}" is NOT recognized by HELB. Possible scam.`;
                statusMessage.className = "mt-4 text-sm font-medium text-center text-red-600";
            }
        } else {
            statusMessage.textContent = result.error || "Failed to analyze image.";
            statusMessage.className = "mt-4 text-sm font-medium text-center text-red-600";
        }
    } catch (error) {
        statusMessage.textContent = "Network or server error.";
        statusMessage.className = "mt-4 text-sm font-medium text-center text-red-600";
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Screenshot";
    }
});
