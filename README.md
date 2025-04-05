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

### FFmpeg Installation

For media processing functionality (video/audio conversion, compression, trimming), FFmpeg must be installed on your system:

#### Windows:

1. Download FFmpeg from the official website: https://ffmpeg.org/download.html
2. Extract the downloaded zip file to a location on your computer (e.g., `C:\Program Files\ffmpeg\`)
3. Add FFmpeg to system PATH:
   - Open Windows Settings
   - Search for "Environment Variables"
   - Click "Edit the system environment variables"
   - Click "Environment Variables"
   - Under "System Variables", find and select "Path"
   - Click "Edit"
   - Click "New"
   - Add the path to the FFmpeg bin directory (e.g., `C:\Program Files\ffmpeg\bin`)
   - Click "OK" on all windows
4. Restart your computer or open a new command prompt

Alternative installation using Chocolatey:

```bash
choco install ffmpeg
```

Alternative installation using Scoop:

```bash
scoop install ffmpeg
```

#### Linux:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install epel-release
sudo yum install ffmpeg

# Fedora
sudo dnf install ffmpeg
```

#### macOS:

```bash
brew install ffmpeg
```

### Verifying FFmpeg Installation

To verify FFmpeg is installed correctly, run:

```bash
ffmpeg -version
```

Note: All processed media files (converted, compressed, trimmed, etc.) will be automatically deleted from the server after 2 hours. Make sure to download your processed files immediately after processing.

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

The media processing features (video/audio conversion, compression, trimming) require FFmpeg to be installed on your system. Make sure to install FFmpeg before using these functionalities. The application will check for FFmpeg availability and show appropriate error messages if it's not found. All processed media files will be automatically deleted from the server after 2 hours, so make sure to download your processed files immediately after processing.

## License

NIKUNJ KOTHIYA
