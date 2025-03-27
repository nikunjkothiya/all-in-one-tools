import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from '../app.js';
import { expect } from 'chai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Text Tools API', () => {
    describe('POST /api/text/case', () => {
        it('should convert text to uppercase', async () => {
            const response = await request(app)
                .post('/api/text/case')
                .send({
                    text: 'Hello World',
                    case: 'upper'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('converted');
            expect(response.body.converted).to.equal('HELLO WORLD');
        });

        it('should convert text to lowercase', async () => {
            const response = await request(app)
                .post('/api/text/case')
                .send({
                    text: 'Hello World',
                    case: 'lower'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('converted');
            expect(response.body.converted).to.equal('hello world');
        });
    });

    describe('POST /api/text/diff', () => {
        it('should find differences between two texts', async () => {
            const response = await request(app)
                .post('/api/text/diff')
                .send({
                    text1: 'Hello World',
                    text2: 'Hello Earth'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('differences');
            expect(response.body.differences).to.be.an('array');
        });
    });

    describe('POST /api/text/encode', () => {
        it('should encode text to base64', async () => {
            const response = await request(app)
                .post('/api/text/encode')
                .send({
                    text: 'Hello World',
                    encoding: 'base64'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('encoded');
            expect(response.body.encoded).to.equal('SGVsbG8gV29ybGQ=');
        });

        it('should decode base64 text', async () => {
            const response = await request(app)
                .post('/api/text/encode')
                .send({
                    text: 'SGVsbG8gV29ybGQ=',
                    encoding: 'base64',
                    decode: true
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('decoded');
            expect(response.body.decoded).to.equal('Hello World');
        });
    });
}); 