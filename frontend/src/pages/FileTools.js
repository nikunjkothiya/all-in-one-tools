import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Alert } from '@mui/material';
import { fileToolsApi } from '../services/api';

const FileTools = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setSuccess(null);
        }
    };

    const handleConvert = async (format) => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('format', format);

            const response = await fileToolsApi.convertFile(formData);
            setSuccess(`File converted to ${format.toUpperCase()} successfully!`);
            // Handle the response (e.g., download the converted file)
        } catch (err) {
            setError(err.message || 'Failed to convert file');
        } finally {
            setLoading(false);
        }
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
            setSuccess('File compressed successfully!');
            // Handle the response (e.g., download the compressed file)
        } catch (err) {
            setError(err.message || 'Failed to compress file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    File Tools
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
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
                                    >
                                        Select File
                                    </Button>
                                </label>
                                {selectedFile && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            Selected file: {selectedFile.name}
                                        </Typography>
                                    </Box>
                                )}
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
                                        onClick={() => handleConvert('pdf')}
                                        disabled={!selectedFile || loading}
                                    >
                                        Convert to PDF
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleConvert('docx')}
                                        disabled={!selectedFile || loading}
                                    >
                                        Convert to DOCX
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleCompress}
                                        disabled={!selectedFile || loading}
                                    >
                                        Compress File
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