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
    formData.append('file', selectedFile);

    // Hide upload box and show processing state
    uploadLabel.style.display = 'none';
    fileName.style.display = 'none';
    
    // Update UI state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    statusMessage.textContent = "Processing image, please wait...";
    statusMessage.className = "mt-4 text-sm font-medium text-center text-blue-600";

    // Backend URL configuration
    const BACKEND_ORIGIN = 'https://d32c5413a044.ngrok-free.app';
    const UPLOAD_URL = (location.protocol === 'file:' || location.origin !== BACKEND_ORIGIN) 
        ? `${BACKEND_ORIGIN}/upload` 
        : '/upload';

    try {
        const response = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
        const result = await response.json();
        
        if (response.ok) {
            // Store result in sessionStorage to pass to result.html
            sessionStorage.setItem('analysisResult', JSON.stringify({
                sender_id: result.sender_id,
                is_known: result.is_known,
                filename: selectedFile.name,
                timestamp: new Date().toISOString()
            }));
            
            // Redirect to result page
            window.location.href = 'result.html';
        } else {
            // Show error and restore UI
            statusMessage.textContent = result.error || "Failed to analyze image.";
            statusMessage.className = "mt-4 text-sm font-medium text-center text-red-600";
            restoreUploadUI();
        }
    } catch (error) {
        statusMessage.textContent = "Network or server error. Please check if the backend is running.";
        statusMessage.className = "mt-4 text-sm font-medium text-center text-red-600";
        restoreUploadUI();
    }
});

function restoreUploadUI() {
    // Restore upload box visibility
    uploadLabel.style.display = 'flex';
    fileName.style.display = 'block';
    
    // Reset button state
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Screenshot";
}