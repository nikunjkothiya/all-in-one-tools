import express from 'express';
import { body } from 'express-validator';

const router = express.Router();

// Format code endpoint
router.post(
    '/format',
    [
        body('code').notEmpty().withMessage('Code is required'),
        body('format').isIn(['json', 'html']).withMessage('Invalid format type'),
    ],
    (req, res) => {
        try {
            const { code, format } = req.body;

            if (format === 'json') {
                const parsed = JSON.parse(code);
                const formatted = JSON.stringify(parsed, null, 2);
                res.json({ formatted });
            } else if (format === 'html') {
                // Simple HTML formatting (in a real implementation, you would use a proper HTML formatter)
                const formatted = code.replace(/></g, '>\n<').replace(/<([^>]+)>/g, '  <$1>');
                res.json({ formatted });
            }
        } catch (error) {
            res.status(400).json({ error: 'Invalid code format' });
        }
    }
);

// Minify code endpoint
router.post(
    '/minify',
    [
        body('code').notEmpty().withMessage('Code is required'),
        body('format').isIn(['json', 'html']).withMessage('Invalid format type'),
    ],
    (req, res) => {
        try {
            const { code, format } = req.body;

            if (format === 'json') {
                const parsed = JSON.parse(code);
                const minified = JSON.stringify(parsed);
                res.json({ minified });
            } else if (format === 'html') {
                // Simple HTML minification (in a real implementation, you would use a proper HTML minifier)
                const minified = code.replace(/\s+/g, ' ').trim();
                res.json({ minified });
            }
        } catch (error) {
            res.status(400).json({ error: 'Invalid code format' });
        }
    }
);

// Validate code endpoint
router.post(
    '/validate',
    [
        body('code').notEmpty().withMessage('Code is required'),
        body('format').isIn(['json', 'html']).withMessage('Invalid format type'),
    ],
    (req, res) => {
        try {
            const { code, format } = req.body;

            if (format === 'json') {
                JSON.parse(code);
                res.json({ valid: true });
            } else if (format === 'html') {
                // Simple HTML validation (in a real implementation, you would use a proper HTML validator)
                const hasOpeningAndClosingTags = /<[^>]+>.*<\/[^>]+>/.test(code);
                res.json({ valid: hasOpeningAndClosingTags });
            }
        } catch (error) {
            res.status(400).json({ valid: false, error: 'Invalid code format' });
        }
    }
);

// Base64 encoder endpoint
router.post(
    '/encode-base64',
    [body('text').notEmpty().withMessage('Text is required')],
    (req, res) => {
        try {
            const { text } = req.body;
            const encoded = Buffer.from(text).toString('base64');
            res.json({ encoded });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Base64 decoder endpoint
router.post(
    '/decode-base64',
    [body('text').notEmpty().withMessage('Base64 string is required')],
    (req, res) => {
        try {
            const { text } = req.body;
            const decoded = Buffer.from(text, 'base64').toString('utf-8');
            res.json({ decoded });
        } catch (error) {
            res.status(400).json({ error: 'Invalid Base64 string' });
        }
    }
);

// URL parser endpoint
router.post(
    '/parse-url',
    [body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')],
    (req, res) => {
        try {
            const { url } = req.body;
            const parsedUrl = new URL(url);
            res.json({
                protocol: parsedUrl.protocol,
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                pathname: parsedUrl.pathname,
                search: parsedUrl.search,
                hash: parsedUrl.hash,
                username: parsedUrl.username,
                password: parsedUrl.password,
                origin: parsedUrl.origin,
                searchParams: Object.fromEntries(parsedUrl.searchParams),
            });
        } catch (error) {
            res.status(400).json({ error: 'Invalid URL' });
        }
    }
);

// HTTP header analyzer endpoint
router.post(
    '/analyze-headers',
    [body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')],
    async (req, res) => {
        try {
            const { url } = req.body;
            const response = await fetch(url);
            const headers = Object.fromEntries(response.headers.entries());

            // Analyze security headers
            const securityHeaders = {
                'Content-Security-Policy': headers['content-security-policy'],
                'X-Frame-Options': headers['x-frame-options'],
                'X-Content-Type-Options': headers['x-content-type-options'],
                'Strict-Transport-Security': headers['strict-transport-security'],
                'X-XSS-Protection': headers['x-xss-protection'],
            };

            // Analyze caching headers
            const cachingHeaders = {
                'Cache-Control': headers['cache-control'],
                'ETag': headers['etag'],
                'Last-Modified': headers['last-modified'],
            };

            res.json({
                securityHeaders,
                cachingHeaders,
                allHeaders: headers,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

export default router; 