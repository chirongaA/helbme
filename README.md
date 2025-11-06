---

# 🛡️ **HelbMe** 🛡️

### 🚨 **Protecting HELB Beneficiaries from Smishing Scams** 🚨

**HelbMe** is an innovative web and mobile application designed to help HELB (Higher Education Loans Board) beneficiaries in Kenya detect fraudulent SMS messages (smishing) in real-time. It verifies sender IDs, flags suspicious content, and provides actionable cyber-awareness guidance to prevent financial loss and identity theft.

---

## ✨ **Features**

* 🛑 **Automated Smishing Detection**: Scans incoming SMS messages or uploaded screenshots to identify potential HELB-related scams.
* 📊 **Sender ID Verification**: Uses OCR, regex, and whitelisting to determine message authenticity.
* 🔔 **Real-time Alerts**: Notifies users immediately when a suspicious message is detected.
* 🎯 **Cyber-awareness Guidance**: Provides actionable tips to help users identify scams and safely interact with digital loan systems.
* 📤 **Reporting Workflow**: Allows users to report suspicious messages directly to HELB and telecommunication authorities.

---

## 📚 **Table of Contents**

1. [Overview](#-helbme)
2. [Features](#-features)
3. [Installation](#-installation)
4. [How It Works](#-how-it-works)
5. [Usage](#-usage)
6. [Contributors](#-contributors)
7. [Documentation](#-documentation)

---

## 🖥️ **Installation**

To install or run HelbMe:

1. Clone the repository from GitHub:

   ```bash
   git clone https://github.com/HelbMe/HelbMe.git
   ```
2. Install dependencies for backend (Python) and frontend (Flutter):

   ```bash
   pip install -r requirements.txt  # For backend
   flutter pub get                  # For frontend
   ```
3. Configure database connection (MongoDB) in the backend configuration file.
4. Set up SMS gateway API keys for real-time alerts.
5. Run backend and frontend locally or deploy to a server:

   ```bash
   python app.py  # Backend
   flutter run    # Frontend
   ```

---

## 🛠️ **How It Works**

**HelbMe** operates through a multi-layered system:

* **SMS Detection**: Automatically scans incoming messages or analyzes uploaded screenshots for HELB-specific scam patterns.
* **Sender ID Verification**: Extracted via OCR and checked against a whitelist of legitimate HELB sender IDs.
* **Alerting**: Flags suspicious messages and sends real-time notifications to the user.
* **User Education**: Provides contextual guidance on how to respond safely and avoid scams.
* **Reporting**: Allows users to forward suspected messages to HELB and telcos for verification, creating a feedback loop that improves detection rules over time.

---

## 📖 **Usage**

1. Install or deploy HelbMe following the [Installation](#-installation) instructions.
2. Users can either allow the system to automatically scan incoming messages or manually upload screenshots.
3. Suspicious messages are flagged, with in-app alerts providing guidance and instructions.
4. Users can report suspicious messages directly through the app or via SMS forwarding.
5. HELB and telecommunication authorities receive reports for verification, contributing to ongoing threat mitigation.

---

## 🧑‍🤝‍🧑 **Contributors**

1. Bridgette Musango
2. Augustine Chironga 
3. Victor Mwai
4. Norah Kimathi 

---

## 📘 **Documentation**

For the full documentation about the problem, research, solution idea, and implementation details, visit the [HelbMe Documentation](https://docs.google.com/document/d/1ezQo0OXwnhEI-1s03rovepVqReC-UWWloP1huKE-dA0/edit?tab=t.0).

