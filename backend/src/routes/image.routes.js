import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { body } from 'express-validator';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
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
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to save image and return URL
const saveImage = async (buffer, format) => {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${format}`;
    const filepath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
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
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }

            const { width, height, fit = 'cover' } = req.body;
            const image = sharp(req.file.buffer);

            if (width || height) {
                image.resize(
                    width ? parseInt(width) : undefined,
                    height ? parseInt(height) : undefined,
                    { fit }
                );
            }

            const output = await image.toBuffer();
            const url = await saveImage(output, 'jpg');
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
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }

            const { text, position = 'bottom-right', opacity = 0.5 } = req.body;
            const image = sharp(req.file.buffer);

            // Create watermark SVG
            const svg = `
                <svg width="100%" height="100%">
                    <style>
                        .title { fill: white; font-size: 24px; font-weight: bold; }
                    </style>
                    <text x="50%" y="50%" text-anchor="middle" class="title" opacity="${opacity}">${text}</text>
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
                .toBuffer();

            res.set('Content-Type', 'image/jpeg');
            res.send(output);
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

        const output = await sharp(req.file.buffer)
            .withMetadata(false)
            .toBuffer();

        res.set('Content-Type', 'image/jpeg');
        res.send(output);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 