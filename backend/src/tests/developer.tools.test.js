import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from '../app.js';
import { expect } from 'chai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Developer Tools API', () => {
    describe('POST /api/developer/format', () => {
        it('should format JSON code', async () => {
            const response = await request(app)
                .post('/api/developer/format')
                .send({
                    code: '{"name":"John","age":30}',
                    format: 'json'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('formatted');
            expect(response.body.formatted).to.be.a('string');
            expect(response.body.formatted).to.include('\n');
        });

        it('should format HTML code', async () => {
            const response = await request(app)
                .post('/api/developer/format')
                .send({
                    code: '<div><p>Hello</p></div>',
                    format: 'html'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('formatted');
            expect(response.body.formatted).to.be.a('string');
            expect(response.body.formatted).to.include('\n');
        });
    });

    describe('POST /api/developer/minify', () => {
        it('should minify JSON code', async () => {
            const response = await request(app)
                .post('/api/developer/minify')
                .send({
                    code: '{\n  "name": "John",\n  "age": 30\n}',
                    format: 'json'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('minified');
            expect(response.body.minified).to.be.a('string');
            expect(response.body.minified).to.not.include('\n');
        });

        it('should minify HTML code', async () => {
            const response = await request(app)
                .post('/api/developer/minify')
                .send({
                    code: '<div>\n  <p>Hello</p>\n</div>',
                    format: 'html'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('minified');
            expect(response.body.minified).to.be.a('string');
            expect(response.body.minified).to.not.include('\n');
        });
    });

    describe('POST /api/developer/validate', () => {
        it('should validate JSON code', async () => {
            const response = await request(app)
                .post('/api/developer/validate')
                .send({
                    code: '{"name":"John","age":30}',
                    format: 'json'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('valid');
            expect(response.body.valid).to.be.true;
        });

        it('should validate HTML code', async () => {
            const response = await request(app)
                .post('/api/developer/validate')
                .send({
                    code: '<div><p>Hello</p></div>',
                    format: 'html'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('valid');
            expect(response.body.valid).to.be.true;
        });
    });
}); 