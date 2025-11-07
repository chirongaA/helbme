// Function to display results based on backend response
function displayResult(result) {
    const {
        sender_id,
        is_known,
        verdict,
        message,
        advice,
        urls_checked
    } = result;

    // Update verdict section
    const verdictSection = document.getElementById('verdictSection');
    
    if (is_known) {
        // LEGITIMATE MESSAGE
        verdictSection.innerHTML = `
            <div class="flex items-center justify-center w-20 h-20 bg-safe/10 rounded-full mb-4">
                <span class="material-symbols-outlined text-4xl text-safe">check_circle</span>
            </div>
            <h1 class="text-safe text-3xl font-bold mb-2">Message is Legitimate</h1>
            <p class="text-gray-700 max-w-md mx-auto">
                ${message || `The sender ID <strong>"${sender_id}"</strong> is recognized as an official HELB communication channel. This message appears to be legitimate.`}
            </p>
        `;
    } else {
        // SCAM MESSAGE
        verdictSection.innerHTML = `
            <div class="flex items-center justify-center w-20 h-20 bg-scam/10 rounded-full mb-4">
                <span class="material-symbols-outlined text-4xl text-scam">warning</span>
            </div>
            <h1 class="text-scam text-3xl font-bold mb-2">${verdict || 'Likely to be a Scam'}</h1>
            <p class="text-gray-700 max-w-md mx-auto">
                ${message || `The sender ID <strong>"${sender_id}"</strong> is NOT recognized by HELB. This message shows signs of a potential smishing attempt.`}
            </p>
        `;
    }

    // Update findings section based on message type
    const findingsSection = document.getElementById('findingsSection');
    if (is_known) {
        // Legitimate findings
        findingsSection.innerHTML = `
            <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div class="flex items-center justify-center w-10 h-10 bg-safe/10 rounded-full">
                    <span class="material-symbols-outlined text-safe">verified_user</span>
                </div>
                <div class="text-left">
                    <p class="font-bold text-gray-800">Verified Sender</p>
                    <p class="text-gray-600 text-sm">The sender ID matches official HELB communication channels.</p>
                </div>
            </div>
            <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div class="flex items-center justify-center w-10 h-10 bg-safe/10 rounded-full">
                    <span class="material-symbols-outlined text-safe">phone</span>
                </div>
                <div class="text-left">
                    <p class="font-bold text-gray-800">Official Communication</p>
                    <p class="text-gray-600 text-sm">This message comes from a trusted HELB source.</p>
                </div>
            </div>
        `;
    } else {
        // Scam findings
        findingsSection.innerHTML = `
            <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div class="flex items-center justify-center w-10 h-10 bg-scam/10 rounded-full">
                    <span class="material-symbols-outlined text-scam">link</span>
                </div>
                <div class="text-left">
                    <p class="font-bold text-gray-800">Suspicious Sender</p>
                    <p class="text-gray-600 text-sm">The sender ID is not recognized as an official HELB channel.</p>
                </div>
            </div>
            <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div class="flex items-center justify-center w-10 h-10 bg-scam/10 rounded-full">
                    <span class="material-symbols-outlined text-scam">warning</span>
                </div>
                <div class="text-left">
                    <p class="font-bold text-gray-800">Potential Risk</p>
                    <p class="text-gray-600 text-sm">This message may be a smishing attempt.</p>
                </div>
            </div>
        `;
    }

    // Update next steps section
    const nextStepsSection = document.getElementById('nextStepsSection');
    if (is_known) {
        // Legitimate next steps
        nextStepsSection.innerHTML = `
            <h3 class="text-lg font-bold text-gray-800 mb-3">What to Do Next</h3>
            <ul class="list-disc list-inside text-gray-700 space-y-2">
                <li>You can safely interact with this official HELB message</li>
                <li>Always verify that messages come from official sender IDs: <strong>HELB</strong>, <strong>SurePay</strong>, or <strong>5122</strong></li>
                <li>Stay alert for any unexpected requests even from official sources</li>
            </ul>
        `;
    } else {
        // Scam next steps
        nextStepsSection.innerHTML = `
            <h3 class="text-lg font-bold text-gray-800 mb-3">What to Do Next</h3>
            <ul class="list-disc list-inside text-gray-700 space-y-2">
                <li>Do not click on any links in this message</li>
                <li>Block and report the sender immediately</li>
                <li>Delete the message to stay safe</li>
                <li>Remember: HELB only uses <strong>HELB</strong>, <strong>SurePay</strong>, and <strong>5122</strong> sender IDs</li>
            </ul>
        `;
    }

    // Update URL analysis section
    const urlSection = document.getElementById('urlSection');
    if (urls_checked && urls_checked.length > 0 && !urls_checked[0].message) {
        let urlContent = `
            <h3 class="text-lg font-bold text-gray-800 mb-3">🔗 URL Safety Check</h3>
            <div class="space-y-3">
        `;
        
        urls_checked.forEach(urlObj => {
            if (urlObj.url) {
                const isSafe = urlObj.status === 'safe' || urlObj.verdict === 'clean';
                const isUnsafe = urlObj.status === 'unsafe' || urlObj.verdict === 'malicious';
                
                urlContent += `
                    <div class="p-3 bg-white rounded-lg shadow-sm border-l-4 ${isUnsafe ? 'border-scam' : 'border-safe'}">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-medium break-all">${urlObj.url}</p>
                                <p class="text-sm ${isUnsafe ? 'text-scam' : 'text-safe'} font-medium mt-1">
                                    ${isUnsafe ? '⚠️ Suspicious or Malicious' : '✅ Clean and Safe'}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        urlContent += `</div>`;
        urlSection.innerHTML = urlContent;
    } else {
        urlSection.innerHTML = `
            <h3 class="text-lg font-bold text-gray-800 mb-3">🔗 URL Safety Check</h3>
            <p class="text-gray-600 bg-white p-4 rounded-lg">No URLs found in this message.</p>
        `;
    }
}

// Load and display result when page loads
document.addEventListener('DOMContentLoaded', function() {
    const resultData = sessionStorage.getItem('analysisResult');
    
    if (resultData) {
        try {
            const result = JSON.parse(resultData);
            displayResult(result);
        } catch (error) {
            console.error('Error parsing result data:', error);
            document.getElementById('verdictSection').innerHTML = `
                <div class="text-center">
                    <h1 class="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p class="text-gray-700">Failed to load analysis results. Please try again.</p>
                </div>
            `;
        }
    } else {
        document.getElementById('verdictSection').innerHTML = `
            <div class="text-center">
                <h1 class="text-2xl font-bold text-yellow-600 mb-4">No Analysis Data</h1>
                <p class="text-gray-700">Please upload a message screenshot first.</p>
                <button onclick="window.location.href='upload.html'" class="mt-4 bg-primary text-white font-bold py-2 px-4 rounded-lg">
                    Go to Upload
                </button>
            </div>
        `;
    }
});

// Menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menuIcon');
    const menu = document.getElementById('menu');
    
    if (menuIcon && menu) {
        menuIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function() {
            menu.classList.add('hidden');
        });
        
        // Prevent menu from closing when clicking inside it
        menu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});