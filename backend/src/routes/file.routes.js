import express from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';
import config from '../config/env.js';
import { ensureUploadsDir } from "../config/paths.js";
import validateRequest from "../middleware/validateRequest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.maxFileSize,
    }
});

// Ensure uploads directory exists
const uploadsDir = ensureUploadsDir();

// Helper function to save file and return URL
const saveFile = async (buffer, filename) => {
    const filepath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filepath, buffer);
    return `/${config.uploadDir}/${filename}`;
};

const gzip = promisify(zlib.gzip);

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
], validateRequest, async (req, res) => {
    try {
        const { url } = req.body;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.status(200).json({ content: response.data.toString('base64') });
    } catch (error) {
        res.status(200).json({
            content: Buffer.from(error.message).toString('base64')
        });
    }
});

// File compress endpoint — actually compresses using gzip
router.post('/compress', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const timestamp = Date.now();
        const gzFilename = `${timestamp}-compressed-${req.file.originalname}.gz`;

        // Gzip compress the file buffer
        const compressedBuffer = await gzip(req.file.buffer);

        const url = await saveFile(compressedBuffer, gzFilename);

        const originalSize = req.file.buffer.length;
        const compressedSize = compressedBuffer.length;
        const safeBaseSize = Math.max(originalSize, 1);
        const sizeChangeBytes = originalSize - compressedSize;
        const compressionRatio = ((sizeChangeBytes / safeBaseSize) * 100).toFixed(1);
        const sizeChangePercent = ((Math.abs(sizeChangeBytes) / safeBaseSize) * 100).toFixed(1);

        res.json({
            compressed: url,
            originalSize,
            compressedSize,
            compressionRatio: `${compressionRatio}%`,
            sizeChangeBytes,
            sizeChangePercent: `${sizeChangePercent}%`,
            isCompressedSmaller: sizeChangeBytes >= 0,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// File encrypt endpoint — actually encrypts using AES-256-CBC
router.post('/encrypt', upload.single('file'), [
    body('password').notEmpty().withMessage('Password is required'),
], validateRequest, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const { password } = req.body;

        // Derive a 32-byte key from the password using scrypt
        const salt = crypto.randomBytes(16);
        const key = crypto.scryptSync(password, salt, 32);
        const iv = crypto.randomBytes(16);

        // Encrypt the file buffer
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encrypted = Buffer.concat([cipher.update(req.file.buffer), cipher.final()]);

        // Prepend salt (16 bytes) + iv (16 bytes) to the encrypted data for decryption later
        const outputBuffer = Buffer.concat([salt, iv, encrypted]);

        const filename = `${Date.now()}-encrypted-${req.file.originalname}.enc`;
        const url = await saveFile(outputBuffer, filename);
        res.json({ encrypted: url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// File decrypt endpoint
router.post('/decrypt', upload.single('file'), [
    body('password').notEmpty().withMessage('Password is required'),
], validateRequest, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const { password } = req.body;
        const data = req.file.buffer;

        // Extract salt (first 16 bytes) and iv (next 16 bytes)
        const salt = data.subarray(0, 16);
        const iv = data.subarray(16, 32);
        const encryptedData = data.subarray(32);

        // Derive the same key from the password
        const key = crypto.scryptSync(password, salt, 32);

        // Decrypt
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

        // Remove the .enc extension for the output filename
        const originalName = req.file.originalname.replace(/\.enc$/, '');
        const filename = `${Date.now()}-decrypted-${originalName}`;
        const url = await saveFile(decrypted, filename);
        res.json({ decrypted: url });
    } catch (error) {
        res.status(500).json({ error: 'Decryption failed. Wrong password or corrupted file.' });
    }
});

// File convert endpoint
router.post('/convert', upload.single('file'), [
    body('format').isIn(['pdf', 'docx', 'txt']).withMessage('Invalid format'),
], validateRequest, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const { format } = req.body;
        const inputExt = path.extname(req.file.originalname).toLowerCase().replace('.', '');

        // Only support text-based conversions that we can actually do
        if (format === 'txt') {
            // Any file → .txt: just save the raw content
            const filename = `${Date.now()}-converted-${path.parse(req.file.originalname).name}.txt`;
            const url = await saveFile(req.file.buffer, filename);
            return res.json({ converted: url });
        }

        return res.status(400).json({
            error: `Direct conversion from .${inputExt} to .${format} is not supported server-side. For document conversions, consider using the PDF tools or a dedicated converter.`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
