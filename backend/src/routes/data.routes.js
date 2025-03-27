import express from 'express';
import { body } from 'express-validator';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

const router = express.Router();

// Data format converter endpoint
router.post(
    '/convert',
    [
        body('data').notEmpty().withMessage('Data is required'),
        body('fromFormat').isIn(['json', 'csv']).withMessage('Invalid from format'),
        body('toFormat').isIn(['json', 'csv']).withMessage('Invalid to format'),
    ],
    async (req, res) => {
        try {
            const { data, fromFormat, toFormat } = req.body;

            if (fromFormat === 'json' && toFormat === 'csv') {
                const jsonData = JSON.parse(data);
                const outputPath = path.join('uploads', `converted_${Date.now()}.csv`);
                const csvHeaders = Object.keys(jsonData[0]).map(key => ({
                    id: key,
                    title: key
                }));

                const csvWriter = createObjectCsvWriter({
                    path: outputPath,
                    header: csvHeaders
                });

                await csvWriter.writeRecords(jsonData);
                const csvContent = fs.readFileSync(outputPath, 'utf-8');
                fs.unlinkSync(outputPath);
                res.json({ converted: csvContent });
            } else if (fromFormat === 'csv' && toFormat === 'json') {
                const results = [];
                const csvStream = Readable.from(data);

                await new Promise((resolve, reject) => {
                    csvStream
                        .pipe(csv())
                        .on('data', (data) => results.push(data))
                        .on('end', resolve)
                        .on('error', reject);
                });

                res.json({ converted: JSON.stringify(results) });
            } else {
                res.status(400).json({ error: 'Unsupported conversion' });
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// Data validator endpoint
router.post(
    '/validate',
    [
        body('data').notEmpty().withMessage('Data is required'),
        body('format').isIn(['json', 'csv']).withMessage('Invalid format'),
    ],
    async (req, res) => {
        try {
            const { data, format } = req.body;

            if (format === 'json') {
                JSON.parse(data);
                res.json({ valid: true });
            } else if (format === 'csv') {
                const results = [];
                const csvStream = Readable.from(data);

                await new Promise((resolve, reject) => {
                    csvStream
                        .pipe(csv())
                        .on('data', (data) => results.push(data))
                        .on('end', resolve)
                        .on('error', reject);
                });

                res.json({ valid: true });
            }
        } catch (error) {
            res.json({ valid: false, errors: [error.message] });
        }
    }
);

// Data transformer endpoint
router.post(
    '/transform',
    [
        body('data').notEmpty().withMessage('Data is required'),
        body('template').notEmpty().withMessage('Template is required'),
    ],
    async (req, res) => {
        try {
            const { data, template } = req.body;
            const jsonData = JSON.parse(data);

            const transformed = jsonData.map(item => {
                try {
                    return template.replace(/{{(\w+)}}/g, (match, key) => {
                        if (!(key in item)) {
                            throw new Error('Invalid template variables');
                        }
                        return item[key] || '';
                    });
                } catch (error) {
                    throw new Error('Invalid template variables');
                }
            });

            res.status(200).json({ transformed });
        } catch (error) {
            // Check if the error is due to invalid template variables
            if (error.message === 'Invalid template variables') {
                return res.status(400).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    }
);

export default router; 