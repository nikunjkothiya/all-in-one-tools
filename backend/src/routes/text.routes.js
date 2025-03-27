import express from 'express';
import { body } from 'express-validator';

const router = express.Router();

// Case converter endpoint
router.post(
    '/case',
    [
        body('text').notEmpty().withMessage('Text is required'),
        body('case')
            .isIn(['upper', 'lower'])
            .withMessage('Invalid case type'),
    ],
    (req, res) => {
        const { text, case: caseType } = req.body;
        let result = text;

        switch (caseType) {
            case 'upper':
                result = text.toUpperCase();
                break;
            case 'lower':
                result = text.toLowerCase();
                break;
        }

        res.json({ converted: result });
    }
);

// Text diff endpoint
router.post(
    '/diff',
    [
        body('text1').notEmpty().withMessage('First text is required'),
        body('text2').notEmpty().withMessage('Second text is required'),
    ],
    (req, res) => {
        const { text1, text2 } = req.body;
        const differences = [];

        // Simple diff implementation
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');

        for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
            if (i >= lines1.length) {
                differences.push({ type: 'add', line: lines2[i] });
                continue;
            }
            if (i >= lines2.length) {
                differences.push({ type: 'remove', line: lines1[i] });
                continue;
            }
            if (lines1[i] !== lines2[i]) {
                differences.push({ type: 'change', oldLine: lines1[i], newLine: lines2[i] });
            }
        }

        res.json({ differences });
    }
);

// Text encode/decode endpoint
router.post(
    '/encode',
    [
        body('text').notEmpty().withMessage('Text is required'),
        body('encoding').isIn(['base64']).withMessage('Invalid encoding type'),
        body('decode').optional().isBoolean().withMessage('Invalid decode parameter'),
    ],
    (req, res) => {
        const { text, encoding, decode } = req.body;

        if (encoding === 'base64') {
            if (decode) {
                try {
                    const decoded = Buffer.from(text, 'base64').toString('utf8');
                    res.json({ decoded });
                } catch (error) {
                    res.status(400).json({ error: 'Invalid base64 string' });
                }
            } else {
                const encoded = Buffer.from(text).toString('base64');
                res.json({ encoded });
            }
        } else {
            res.status(400).json({ error: 'Unsupported encoding type' });
        }
    }
);

// Regex tester endpoint
router.post(
    '/regex',
    [
        body('text').notEmpty().withMessage('Text is required'),
        body('pattern').notEmpty().withMessage('Pattern is required'),
    ],
    (req, res) => {
        const { text, pattern } = req.body;
        let matches = [];
        let error = null;

        try {
            const regex = new RegExp(pattern);
            matches = text.match(regex) || [];
        } catch (err) {
            error = err.message;
        }

        res.json({ matches, error });
    }
);

// Lorem ipsum generator endpoint
router.get('/lorem-ipsum', (req, res) => {
    const paragraphs = parseInt(req.query.paragraphs) || 1;
    const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

    const result = Array(paragraphs)
        .fill()
        .map(() => loremIpsum)
        .join('\n\n');

    res.json({ result });
});

// Markdown preview endpoint
router.post(
    '/markdown',
    [body('markdown').notEmpty().withMessage('Markdown text is required')],
    (req, res) => {
        const { markdown } = req.body;
        // In a real implementation, you would use a markdown parser here
        // For now, we'll just return the markdown as is
        res.json({ html: markdown });
    }
);

export default router; 