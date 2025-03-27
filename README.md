# All-in-One Tools Platform

A comprehensive web application providing various utility tools for text, image, PDF, developer, file, media, web, data, and privacy operations.

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
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 