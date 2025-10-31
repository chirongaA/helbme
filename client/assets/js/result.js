// Toggle menu dropdown
const menuIcon = document.getElementById('menuIcon');
const menu = document.getElementById('menu');

if (menuIcon && menu) {
    menuIcon.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuIcon.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.add('hidden');
        }
    });
}

// Load and display analysis result
document.addEventListener('DOMContentLoaded', () => {
    const resultData = sessionStorage.getItem('analysisResult');
    
    if (!resultData) {
        // No result data, redirect back to upload
        window.location.href = 'upload.html';
        return;
    }

    try {
        const result = JSON.parse(resultData);
        displayResult(result);
        
        // Clear the session storage after displaying (optional)
        // sessionStorage.removeItem('analysisResult');
    } catch (error) {
        console.error('Error parsing result data:', error);
        window.location.href = 'upload.html';
    }
});

function displayResult(result) {
    const { sender_id, is_known, filename } = result;
    
    // Get DOM elements
    const iconContainer = document.querySelector('.w-20.h-20');
    const icon = iconContainer.querySelector('.material-symbols-outlined');
    const heading = document.querySelector('h1');
    const description = document.querySelector('p.text-gray-700');
    const mainContent = document.querySelector('main');
    
    if (is_known) {
        // Legitimate message
        iconContainer.className = 'flex items-center justify-center w-20 h-20 bg-safe/10 rounded-full mb-4';
        icon.className = 'material-symbols-outlined text-4xl text-safe';
        icon.textContent = 'check_circle';
        
        heading.className = 'text-safe text-3xl font-bold mb-2';
        heading.textContent = 'Message is Legitimate';
        
        description.innerHTML = `
            The sender ID <strong>"${sender_id}"</strong> is recognized as an official HELB communication channel. 
            This message appears to be legitimate.
        `;
        
        // Replace findings section with safe message info
        const findingsSection = document.querySelector('.grid.gap-4');
        if (findingsSection) {
            findingsSection.innerHTML = `
                <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div class="flex items-center justify-center w-10 h-10 bg-safe/10 rounded-full">
                        <span class="material-symbols-outlined text-safe">verified</span>
                    </div>
                    <div class="text-left">
                        <p class="font-bold text-gray-800">Verified Sender</p>
                        <p class="text-gray-600 text-sm">The sender ID "${sender_id}" is on HELB's official list of communication channels.</p>
                    </div>
                </div>
                
                <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div class="flex items-center justify-center w-10 h-10 bg-safe/10 rounded-full">
                        <span class="material-symbols-outlined text-safe">security</span>
                    </div>
                    <div class="text-left">
                        <p class="font-bold text-gray-800">Official Communication</p>
                        <p class="text-gray-600 text-sm">This message came through HELB's verified channels: HELB, 5122, or SurePay.</p>
                    </div>
                </div>
            `;
        }
        
        // Update next steps section
        const nextStepsSection = document.querySelector('section.max-w-xl');
        if (nextStepsSection) {
            nextStepsSection.innerHTML = `
                <h3 class="text-lg font-bold text-gray-800 mb-3">What This Means</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-2">
                    <li>This message is from an official HELB sender.</li>
                    <li>You can safely read and follow instructions in the message.</li>
                    <li>Always verify links before clicking, even from official sources.</li>
                    <li>If you're unsure, contact HELB directly through their official channels.</li>
                </ul>
            `;
        }
        
        // Update action button
        const actionButton = document.querySelector('button.bg-scam');
        if (actionButton) {
            actionButton.className = 'bg-safe text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-safe/90 transition';
            actionButton.textContent = 'Check Another Message';
            actionButton.onclick = () => window.location.href = 'upload.html';
        }
        
    } else {
        // Potential scam
        iconContainer.className = 'flex items-center justify-center w-20 h-20 bg-scam/10 rounded-full mb-4';
        icon.className = 'material-symbols-outlined text-4xl text-scam';
        icon.textContent = 'warning';
        
        heading.className = 'text-scam text-3xl font-bold mb-2';
        heading.textContent = 'Likely a Scam';
        
        description.innerHTML = `
            The sender ID <strong>"${sender_id}"</strong> is NOT recognized by HELB. 
            This message shows signs of a potential smishing attempt.
        `;
        
        // Update findings section for scam
        const findingsSection = document.querySelector('.grid.gap-4');
        if (findingsSection) {
            findingsSection.innerHTML = `
                <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div class="flex items-center justify-center w-10 h-10 bg-scam/10 rounded-full">
                        <span class="material-symbols-outlined text-scam">error</span>
                    </div>
                    <div class="text-left">
                        <p class="font-bold text-gray-800">Unrecognized Sender</p>
                        <p class="text-gray-600 text-sm">The sender ID "${sender_id}" is not in HELB's official list of verified senders.</p>
                    </div>
                </div>
                
                <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div class="flex items-center justify-center w-10 h-10 bg-scam/10 rounded-full">
                        <span class="material-symbols-outlined text-scam">shield_off</span>
                    </div>
                    <div class="text-left">
                        <p class="font-bold text-gray-800">Potential Impersonation</p>
                        <p class="text-gray-600 text-sm">Scammers often impersonate HELB using fake sender IDs or phone numbers.</p>
                    </div>
                </div>
                
                <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div class="flex items-center justify-center w-10 h-10 bg-scam/10 rounded-full">
                        <span class="material-symbols-outlined text-scam">block</span>
                    </div>
                    <div class="text-left">
                        <p class="font-bold text-gray-800">Suspicious Activity</p>
                        <p class="text-gray-600 text-sm">HELB only communicates through verified channels: HELB, 5122, and SurePay.</p>
                    </div>
                </div>
            `;
        }
        
        // Update next steps for scam
        const nextStepsSection = document.querySelector('section.max-w-xl');
        if (nextStepsSection) {
            nextStepsSection.innerHTML = `
                <h3 class="text-lg font-bold text-gray-800 mb-3">What to Do Next</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-2">
                    <li>Do NOT click on any links in the message.</li>
                    <li>Do NOT share personal information or send money.</li>
                    <li>Block and report the sender to your mobile provider.</li>
                    <li>Delete the message immediately.</li>
                    <li>If you've already responded, contact HELB directly on their official channels.</li>
                </ul>
            `;
        }
        
        // Update action button for scam
        const actionButton = document.querySelector('button');
        if (actionButton) {
            actionButton.textContent = 'Check Another Message';
            actionButton.onclick = () => window.location.href = 'upload.html';
        }
    }
}