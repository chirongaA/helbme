# 🛡️ HelbMe 🛡️

### Protecting HELB Beneficiaries from Smishing Scams 

**HelbMe** is an innovative web application designed to help HELB (Higher Education Loans Board) beneficiaries in Kenya detect fraudulent SMS messages (smishing) in real-time. It verifies sender IDs, flags suspicious content,verifies links embedded in messages and provides actionable cyber-awareness guidance to prevent financial loss and identity theft.

---

## 🚨 Features

* 🛑 **Automated Smishing Detection**: Scans uploaded screenshots to identify potential HELB-related scams.
* 📊 **Sender ID Verification**: Uses OCR, regex, and whitelisting to determine message authenticity.
* 🔔 **Instant delivery**: Notifies users immediately when a suspicious message is detected.
* 🎯 **Cyber-awareness Guidance**: Provides clear tips to help users identify scams and safely interact with digital loan systems.
* 📤 **Link verification**: Outputs whether embedded links are safe.

---

## 📚 Table of Contents

1. [Overview](#-helbme)
2. [Features](#-features)
3. [Installation](#-installation)
4. [How It Works](#-how-it-works)
5. [Usage](#-usage)
6. [Contributors](#-contributors)
7. [Documentation](#-documentation)

---

## 🖥️ Installation

To install or run HelbMe:

1. Clone the repository from GitHub:

   ```bash
   git clone [https://github.com/chirongaA/helbme.git]
   ```
2. Install dependencies for the backend (Python):

   ```bash
   pip install -r requirements.txt  # Backend
   ```
3. Install Tesseract OCR from https://tesseract-ocr.github.io/tessdoc/Installation.html
4. Configure database connection (MongoDB) in the backend configuration file.
5. Set up VirusTotal API key for link verification.
6. On Vs code open two terminals:
   
   a). Terminal 1: runs python -m http.server in your overall file for example C:\Users\user\helbme\helbme\
   
   b). Terminal 2: in your backend folder, run python app.py

7. The frontend can be hosted from your Github Pages or locally using the URL: http://x.x.x.:8000/client

8. The backend can also be hosted  through a live server or locally under the function uploadForm.addEventListener() in upload.js, by editing the backend URL to your URL of choice.

---

## 🛠️ How It Works

**HelbMe** operates through a multi-layered system:

* **SMS Detection**: Scans uploaded screenshots for HELB-specific scam patterns.
* **Sender ID Verification**: Extracted via OCR and checked against a whitelist of legitimate HELB sender IDs.
* **Link verification**: Extracts links embedded in messages which are checked through VirusTotal API.
* **Alerting**: Flags suspicious messages and links in the uploaded message.
* **User education**: Provides contextual guidance on how to respond safely and how to avoid scams.

---

## 📖 Usage

* Install or deploy HelbMe following the Installation instructions outlined previously.
* Users manually upload screenshots.
* Suspicious messages are flagged with clear instructions on what to do next if they are scams.

---

## 🧑‍🤝‍🧑 Contributors

* Bridgette Musango – Project Lead
* Augustine Chironga – Frontend and Middleware Development
* Victor Mwai – Backend Development
* Norah Kimathi – Research & Documentation

---

## 📘 Documentation

For the full documentation about the problem, research, solution idea, and implementation details, visit the [HelbMe Documentation](https://docs.google.com/document/d/1ezQo0OXwnhEI-1s03rovepVqReC-UWWloP1huKE-dA0/edit?tab=t.0).

---
