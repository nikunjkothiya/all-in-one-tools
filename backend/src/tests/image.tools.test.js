import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import app from '../app.js';
import { expect } from 'chai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Image Tools API', () => {
    const testImagePath = path.join(__dirname, 'assets/images/test.jpg');

    before(() => {
        // Ensure test image exists
        if (!fs.existsSync(testImagePath)) {
            const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
            fs.writeFileSync(testImagePath, imageBuffer);
        }
    });

    after(() => {
        // Clean up test files
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    });

    describe('POST /api/image/resize', () => {
        it('should resize an image', async () => {
            const response = await request(app)
                .post('/api/image/resize')
                .attach('image', testImagePath)
                .field('width', '800')
                .field('height', '600')
                .field('fit', 'cover');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('resized');
            expect(response.body.resized).to.be.a('string');
        });
    });

    describe('POST /api/image/compress', () => {
        it('should compress an image', async () => {
            const response = await request(app)
                .post('/api/image/compress')
                .attach('image', testImagePath)
                .field('quality', '80')
                .field('format', 'jpeg');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('compressed');
            expect(response.body.compressed).to.be.a('string');
        });
    });

    describe('POST /api/image/convert', () => {
        it('should convert an image to PNG', async () => {
            const response = await request(app)
                .post('/api/image/convert')
                .attach('image', testImagePath)
                .field('format', 'png');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('converted');
            expect(response.body.converted).to.be.a('string');
        });
    });
}); 