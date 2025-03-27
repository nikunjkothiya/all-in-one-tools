import express from 'express';
import { body } from 'express-validator';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// URL shortener endpoint
router.post(
    '/shorten',
    [
        body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')
    ],
    async (req, res) => {
        try {
            const { url } = req.body;
            // Using TinyURL API for URL shortening
            const response = await axios.get(`http://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            res.json({ shortened: response.data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// Website screenshot endpoint
router.post(
    '/screenshot',
    [
        body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL'),
        body('width').optional().isInt({ min: 320, max: 1920 }).withMessage('Invalid width'),
        body('height').optional().isInt({ min: 240, max: 1080 }).withMessage('Invalid height')
    ],
    async (req, res) => {
        try {
            const { url, width = 1920, height = 1080 } = req.body;

            // Validate URL format
            try {
                new URL(url);
            } catch (error) {
                return res.status(400).json({ error: 'Invalid URL format' });
            }

            // Using Screenshot API (you'll need to sign up for a service like Screenshot API)
            const screenshotUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&width=${width}&height=${height}`;
            res.json({ screenshot: screenshotUrl });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// Website analyzer endpoint
router.post(
    '/analyze',
    [
        body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')
    ],
    async (req, res) => {
        try {
            const { url } = req.body;
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const analysis = {
                title: $('title').text() || '',
                description: $('meta[name="description"]').attr('content') || '',
                keywords: $('meta[name="keywords"]').attr('content') || '',
                links: $('a').length,
                images: $('img').length,
                headings: {
                    h1: $('h1').length,
                    h2: $('h2').length,
                    h3: $('h3').length
                },
                responseTime: response.headers['x-response-time'] || '0ms',
                statusCode: response.status
            };

            res.json({ analysis });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// Website metadata scraper endpoint
router.post(
    '/scrape-metadata',
    [
        body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')
    ],
    async (req, res) => {
        try {
            const { url } = req.body;
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const metadata = {
                title: $('title').text(),
                description: $('meta[name="description"]').attr('content'),
                keywords: $('meta[name="keywords"]').attr('content'),
                ogTitle: $('meta[property="og:title"]').attr('content'),
                ogDescription: $('meta[property="og:description"]').attr('content'),
                ogImage: $('meta[property="og:image"]').attr('content'),
                twitterCard: $('meta[name="twitter:card"]').attr('content'),
                twitterTitle: $('meta[name="twitter:title"]').attr('content'),
                twitterDescription: $('meta[name="twitter:description"]').attr('content'),
                twitterImage: $('meta[name="twitter:image"]').attr('content'),
                favicon: $('link[rel="icon"]').attr('href'),
                canonicalUrl: $('link[rel="canonical"]').attr('href'),
                robots: $('meta[name="robots"]').attr('content'),
                language: $('html').attr('lang'),
                charset: $('meta[charset]').attr('charset')
            };

            res.json(metadata);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Website performance analyzer endpoint
router.post(
    '/analyze-performance',
    [
        body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')
    ],
    async (req, res) => {
        try {
            const { url } = req.body;
            const startTime = Date.now();
            const response = await axios.get(url);
            const endTime = Date.now();

            const performance = {
                responseTime: endTime - startTime,
                statusCode: response.status,
                headers: response.headers,
                contentLength: response.headers['content-length'],
                contentType: response.headers['content-type']
            };

            res.json(performance);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Website SSL certificate checker endpoint
router.post(
    '/check-ssl',
    [
        body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')
    ],
    async (req, res) => {
        try {
            const { url } = req.body;
            const response = await axios.get(url, {
                httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false
                })
            });

            const cert = response.request.res.socket.getPeerCertificate();
            const sslInfo = {
                subject: cert.subject,
                issuer: cert.issuer,
                validFrom: cert.valid_from,
                validTo: cert.valid_to,
                protocol: response.request.res.socket.getProtocol(),
                cipher: response.request.res.socket.getCipher(),
                isSecure: response.request.res.socket.encrypted
            };

            res.json(sslInfo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Website robots.txt parser endpoint
router.post(
    '/parse-robots',
    [
        body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')
    ],
    async (req, res) => {
        try {
            const { url } = req.body;
            const baseUrl = new URL(url).origin;
            const response = await axios.get(`${baseUrl}/robots.txt`);

            const robotsContent = response.data;
            const rules = robotsContent.split('\n').reduce((acc, line) => {
                const [directive, value] = line.split(':').map(s => s.trim());
                if (directive && value) {
                    if (!acc[directive]) {
                        acc[directive] = [];
                    }
                    acc[directive].push(value);
                }
                return acc;
            }, {});

            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

export default router; 