import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { body } from 'express-validator';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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
        fileSize: config.maxImageSize,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
});

// Ensure uploads directory exists
const uploadsDir = ensureUploadsDir();

// Helper function to save image and return URL
const saveImage = async (buffer, format) => {
    const normalizedFormat = format === 'jpg' ? 'jpeg' : format;
    const extension = normalizedFormat === 'jpeg' ? 'jpg' : normalizedFormat;
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filepath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filepath, buffer);
    return `/${config.uploadDir}/${filename}`;
};

const getSafeOutputFormat = (value, fallback = 'jpeg') => {
    const normalizedValue = (value || fallback).toLowerCase();
    if (['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif', 'tiff'].includes(normalizedValue)) {
        return normalizedValue === 'jpg' ? 'jpeg' : normalizedValue;
    }

    return fallback;
};

const escapeXml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const getWatermarkPlacement = (position, width, height, margin, fontSize) => {
    switch (position) {
        case 'top-left':
            return { x: margin, y: margin + fontSize, anchor: 'start' };
        case 'top-right':
            return { x: width - margin, y: margin + fontSize, anchor: 'end' };
        case 'bottom-left':
            return { x: margin, y: height - margin, anchor: 'start' };
        case 'center':
            return { x: width / 2, y: height / 2, anchor: 'middle' };
        case 'bottom-right':
        default:
            return { x: width - margin, y: height - margin, anchor: 'end' };
    }
};

// Resize image endpoint
router.post(
    '/resize',
    upload.single('image'),
    [
        body('width').optional().isInt({ min: 1 }),
        body('height').optional().isInt({ min: 1 }),
        body('fit').optional().isIn(['cover', 'contain', 'fill', 'inside', 'outside']),
    ],
    validateRequest,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }

            const { width, height, fit = 'cover' } = req.body;
            const image = sharp(req.file.buffer);
            const metadata = await image.metadata();
            const outputFormat = getSafeOutputFormat(metadata.format, 'jpeg');

            if (width || height) {
                image.resize(
                    width ? parseInt(width) : undefined,
                    height ? parseInt(height) : undefined,
                    { fit }
                );
            }

            const output = await image.toFormat(outputFormat).toBuffer();
            const url = await saveImage(output, outputFormat);
            res.json({ resized: url });
        } catch (error) {
            console.error('Image resize error:', error);
            res.status(500).json({ error: 'Failed to process image' });
        }
    }
);

// Compress image endpoint
router.post(
    '/compress',
    upload.single('image'),
    [
        body('quality').optional().isInt({ min: 1, max: 100 }),
        body('format').optional().isIn(['jpeg', 'png', 'webp', 'avif']),
    ],
    validateRequest,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }

            const { quality = 80, format = 'jpeg' } = req.body;
            const output = await sharp(req.file.buffer)
                .toFormat(format, { quality: parseInt(quality) })
                .toBuffer();

            const url = await saveImage(output, format);
            res.json({ compressed: url });
        } catch (error) {
            console.error('Image compress error:', error);
            res.status(500).json({ error: 'Failed to process image' });
        }
    }
);

// Convert format endpoint
router.post(
    '/convert',
    upload.single('image'),
    [
        body('format').isIn(['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff']),
    ],
    validateRequest,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }

            const { format } = req.body;
            const output = await sharp(req.file.buffer)
                .toFormat(format)
                .toBuffer();

            const url = await saveImage(output, format);
            res.json({ converted: url });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Add watermark endpoint
router.post(
    '/watermark',
    upload.single('image'),
    [
        body('text').notEmpty().withMessage('Watermark text is required'),
        body('position').optional().isIn(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']),
        body('opacity').optional().isFloat({ min: 0, max: 1 }),
    ],
    validateRequest,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }

            const { text, position = 'bottom-right', opacity = 0.5 } = req.body;
            const image = sharp(req.file.buffer);
            const metadata = await image.metadata();
            const outputFormat = getSafeOutputFormat(metadata.format, 'jpeg');
            
            // Calculate proportional font size (5% of width with sensible bounds)
            const fontSize = Math.max(20, Math.floor(metadata.width * 0.05));
            const margin = Math.max(16, Math.floor(metadata.width * 0.03));
            const placement = getWatermarkPlacement(position, metadata.width, metadata.height, margin, fontSize);
            
            const svg = `
                <svg width="${metadata.width}" height="${metadata.height}">
                    <style>
                        .shadow { fill: rgba(0, 0, 0, ${Math.min(opacity + 0.18, 0.85)}); font-size: ${fontSize}px; font-weight: 700; font-family: Arial, Helvetica, sans-serif; }
                        .title { fill: rgba(255, 255, 255, ${opacity}); font-size: ${fontSize}px; font-weight: 700; font-family: Arial, Helvetica, sans-serif; }
                    </style>
                    <text x="${placement.x + 2}" y="${placement.y + 2}" text-anchor="${placement.anchor}" class="shadow">${escapeXml(text)}</text>
                    <text x="${placement.x}" y="${placement.y}" text-anchor="${placement.anchor}" class="title">${escapeXml(text)}</text>
                </svg>
            `;

            const output = await image
                .composite([
                    {
                        input: Buffer.from(svg),
                        top: 0,
                        left: 0,
                    },
                ])
                .toFormat(outputFormat)
                .toBuffer();

            const url = await saveImage(output, outputFormat);
            res.json({ watermarked: url });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Remove EXIF data endpoint
router.post('/remove-exif', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const metadata = await sharp(req.file.buffer).metadata();
        const outputFormat = getSafeOutputFormat(metadata.format, 'jpeg');
        const output = await sharp(req.file.buffer)
            .toFormat(outputFormat)
            .toBuffer();

        const url = await saveImage(output, outputFormat);
        res.json({ cleaned: url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 
