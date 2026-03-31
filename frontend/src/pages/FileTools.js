import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Alert, TextField } from '@mui/material';
import { fileToolsApi, resolveApiUrl } from '../services/api';
import ToolPageHeader from '../components/ToolPageHeader';

const FileTools = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setSuccess(null);
        }
    };

    const triggerDownload = (url, filename) => {
        const fullUrl = resolveApiUrl(url);
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = filename || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleCompress = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fileToolsApi.compressFile(formData);
            const { compressed, originalSize, compressedSize, sizeChangePercent, isCompressedSmaller } = response.data;
            const originalSizeKb = (originalSize / 1024).toFixed(1);
            const compressedSizeKb = (compressedSize / 1024).toFixed(1);
            const summary = isCompressedSmaller
                ? `File compressed. Original: ${originalSizeKb}KB -> ${compressedSizeKb}KB (${sizeChangePercent} smaller).`
                : `File compressed, but this file grew after GZIP. Original: ${originalSizeKb}KB -> ${compressedSizeKb}KB (${sizeChangePercent} larger).`;

            setSuccess(summary);
            triggerDownload(compressed, `${selectedFile.name}.gz`);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to compress file');
        } finally {
            setLoading(false);
        }
    };

    const handleEncrypt = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }
        if (!password) {
            setError('Please enter a password for encryption');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('password', password);

            const response = await fileToolsApi.encryptFile(formData);
            setSuccess('File encrypted successfully! Download starting...');
            triggerDownload(response.data.encrypted, `${selectedFile.name}.enc`);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to encrypt file');
        } finally {
            setLoading(false);
        }
    };

    const handleDecrypt = async () => {
        if (!selectedFile) {
            setError('Please select an encrypted (.enc) file first');
            return;
        }
        if (!password) {
            setError('Please enter the password used for encryption');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('password', password);

            const response = await fileToolsApi.decryptFile(formData);
            setSuccess('File decrypted successfully! Download starting...');
            triggerDownload(response.data.decrypted, selectedFile.name.replace(/\.enc$/, ''));
        } catch (err) {
            setError(err.response?.data?.error || 'Decryption failed. Wrong password or corrupted file.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 2 }}>
                <ToolPageHeader
                    title="File Tools"
                    description="Compress files with GZIP and protect them with AES-256-CBC encryption in a compact browser workflow."
                    chips={["Compress", "Encrypt", "Decrypt"]}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Upload File
                                </Typography>
                                <input
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="file-upload">
                                    <Button
                                        variant="contained"
                                        component="span"
                                        sx={{ mb: 2 }}
                                        fullWidth
                                    >
                                        Select File
                                    </Button>
                                </label>
                                {selectedFile && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                                        </Typography>
                                    </Box>
                                )}
                                <TextField
                                    fullWidth
                                    label="Password (for Encrypt / Decrypt)"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    sx={{ mt: 2 }}
                                    helperText="Required for encryption and decryption operations"
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    File Operations
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleCompress}
                                        disabled={!selectedFile || loading}
                                        color="primary"
                                    >
                                        {loading ? 'Processing...' : 'Compress File (GZIP)'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleEncrypt}
                                        disabled={!selectedFile || !password || loading}
                                        color="secondary"
                                    >
                                        {loading ? 'Processing...' : 'Encrypt File (AES-256)'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={handleDecrypt}
                                        disabled={!selectedFile || !password || loading}
                                        color="secondary"
                                    >
                                        {loading ? 'Processing...' : 'Decrypt File'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default FileTools;
