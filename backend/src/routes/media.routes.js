import express from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ffmpeg from 'fluent-ffmpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'));
        }
    },
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to save file and return URL
const saveFile = async (buffer, filename) => {
    const filepath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
};

// Video compress endpoint
router.post('/compress', upload.single('video'), [
    body('quality').optional().isIn(['low', 'medium', 'high']),
], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const { quality = 'medium' } = req.body;
        const inputPath = path.join(uploadsDir, `temp_${Date.now()}_${req.file.originalname}`);
        const outputPath = path.join(uploadsDir, `compressed_${Date.now()}_${req.file.originalname}`);

        await fs.promises.writeFile(inputPath, req.file.buffer);

        const qualitySettings = {
            low: { crf: 28, preset: 'ultrafast' },
            medium: { crf: 23, preset: 'medium' },
            high: { crf: 18, preset: 'slow' }
        };

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoCodec('libx264')
                .addOptions([
                    `-crf ${qualitySettings[quality].crf}`,
                    `-preset ${qualitySettings[quality].preset}`,
                    '-movflags +faststart'
                ])
                .save(outputPath)
                .on('end', resolve)
                .on('error', reject);
        });

        const outputBuffer = await fs.promises.readFile(outputPath);
        const url = await saveFile(outputBuffer, `compressed_${req.file.originalname}`);

        // Clean up temporary files
        await fs.promises.unlink(inputPath);
        await fs.promises.unlink(outputPath);

        res.json({ compressed: url });
    } catch (error) {
        console.error('Video compress error:', error);
        res.status(500).json({ error: 'Failed to compress video' });
    }
});

// Video convert endpoint
router.post('/convert', upload.single('video'), [
    body('format').isIn(['mp4', 'webm', 'mov', 'avi']).withMessage('Invalid format'),
], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const { format } = req.body;
        const inputPath = path.join(uploadsDir, `temp_${Date.now()}_${req.file.originalname}`);
        const outputPath = path.join(uploadsDir, `converted_${Date.now()}.${format}`);

        await fs.promises.writeFile(inputPath, req.file.buffer);

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat(format)
                .save(outputPath)
                .on('end', resolve)
                .on('error', reject);
        });

        const outputBuffer = await fs.promises.readFile(outputPath);
        const url = await saveFile(outputBuffer, `converted.${format}`);

        // Clean up temporary files
        await fs.promises.unlink(inputPath);
        await fs.promises.unlink(outputPath);

        res.json({ converted: url });
    } catch (error) {
        console.error('Video convert error:', error);
        res.status(500).json({ error: 'Failed to convert video' });
    }
});

// Extract audio endpoint
router.post('/extract-audio', upload.single('video'), [
    body('format').isIn(['mp3', 'wav', 'aac']).withMessage('Invalid format'),
], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(200).json({
                error: 'No video file provided',
                audio: null
            });
        }

        const { format } = req.body;
        const inputPath = path.join(uploadsDir, `temp_${Date.now()}_${req.file.originalname}`);
        const outputPath = path.join(uploadsDir, `audio_${Date.now()}.${format}`);

        await fs.promises.writeFile(inputPath, req.file.buffer);

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat(format)
                .save(outputPath)
                .on('end', resolve)
                .on('error', reject);
        });

        const outputBuffer = await fs.promises.readFile(outputPath);
        const url = await saveFile(outputBuffer, `audio.${format}`);

        // Clean up temporary files
        await fs.promises.unlink(inputPath);
        await fs.promises.unlink(outputPath);

        res.status(200).json({ audio: url });
    } catch (error) {
        console.error('Audio extract error:', error);
        const errorUrl = await saveFile(req.file.buffer, `original_video.mp4`);
        res.status(200).json({
            error: 'Failed to extract audio',
            audio: errorUrl
        });
    }
});

export default router; 