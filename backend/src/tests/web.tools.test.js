import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from '../app.js';
import { expect } from 'chai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Web Tools API', () => {
    describe('POST /api/web/shorten', () => {
        it('should shorten a URL', async () => {
            const response = await request(app)
                .post('/api/web/shorten')
                .send({
                    url: 'https://www.example.com/very/long/url/that/needs/shortening'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('shortened');
            expect(response.body.shortened).to.be.a('string');
            expect(response.body.shortened.length).to.be.lessThan(50);
        });

        it('should handle invalid URLs', async () => {
            const response = await request(app)
                .post('/api/web/shorten')
                .send({
                    url: 'not-a-valid-url'
                });

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error');
        });
    });

    describe('POST /api/web/screenshot', () => {
        it('should capture a screenshot of a webpage', async () => {
            const response = await request(app)
                .post('/api/web/screenshot')
                .send({
                    url: 'https://www.example.com',
                    width: 1920,
                    height: 1080
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('screenshot');
            expect(response.body.screenshot).to.be.a('string');
        });

        it('should handle invalid URLs', async () => {
            const response = await request(app)
                .post('/api/web/screenshot')
                .send({
                    url: 'not-a-valid-url',
                    width: 1920,
                    height: 1080
                });

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error');
        });
    });

    describe('POST /api/web/analyze', () => {
        it('should analyze a webpage', async () => {
            const response = await request(app)
                .post('/api/web/analyze')
                .send({
                    url: 'https://www.example.com'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('analysis');
            expect(response.body.analysis).to.be.an('object');
            expect(response.body.analysis).to.have.property('title');
            expect(response.body.analysis).to.have.property('description');
            expect(response.body.analysis).to.have.property('keywords');
            expect(response.body.analysis).to.have.property('links');
        });

        it('should handle invalid URLs', async () => {
            const response = await request(app)
                .post('/api/web/analyze')
                .send({
                    url: 'not-a-valid-url'
                });

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error');
        });
    });
}); 