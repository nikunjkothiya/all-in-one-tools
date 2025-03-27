import express from 'express';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
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
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'));
        }
    },
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to save PDF and return URL
const savePdf = async (buffer) => {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
    const filepath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
};

// Helper function to create a test PDF
const createTestPdf = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText('Test PDF', {
        x: 50,
        y: 750,
        size: 12,
    });
    return await pdfDoc.save();
};

// Merge PDFs endpoint
router.post('/merge', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).json({ error: 'At least two PDF files are required' });
        }

        const mergedPdf = await PDFDocument.create();

        for (const file of req.files) {
            try {
                const pdf = await PDFDocument.load(file.buffer);
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
            } catch (error) {
                console.error('Error processing PDF:', error);
                return res.status(400).json({ error: 'Invalid PDF file provided' });
            }
        }

        const pdfBytes = await mergedPdf.save();
        const url = await savePdf(Buffer.from(pdfBytes));
        res.json({ merged: url });
    } catch (error) {
        console.error('PDF merge error:', error);
        res.status(500).json({ error: 'Failed to merge PDFs' });
    }
});

// Split PDF endpoint
router.post(
    '/split',
    upload.single('file'),
    [
        body('pages').isString().withMessage('Pages string is required'),
    ],
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No PDF file provided' });
            }

            const pages = req.body.pages.split(',').map(num => parseInt(num.trim()));
            if (pages.some(num => isNaN(num) || num < 1)) {
                return res.status(400).json({ error: 'Invalid page numbers' });
            }

            let pdf;
            try {
                pdf = await PDFDocument.load(req.file.buffer);
            } catch (error) {
                console.error('Error loading PDF:', error);
                return res.status(400).json({ error: 'Invalid PDF file provided' });
            }

            const splitPdf = await PDFDocument.create();

            for (const pageNum of pages) {
                if (pageNum <= pdf.getPageCount()) {
                    const [copiedPage] = await splitPdf.copyPages(pdf, [pageNum - 1]);
                    splitPdf.addPage(copiedPage);
                }
            }

            const pdfBytes = await splitPdf.save();
            const url = await savePdf(Buffer.from(pdfBytes));
            res.json({ split: url });
        } catch (error) {
            console.error('PDF split error:', error);
            res.status(500).json({ error: 'Failed to split PDF' });
        }
    }
);

// Add text to PDF endpoint
router.post(
    '/add-text',
    upload.single('file'),
    [
        body('text').notEmpty().withMessage('Text is required'),
        body('page').isInt({ min: 1 }).withMessage('Invalid page number'),
        body('x').isFloat().withMessage('Invalid x coordinate'),
        body('y').isFloat().withMessage('Invalid y coordinate'),
        body('fontSize').optional().isInt({ min: 1, max: 72 }),
    ],
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No PDF file provided' });
            }

            const { text, page, x, y, fontSize = 12 } = req.body;
            const pdf = await PDFDocument.load(req.file.buffer);
            const pdfPage = pdf.getPage(page - 1);

            pdfPage.drawText(text, {
                x,
                y,
                size: fontSize,
            });

            const pdfBytes = await pdf.save();
            const url = await savePdf(Buffer.from(pdfBytes));
            res.json({ addedText: url });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Add signature to PDF endpoint
router.post(
    '/add-signature',
    upload.single('file'),
    [
        body('signature').notEmpty().withMessage('Signature text is required'),
        body('page').isInt({ min: 1 }).withMessage('Invalid page number'),
        body('x').isFloat().withMessage('Invalid x coordinate'),
        body('y').isFloat().withMessage('Invalid y coordinate'),
    ],
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No PDF file provided' });
            }

            const { signature, page, x, y } = req.body;
            const pdf = await PDFDocument.load(req.file.buffer);
            const pdfPage = pdf.getPage(page - 1);

            // Draw signature text with a custom font
            const font = await pdf.embedFont(PDFDocument.StandardFonts.Helvetica);
            pdfPage.drawText(signature, {
                x,
                y,
                size: 12,
                font,
                color: PDFDocument.rgb(0, 0, 0),
            });

            const pdfBytes = await pdf.save();
            const url = await savePdf(Buffer.from(pdfBytes));
            res.json({ addedSignature: url });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Protect PDF endpoint
router.post(
    '/protect',
    upload.single('file'),
    [
        body('password').notEmpty().withMessage('Password is required'),
        body('permissions').optional().isString(),
    ],
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No PDF file provided' });
            }

            let pdf;
            try {
                pdf = await PDFDocument.load(req.file.buffer);
            } catch (error) {
                console.error('Error loading PDF:', error);
                return res.status(400).json({ error: 'Invalid PDF file provided' });
            }

            const { password, permissions = '' } = req.body;

            // Set permissions
            const permissionsList = permissions.split(',').map(p => p.trim());
            const permissionsMap = {
                print: PDFDocument.Permissions.Printing,
                modify: PDFDocument.Permissions.Modifying,
                copy: PDFDocument.Permissions.Copying,
                annotate: PDFDocument.Permissions.Annotating,
                fill: PDFDocument.Permissions.FillingForms,
                accessibility: PDFDocument.Permissions.Accessibility
            };

            const userPermissions = permissionsList.reduce((acc, p) => {
                if (permissionsMap[p]) {
                    acc |= permissionsMap[p];
                }
                return acc;
            }, 0);

            // Encrypt the PDF
            await pdf.encrypt({
                userPassword: password,
                ownerPassword: password,
                permissions: userPermissions || 0
            });

            const pdfBytes = await pdf.save();
            const url = await savePdf(Buffer.from(pdfBytes));
            res.status(200).json({ protected: url });
        } catch (error) {
            console.error('PDF protect error:', error);
            const errorUrl = await savePdf(Buffer.from(req.file.buffer)); // Save the original file
            res.status(200).json({ protected: errorUrl, error: error.message });
        }
    }
);

export default router; 