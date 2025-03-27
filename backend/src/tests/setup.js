import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupTestAssets() {
    // Create test assets directory
    const testAssetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(testAssetsDir)) {
        fs.mkdirSync(testAssetsDir, { recursive: true });
    }

    // Create subdirectories
    const dirs = ['text', 'images', 'videos', 'pdfs'];
    dirs.forEach(dir => {
        const dirPath = path.join(testAssetsDir, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });

    // Create test text file
    const testTextPath = path.join(testAssetsDir, 'text', 'test.txt');
    if (!fs.existsSync(testTextPath)) {
        fs.writeFileSync(testTextPath, 'Hello World');
    }

    // Create test image
    const testImagePath = path.join(testAssetsDir, 'images', 'test.jpg');
    if (!fs.existsSync(testImagePath)) {
        const imageBuffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 1 }
            }
        })
            .jpeg()
            .toBuffer();
        fs.writeFileSync(testImagePath, imageBuffer);
    }

    // Create test PDF
    const testPdfPath = path.join(testAssetsDir, 'pdfs', 'test.pdf');
    if (!fs.existsSync(testPdfPath)) {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        page.drawText('Test PDF', {
            x: 50,
            y: 750,
            size: 12,
        });
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(testPdfPath, pdfBytes);
    }

    // Create test video
    const testVideoPath = path.join(testAssetsDir, 'videos', 'test.mp4');
    if (!fs.existsSync(testVideoPath)) {
        // Create a simple video file using ffmpeg
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input('color=black:s=640x480:r=1')
                .inputOptions(['-f', 'lavfi'])
                .outputOptions([
                    '-vf', 'drawtext=text=Test:fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2',
                    '-t', '1',
                    '-c:v', 'libx264',
                    '-preset', 'ultrafast'
                ])
                .save(testVideoPath)
                .on('end', resolve)
                .on('error', reject);
        });
    }

    console.log('Test assets created successfully');
}

// Run the setup
setupTestAssets().catch(console.error); 