const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const statusMessage = document.getElementById("statusMessage");

fileInput.addEventListener("change", () => {
  fileName.textContent = fileInput.files.length ? fileInput.files[0].name : "";
});

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!fileInput.files.length) {
    statusMessage.textContent = "⚠️ Please select an image first.";
    statusMessage.className = "mt-4 text-sm font-medium text-center text-yellow-600";
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  // UI state
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";
  statusMessage.textContent = "";

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      statusMessage.textContent = result.message || "✅ Analysis complete!";
      statusMessage.className = "mt-4 text-sm font-medium text-center text-green-600";
    } else {
      statusMessage.textContent = result.error || "❌ Failed to analyze image.";
      statusMessage.className = "mt-4 text-sm font-medium text-center text-red-600";
    }
  } catch (error) {
    statusMessage.textContent = "🚫 Network or server error.";
    statusMessage.className = "mt-4 text-sm font-medium text-center text-red-600";
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Screenshot";
  }
});
