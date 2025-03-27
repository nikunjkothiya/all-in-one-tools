import express from 'express';
import { body } from 'express-validator';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { URL } from 'url';
import path from 'path';
import fs from 'fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

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
        body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')
    ],
    async (req, res) => {
        let browser;
        try {
            const { url } = req.body;

            // Validate URL format
            try {
                new URL(url);
            } catch (error) {
                return res.status(400).json({ error: 'Invalid URL format' });
            }

            // Launch puppeteer with additional options for better rendering
            browser = await puppeteer.launch({
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1920,1080',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--ignore-certificate-errors'
                ],
                headless: 'new',
                defaultViewport: {
                    width: 1920,
                    height: 1080
                },
                timeout: 60000
            });

            const page = await browser.newPage();

            // Set a more realistic user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

            // Set default navigation timeout
            await page.setDefaultNavigationTimeout(30000);

            // Enable request interception to handle potential redirects and errors
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                // Only abort media and other non-essential requests
                if (['media', 'websocket', 'other'].includes(request.resourceType())) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            // First try: Navigate with just domcontentloaded
            let navigationSuccessful = false;
            try {
                await page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 15000
                });
                navigationSuccessful = true;
            } catch (error) {
                console.error('First navigation attempt failed:', error);
            }

            // If first attempt failed, try with minimal settings
            if (!navigationSuccessful) {
                try {
                    await page.goto(url, {
                        waitUntil: 'load',
                        timeout: 10000
                    });
                } catch (error) {
                    console.error('Second navigation attempt failed:', error);
                    // Continue anyway - we might still be able to get a screenshot
                }
            }

            // Wait for any dynamic content
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Try to ensure main content is loaded
                await page.evaluate(() => {
                    return new Promise((resolve) => {
                        if (document.readyState === 'complete') {
                            resolve();
                        } else {
                            window.addEventListener('load', resolve);
                            setTimeout(resolve, 3000); // Fallback timeout
                        }
                    });
                });
            } catch (error) {
                console.error('Content wait error:', error);
                // Continue anyway
            }

            // Take screenshot with better error handling
            let screenshotBuffer;
            try {
                // Set viewport size
                await page.setViewport({
                    width: 1280,
                    height: 800,
                    deviceScaleFactor: 1,
                });

                // Wait for any dynamic content and scrolling
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Get page dimensions
                const dimensions = await page.evaluate(() => {
                    return {
                        height: Math.max(
                            document.body.scrollHeight,
                            document.documentElement.scrollHeight,
                            document.body.offsetHeight,
                            document.documentElement.offsetHeight,
                            document.body.clientHeight,
                            document.documentElement.clientHeight
                        ),
                        width: Math.max(
                            document.body.scrollWidth,
                            document.documentElement.scrollWidth,
                            document.body.offsetWidth,
                            document.documentElement.offsetWidth,
                            document.body.clientWidth,
                            document.documentElement.clientWidth
                        )
                    };
                });

                // Update viewport to match full page size
                await page.setViewport({
                    width: dimensions.width,
                    height: dimensions.height,
                    deviceScaleFactor: 1,
                });

                // Take full page screenshot
                screenshotBuffer = await page.screenshot({
                    type: 'jpeg',
                    quality: 80,
                    fullPage: true,  // Enable full page screenshot
                    encoding: 'base64'  // Direct base64 encoding
                });

                // Get website domain for filename
                const domain = new URL(url).hostname;
                const timestamp = new Date().toISOString().split('T')[0];
                const filename = `screenshot-${domain}-${timestamp}-full.jpg`;

                // Create data URL directly
                const dataUrl = `data:image/jpeg;base64,${screenshotBuffer}`;

                await browser.close();
                browser = null;

                // Send response
                res.json({
                    success: true,
                    screenshot: dataUrl,
                    filename: filename,
                    contentType: 'image/jpeg',
                    dimensions: dimensions
                });

            } catch (screenshotError) {
                console.error('Screenshot error:', screenshotError);
                throw new Error(`Failed to capture screenshot: ${screenshotError.message}`);
            }

        } catch (error) {
            console.error('Screenshot error:', error);
            res.status(500).json({
                success: false,
                error: `Failed to capture screenshot: ${error.message}. Please check if the URL is accessible and try again.`
            });
        } finally {
            if (browser) {
                try {
                    await browser.close();
                } catch (err) {
                    console.error('Error closing browser:', err);
                }
            }
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

// SEO analysis endpoint using Lighthouse
router.post(
    '/seo',
    [
        body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')
    ],
    async (req, res) => {
        let chrome;
        try {
            const { url } = req.body;

            // Launch Chrome
            chrome = await chromeLauncher.launch({
                chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
            });

            console.log('Chrome launched');

            // Run Lighthouse
            const runnerResult = await lighthouse(url, {
                port: chrome.port,
                output: 'json',
                onlyCategories: ['seo', 'accessibility', 'best-practices', 'performance'],
                quiet: true
            });

            const reportJson = runnerResult.report;
            const report = JSON.parse(reportJson);

            // Extract relevant information
            const result = {
                scores: {
                    seo: Math.round(report.categories.seo.score * 100),
                    performance: Math.round(report.categories.performance.score * 100),
                    accessibility: Math.round(report.categories.accessibility.score * 100),
                    bestPractices: Math.round(report.categories['best-practices'].score * 100)
                },
                audits: {
                    seo: report.categories.seo.auditRefs.map(ref => ({
                        id: ref.id,
                        ...report.audits[ref.id],
                        weight: ref.weight
                    })).filter(audit => audit.score !== null),
                    performance: report.categories.performance.auditRefs.map(ref => ({
                        id: ref.id,
                        ...report.audits[ref.id],
                        weight: ref.weight
                    })).filter(audit => audit.score !== null),
                    accessibility: report.categories.accessibility.auditRefs.map(ref => ({
                        id: ref.id,
                        ...report.audits[ref.id],
                        weight: ref.weight
                    })).filter(audit => audit.score !== null),
                    bestPractices: report.categories['best-practices'].auditRefs.map(ref => ({
                        id: ref.id,
                        ...report.audits[ref.id],
                        weight: ref.weight
                    })).filter(audit => audit.score !== null)
                },
                metadata: {
                    fetchTime: report.fetchTime,
                    userAgent: report.userAgent,
                    environment: report.environment
                }
            };

            res.json(result);
        } catch (error) {
            console.error('Lighthouse error:', error);
            res.status(500).json({ error: error.message || 'Failed to analyze website' });
        } finally {
            if (chrome) {
                await chrome.kill();
            }
        }
    }
);

// Link checker endpoint
router.post(
    '/check-links',
    [
        body('url').notEmpty().withMessage('URL is required').isURL().withMessage('Invalid URL')
    ],
    async (req, res) => {
        try {
            const { url } = req.body;
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const baseUrl = new URL(url).origin;

            const links = [];
            const checked = new Set();

            $('a[href]').each((_, element) => {
                const href = $(element).attr('href');
                if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

                let absoluteUrl;
                try {
                    absoluteUrl = new URL(href, baseUrl).href;
                    if (checked.has(absoluteUrl)) return;
                    checked.add(absoluteUrl);

                    links.push({
                        url: absoluteUrl,
                        text: $(element).text().trim() || '[No Text]',
                        type: absoluteUrl.startsWith(baseUrl) ? 'internal' : 'external'
                    });
                } catch (e) {
                    // Skip invalid URLs
                }
            });

            // Check first 10 links status
            const checkedLinks = await Promise.all(
                links.slice(0, 10).map(async (link) => {
                    try {
                        const response = await axios.head(link.url, { timeout: 5000 });
                        return {
                            ...link,
                            status: response.status,
                            working: true
                        };
                    } catch (error) {
                        return {
                            ...link,
                            status: error.response?.status || 0,
                            working: false
                        };
                    }
                })
            );

            const summary = {
                total: links.length,
                checked: checkedLinks.length,
                working: checkedLinks.filter(l => l.working).length,
                broken: checkedLinks.filter(l => !l.working).length,
                internal: links.filter(l => l.type === 'internal').length,
                external: links.filter(l => l.type === 'external').length,
                details: checkedLinks
            };

            res.json(summary);
        } catch (error) {
            res.status(400).json({ error: error.message || 'Failed to check links' });
        }
    }
);

export default router; 