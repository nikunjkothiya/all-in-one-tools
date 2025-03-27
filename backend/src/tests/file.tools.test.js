import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import app from '../app.js';
import { expect } from 'chai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('File Tools API', () => {
    const testFilePath = path.join(__dirname, 'assets/text/test.txt');

    before(() => {
        // Ensure test file exists
        if (!fs.existsSync(testFilePath)) {
            fs.writeFileSync(testFilePath, 'Hello World');
        }
    });

    after(() => {
        // Clean up test files
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });

    describe('POST /api/file/convert', () => {
        it('should convert file to PDF', async () => {
            const response = await request(app)
                .post('/api/file/convert')
                .attach('file', testFilePath)
                .field('format', 'pdf');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('converted');
            expect(response.body.converted).to.be.a('string');
        });

        it('should convert file to DOCX', async () => {
            const response = await request(app)
                .post('/api/file/convert')
                .attach('file', testFilePath)
                .field('format', 'docx');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('converted');
            expect(response.body.converted).to.be.a('string');
        });
    });

    describe('POST /api/file/compress', () => {
        it('should compress a file', async () => {
            const response = await request(app)
                .post('/api/file/compress')
                .attach('file', testFilePath);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('compressed');
            expect(response.body.compressed).to.be.a('string');
        });
    });

    describe('POST /api/file/encrypt', () => {
        it('should encrypt a file', async () => {
            const response = await request(app)
                .post('/api/file/encrypt')
                .attach('file', testFilePath)
                .field('password', 'test123');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('encrypted');
            expect(response.body.encrypted).to.be.a('string');
        });
    });

    describe('POST /api/file/upload', () => {
        it('should upload a file', async () => {
            const response = await request(app)
                .post('/api/file/upload')
                .attach('file', testFilePath);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('url');
            expect(response.body.url).to.be.a('string');
        });
    });

    describe('POST /api/file/download', () => {
        it('should download a file', async () => {
            const response = await request(app)
                .post('/api/file/download')
                .send({
                    url: 'http://example.com/test.txt'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('content');
            expect(response.body.content).to.be.a('string');
        });
    });
}); 