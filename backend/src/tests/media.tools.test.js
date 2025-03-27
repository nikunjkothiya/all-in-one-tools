import request from 'supertest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import app from '../app.js';
import { expect } from 'chai';
import ffmpeg from 'fluent-ffmpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Media Tools API', () => {
    const testVideoPath = path.join(__dirname, 'assets/videos/test.mp4');

    before(async function () {
        this.timeout(10000); // Increase timeout for video creation

        // Ensure test video exists
        if (!fs.existsSync(testVideoPath)) {
            // Create a simple video file using ffmpeg
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input('color=black:s=640x480:r=1')
                    .inputOptions(['-f', 'lavfi'])
                    .outputOptions([
                        '-vf', 'drawtext=text=Test:fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2',
                        '-t', '1',
                        '-c:v', 'libx264',
                        '-preset', 'ultrafast'
                    ])
                    .save(testVideoPath)
                    .on('end', resolve)
                    .on('error', reject);
            });
        }
    });

    after(() => {
        // Clean up test files
        if (fs.existsSync(testVideoPath)) {
            fs.unlinkSync(testVideoPath);
        }
    });

    describe('POST /api/media/compress', () => {
        it('should compress a video', async () => {
            const response = await request(app)
                .post('/api/media/compress')
                .attach('video', testVideoPath)
                .field('quality', 'medium');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('compressed');
            expect(response.body.compressed).to.be.a('string');
        });
    });

    describe('POST /api/media/convert', () => {
        it('should convert video format', async () => {
            const response = await request(app)
                .post('/api/media/convert')
                .attach('video', testVideoPath)
                .field('format', 'webm');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('converted');
            expect(response.body.converted).to.be.a('string');
        });
    });

    describe('POST /api/media/extract-audio', () => {
        it('should extract audio from video', async () => {
            const response = await request(app)
                .post('/api/media/extract-audio')
                .attach('video', testVideoPath)
                .field('format', 'mp3');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('audio');
            expect(response.body.audio).to.be.a('string');
        });
    });
}); 