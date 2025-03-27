import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from '../app.js';
import { expect } from 'chai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Privacy Tools API', () => {
    describe('POST /api/privacy/encrypt', () => {
        it('should encrypt text using AES', async () => {
            const response = await request(app)
                .post('/api/privacy/encrypt')
                .send({
                    text: 'Hello, World!',
                    algorithm: 'aes',
                    key: 'test-key-123'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('encrypted');
            expect(response.body.encrypted).to.be.a('string');
            expect(response.body.encrypted).to.not.equal('Hello, World!');
        });

        it('should encrypt text using DES', async () => {
            const response = await request(app)
                .post('/api/privacy/encrypt')
                .send({
                    text: 'Hello, World!',
                    algorithm: 'des',
                    key: 'test-key-123'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('encrypted');
            expect(response.body.encrypted).to.be.a('string');
            expect(response.body.encrypted).to.not.equal('Hello, World!');
        });
    });

    describe('POST /api/privacy/decrypt', () => {
        let encryptedText = '';

        before(async () => {
            // First encrypt some text to use in decrypt tests
            const response = await request(app)
                .post('/api/privacy/encrypt')
                .send({
                    text: 'Hello, World!',
                    algorithm: 'aes',
                    key: 'test-key-123'
                });
            encryptedText = response.body.encrypted;
        });

        it('should decrypt text using AES', async () => {
            const response = await request(app)
                .post('/api/privacy/decrypt')
                .send({
                    text: encryptedText,
                    algorithm: 'aes',
                    key: 'test-key-123'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('decrypted');
            expect(response.body.decrypted).to.equal('Hello, World!');
        });

        it('should handle invalid key', async () => {
            const response = await request(app)
                .post('/api/privacy/decrypt')
                .send({
                    text: encryptedText,
                    algorithm: 'aes',
                    key: 'wrong-key'
                });

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error');
        });
    });

    describe('POST /api/privacy/hash', () => {
        it('should hash password using bcrypt', async () => {
            const response = await request(app)
                .post('/api/privacy/hash')
                .send({
                    password: 'test-password-123',
                    algorithm: 'bcrypt'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('hashed');
            expect(response.body.hashed).to.be.a('string');
            expect(response.body.hashed).to.not.equal('test-password-123');
        });

        it('should hash password using SHA-256', async () => {
            const response = await request(app)
                .post('/api/privacy/hash')
                .send({
                    password: 'test-password-123',
                    algorithm: 'sha256'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('hashed');
            expect(response.body.hashed).to.be.a('string');
            expect(response.body.hashed).to.not.equal('test-password-123');
        });
    });

    describe('POST /api/privacy/verify', () => {
        let hashedPassword = '';

        before(async () => {
            // First hash a password to use in verify tests
            const response = await request(app)
                .post('/api/privacy/hash')
                .send({
                    password: 'test-password-123',
                    algorithm: 'bcrypt'
                });
            hashedPassword = response.body.hashed;
        });

        it('should verify password using bcrypt', async () => {
            const response = await request(app)
                .post('/api/privacy/verify')
                .send({
                    password: 'test-password-123',
                    hashed: hashedPassword,
                    algorithm: 'bcrypt'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('valid', true);
        });

        it('should reject incorrect password', async () => {
            const response = await request(app)
                .post('/api/privacy/verify')
                .send({
                    password: 'wrong-password',
                    hashed: hashedPassword,
                    algorithm: 'bcrypt'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('valid', false);
        });
    });
}); 