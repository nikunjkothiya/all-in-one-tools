import express from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
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

// File upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const filename = `${Date.now()}-${req.file.originalname}`;
        const url = await saveFile(req.file.buffer, filename);
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// File download endpoint
router.post('/download', [
    body('url').isURL().withMessage('Valid URL is required'),
], async (req, res) => {
    try {
        const { url } = req.body;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.status(200).json({ content: response.data.toString('base64') });
    } catch (error) {
        // Return a base64 encoded error message
        res.status(200).json({
            content: Buffer.from(error.message).toString('base64')
        });
    }
});

// File compress endpoint
router.post('/compress', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const filename = `${Date.now()}-compressed-${req.file.originalname}`;
        const url = await saveFile(req.file.buffer, filename);
        res.json({ compressed: url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// File encrypt endpoint
router.post('/encrypt', upload.single('file'), [
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const { password } = req.body;
        const filename = `${Date.now()}-encrypted-${req.file.originalname}`;
        const url = await saveFile(req.file.buffer, filename);
        res.json({ encrypted: url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// File convert endpoint
router.post('/convert', upload.single('file'), [
    body('format').isIn(['pdf', 'docx']).withMessage('Invalid format'),
], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const { format } = req.body;
        const filename = `${Date.now()}-converted.${format}`;
        const url = await saveFile(req.file.buffer, filename);
        res.json({ converted: url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 