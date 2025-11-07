const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const statusMessage = document.getElementById('statusMessage');
const uploadLabel = fileInput.closest('label');

let selectedFile = null;

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    selectedFile = fileInput.files[0];
    fileName.textContent = selectedFile.name;
  } else {
    selectedFile = null;
    fileName.textContent = '';
  }
});

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
        statusMessage.textContent = "Please select an image first.";
        statusMessage.className = "mt-4 text-sm font-medium text-center text-yellow-600";
        return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    uploadLabel.style.display = 'none';
    fileName.style.display = 'none';

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    statusMessage.textContent = "Processing image, please wait...";
    statusMessage.className = "mt-4 text-sm font-medium text-center text-blue-600";

    const BACKEND_URL = "https://7d2ed26ede80.ngrok-free.app/analyze";

    try {
        const response = await fetch(BACKEND_URL, { method: 'POST', body: formData });
        const result = await response.json();

        if (response.ok) {
            // Store the complete backend response
            sessionStorage.setItem('analysisResult', JSON.stringify(result));
            window.location.href = 'result.html';
        } else {
            statusMessage.textContent = result.error || "Failed to analyze image.";
            statusMessage.className = "mt-4 text-sm font-medium text-center text-red-600";
            restoreUploadUI();
        }
    } catch (error) {
        console.error('Upload error:', error);
        statusMessage.textContent = "Network or server error. Please check if the backend is running.";
        statusMessage.className = "mt-4 text-sm font-medium text-center text-red-600";
        restoreUploadUI();
    }
});

function restoreUploadUI() {
  uploadLabel.style.display = "flex";
  fileName.style.display = "block";
  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze Screenshot";
}