import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField, Alert } from '@mui/material';
import { pdfToolsApi } from '../services/api';

const PDFTools = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setSelectedFiles(files);
            setError(null);
            setSuccess(null);
        }
    };

    const handleMerge = async () => {
        if (selectedFiles.length < 2) {
            setError('Please select at least 2 PDF files to merge');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            selectedFiles.forEach((file, index) => {
                formData.append('files', file);
            });

            const response = await pdfToolsApi.mergePDFs(formData);
            setSuccess('PDFs merged successfully!');
            // Handle the response (e.g., download the merged PDF)
        } catch (err) {
            setError(err.message || 'Failed to merge PDFs');
        } finally {
            setLoading(false);
        }
    };

    const handleSplit = async () => {
        if (selectedFiles.length !== 1) {
            setError('Please select exactly 1 PDF file to split');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFiles[0]);
            formData.append('pages', '1-3,5,7-9'); // Example page ranges

            const response = await pdfToolsApi.splitPDF(formData);
            setSuccess('PDF split successfully!');
            // Handle the response (e.g., download the split PDFs)
        } catch (err) {
            setError(err.message || 'Failed to split PDF');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    PDF Tools
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
                                    Upload PDF Files
                                </Typography>
                                <input
                                    accept=".pdf"
                                    style={{ display: 'none' }}
                                    id="pdf-upload"
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="pdf-upload">
                                    <Button
                                        variant="contained"
                                        component="span"
                                        sx={{ mb: 2 }}
                                    >
                                        Select PDF Files
                                    </Button>
                                </label>
                                {selectedFiles.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            Selected files: {selectedFiles.length}
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
                                    PDF Operations
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleMerge}
                                        disabled={selectedFiles.length < 2 || loading}
                                    >
                                        Merge PDFs
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSplit}
                                        disabled={selectedFiles.length !== 1 || loading}
                                    >
                                        Split PDF
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

export default PDFTools; 