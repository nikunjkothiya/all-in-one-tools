import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from '../app.js';
import { expect } from 'chai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Data Tools API', () => {
    describe('POST /api/data/convert', () => {
        it('should convert JSON to CSV', async () => {
            const response = await request(app)
                .post('/api/data/convert')
                .send({
                    data: JSON.stringify([
                        { name: 'John', age: 30 },
                        { name: 'Jane', age: 25 }
                    ]),
                    fromFormat: 'json',
                    toFormat: 'csv'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('converted');
            expect(response.body.converted).to.be.a('string');
            expect(response.body.converted).to.include('name,age');
        });

        it('should convert CSV to JSON', async () => {
            const response = await request(app)
                .post('/api/data/convert')
                .send({
                    data: 'name,age\nJohn,30\nJane,25',
                    fromFormat: 'csv',
                    toFormat: 'json'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('converted');
            expect(response.body.converted).to.be.a('string');
            const parsed = JSON.parse(response.body.converted);
            expect(parsed).to.be.an('array');
            expect(parsed).to.have.lengthOf(2);
        });
    });

    describe('POST /api/data/validate', () => {
        it('should validate JSON data', async () => {
            const response = await request(app)
                .post('/api/data/validate')
                .send({
                    data: JSON.stringify({ name: 'John', age: 30 }),
                    format: 'json'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('valid', true);
        });

        it('should validate CSV data', async () => {
            const response = await request(app)
                .post('/api/data/validate')
                .send({
                    data: 'name,age\nJohn,30\nJane,25',
                    format: 'csv'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('valid', true);
        });

        it('should detect invalid JSON', async () => {
            const response = await request(app)
                .post('/api/data/validate')
                .send({
                    data: '{invalid json}',
                    format: 'json'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('valid', false);
            expect(response.body).to.have.property('errors');
        });
    });

    describe('POST /api/data/transform', () => {
        it('should transform data using a template', async () => {
            const response = await request(app)
                .post('/api/data/transform')
                .send({
                    data: JSON.stringify([
                        { name: 'John', age: 30 },
                        { name: 'Jane', age: 25 }
                    ]),
                    template: '{{name}} is {{age}} years old'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('transformed');
            expect(response.body.transformed).to.be.an('array');
            expect(response.body.transformed).to.have.lengthOf(2);
            expect(response.body.transformed[0]).to.include('John is 30 years old');
        });

        it('should handle invalid template', async () => {
            const response = await request(app)
                .post('/api/data/transform')
                .send({
                    data: JSON.stringify([{ name: 'John' }]),
                    template: '{{invalid}}'
                });

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error');
        });
    });
}); 