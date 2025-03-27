import express from 'express';
import { body } from 'express-validator';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import yaml from 'js-yaml';
import xml2js from 'xml2js';
import { promisify } from 'util';

const router = express.Router();
const parseXml = promisify(xml2js.parseString);
const xmlBuilder = new xml2js.Builder();

// Helper functions for data conversion
const parseInput = async (data, format) => {
    try {
        switch (format) {
            case 'json':
                return JSON.parse(data);
            case 'yaml':
                return yaml.load(data);
            case 'xml':
                return await parseXml(data);
            case 'csv':
                const results = [];
                const csvStream = Readable.from(data);
                await new Promise((resolve, reject) => {
                    csvStream
                        .pipe(csv())
                        .on('data', (data) => results.push(data))
                        .on('end', resolve)
                        .on('error', reject);
                });
                return results;
            default:
                throw new Error(`Unsupported input format: ${format}`);
        }
    } catch (error) {
        throw new Error(`Error parsing ${format.toUpperCase()}: ${error.message}`);
    }
};

const convertToFormat = async (data, format) => {
    try {
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'yaml':
                return yaml.dump(data);
            case 'xml':
                return xmlBuilder.buildObject(data);
            case 'csv':
                if (!Array.isArray(data)) {
                    data = [data];
                }
                const outputPath = path.join('uploads', `converted_${Date.now()}.csv`);
                const csvHeaders = Object.keys(data[0]).map(key => ({
                    id: key,
                    title: key
                }));

                const csvWriter = createObjectCsvWriter({
                    path: outputPath,
                    header: csvHeaders
                });

                await csvWriter.writeRecords(data);
                const csvContent = fs.readFileSync(outputPath, 'utf-8');
                fs.unlinkSync(outputPath);
                return csvContent;
            default:
                throw new Error(`Unsupported output format: ${format}`);
        }
    } catch (error) {
        throw new Error(`Error converting to ${format.toUpperCase()}: ${error.message}`);
    }
};

// Data format converter endpoint
router.post(
    '/convert',
    [
        body('data').notEmpty().withMessage('Data is required'),
        body('format').isIn(['json', 'xml', 'csv', 'yaml']).withMessage('Invalid input format'),
        body('targetFormat').isIn(['json', 'xml', 'csv', 'yaml']).withMessage('Invalid target format'),
    ],
    async (req, res) => {
        try {
            const { data, format, targetFormat } = req.body;

            if (format === targetFormat) {
                return res.status(400).json({ error: 'Input and target formats are the same' });
            }

            // Parse input data
            const parsedData = await parseInput(data, format);

            // Convert to target format
            const converted = await convertToFormat(parsedData, targetFormat);

            res.json({ converted });
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
        body('format').isIn(['json', 'xml', 'csv', 'yaml']).withMessage('Invalid format'),
    ],
    async (req, res) => {
        try {
            const { data, format } = req.body;
            await parseInput(data, format);
            res.json({ valid: true, message: `Valid ${format.toUpperCase()} format` });
        } catch (error) {
            res.json({
                valid: false,
                errors: [error.message],
                message: `Invalid ${format.toUpperCase()} format`
            });
        }
    }
);

// Data transformer endpoint
router.post(
    '/transform',
    [
        body('data').notEmpty().withMessage('Data is required'),
        body('format').isIn(['json', 'xml', 'csv', 'yaml']).withMessage('Invalid format'),
    ],
    async (req, res) => {
        try {
            const { data, format } = req.body;

            // Parse the input
            const parsedData = await parseInput(data, format);

            // Convert back to the same format but beautified
            const transformed = await convertToFormat(parsedData, format);

            res.json({ transformed });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

export default router; 