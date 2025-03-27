import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Text Tools API
export const textToolsApi = {
    convertCase: (text, caseType) =>
        api.post('/text/case-converter', { text, caseType }),
    compareText: (text1, text2) =>
        api.post('/text/diff', { text1, text2 }),
    testRegex: (text, pattern) =>
        api.post('/text/regex', { text, pattern }),
    generateLoremIpsum: (paragraphs) =>
        api.get(`/text/lorem-ipsum?paragraphs=${paragraphs}`),
    previewMarkdown: (markdown) =>
        api.post('/text/markdown', { markdown }),
};

// Image Tools API
export const imageToolsApi = {
    resizeImage: (formData) =>
        api.post('/image/resize', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    compressImage: (formData) =>
        api.post('/image/compress', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    convertFormat: (formData, targetFormat) =>
        api.post('/image/convert', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: { format: targetFormat },
        }),
    addWatermark: (formData) =>
        api.post('/image/watermark', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    removeExif: (formData) =>
        api.post('/image/remove-exif', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
};

// PDF Tools API
export const pdfToolsApi = {
    mergePdfs: (formData) =>
        api.post('/pdf/merge', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    splitPdf: (formData, pages) =>
        api.post('/pdf/split', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: { pages },
        }),
    addText: (formData) =>
        api.post('/pdf/add-text', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    addSignature: (formData) =>
        api.post('/pdf/add-signature', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    protectPdf: (formData, password) =>
        api.post('/pdf/protect', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: { password },
        }),
};

// Developer Tools API
export const developerToolsApi = {
    formatJson: (json) => api.post('/developer/format-json', { json }),
    encodeBase64: (text) => api.post('/developer/encode-base64', { text }),
    decodeBase64: (text) => api.post('/developer/decode-base64', { text }),
    parseUrl: (url) => api.post('/developer/parse-url', { url }),
    analyzeHeaders: (url) => api.post('/developer/analyze-headers', { url }),
};

// File Tools API
export const fileToolsApi = {
    convertFile: (formData, targetFormat) =>
        api.post('/file/convert', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: { format: targetFormat },
        }),
    generateChecksum: (formData) =>
        api.post('/file/checksum', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    identifyMimeType: (formData) =>
        api.post('/file/mime-type', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
};

// Media Tools API
export const mediaToolsApi = {
    cutAudio: (formData) =>
        api.post('/media/cut-audio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    convertToGif: (formData) =>
        api.post('/media/to-gif', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    generateThumbnail: (formData) =>
        api.post('/media/thumbnail', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    editMetadata: (formData) =>
        api.post('/media/metadata', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
};

// Web Tools API
export const webToolsApi = {
    analyzeSeo: (url) => api.post('/web/seo', { url }),
    checkLinks: (url) => api.post('/web/check-links', { url }),
    takeScreenshot: (url) => api.post('/web/screenshot', { url }),
    generateFavicon: (formData) =>
        api.post('/web/favicon', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
};

// Data Tools API
export const dataToolsApi = {
    generateQrCode: (data) => api.post('/data/qr-code', { data }),
    readBarcode: (formData) =>
        api.post('/data/read-barcode', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    convertCsvToJson: (formData) =>
        api.post('/data/csv-to-json', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    visualizeData: (data) => api.post('/data/visualize', { data }),
};

// Privacy Tools API
export const privacyToolsApi = {
    obfuscateEmail: (email) => api.post('/privacy/obfuscate-email', { email }),
    generatePassword: (options) =>
        api.post('/privacy/generate-password', options),
    shredFile: (formData) =>
        api.post('/privacy/shred-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
};

export default api; 