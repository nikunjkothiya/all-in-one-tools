# All Web Tools Platform

A comprehensive web application providing various utility tools for text, image, PDF, developer, file, media, web, data, and privacy operations.

## System Requirements

### Node.js and npm

- Node.js (version > 18)
- npm (comes with Node.js)

### QPDF Binary Installation

For PDF password protection functionality, QPDF binary must be installed on your system:

#### Windows:

1. Download QPDF installer from the official website: https://qpdf.sourceforge.io/
2. Install QPDF to the default location: `C:\Program Files\qpdf`
3. The binary should be available at: `C:\Program Files\qpdf\bin\qpdf.exe`
4. Add QPDF to system PATH (usually done automatically by installer)

Alternative installation using Chocolatey:

```bash
choco install qpdf
```

#### Linux:

```bash
# Ubuntu/Debian
sudo apt-get install qpdf

# CentOS/RHEL
sudo yum install qpdf

# Fedora
sudo dnf install qpdf
```

#### macOS:

```bash
brew install qpdf
```

### Verifying QPDF Installation

To verify QPDF is installed correctly, run:

```bash
qpdf --version
```

## Features

### Text Tools

- Case Converter
- Text Diff
- Regex Tester
- Lorem Ipsum Generator
- Markdown Preview

### Image Tools

- Resize/Compress
- Format Converter
- Watermark
- EXIF Remover
- Color Picker

### PDF Tools

- Merge/Split
- Add Text/Signatures
- OCR
- Password Protection
- PDF to Word/Excel

### Developer Tools

- JSON Formatter
- Base64 Encoder
- URL Parser
- HTTP Header Analyzer

### File Tools

- File Converter
- Checksum Generator
- MIME Type Identifier

### Media Tools

- Audio Cutter
- Video to GIF
- Thumbnail Generator
- Metadata Editor

### Web Tools

- SEO Analyzer
- Broken Link Checker
- Website Screenshot
- Favicon Generator

### Data Tools

- QR Code Generator
- Barcode Reader
- CSV to JSON
- Data Visualization

### Privacy Tools

- Email Obfuscator
- Password Generator
- Secure File Shredder

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: MongoDB (for storing user data and tool configurations)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with required environment variables
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
QPDF_PATH=C:\\Program Files\\qpdf\\bin\\qpdf.exe  # For Windows
# QPDF_PATH=/usr/bin/qpdf  # For Linux/Mac
```

Note: For the QPDF_PATH:

- Windows: Use double backslashes: `C:\\Program Files\\qpdf\\bin\\qpdf.exe`
- Linux/Mac: Use forward slashes: `/usr/bin/qpdf`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Note

The PDF password protection feature requires QPDF binary to be installed on your system. Make sure to install it before using this functionality. The application will check for QPDF availability and show appropriate error messages if it's not found.

## License

[Your License]
