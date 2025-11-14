#!/bin/bash
set -o errexit

echo "Starting build process..."

# Install system dependencies (Tesseract OCR)
echo "Installing system dependencies..."
apt-get update
apt-get install -y tesseract-ocr

# Verify Tesseract installation
echo "Verifying Tesseract installation..."
tesseract --version

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build completed successfully!"