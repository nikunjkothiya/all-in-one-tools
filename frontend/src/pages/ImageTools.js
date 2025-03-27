import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField, Alert } from '@mui/material';
import { imageToolsApi } from '../services/api';

const ImageTools = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
            setSuccess(null);
        }
    };

    const handleResize = async () => {
        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('width', 800); // Default width
            formData.append('height', 600); // Default height

            const response = await imageToolsApi.resizeImage(formData);
            setSuccess('Image resized successfully!');
            // Handle the response (e.g., download the resized image)
        } catch (err) {
            setError(err.message || 'Failed to resize image');
        } finally {
            setLoading(false);
        }
    };

    const handleCompress = async () => {
        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('quality', 80); // Default quality

            const response = await imageToolsApi.compressImage(formData);
            setSuccess('Image compressed successfully!');
            // Handle the response (e.g., download the compressed image)
        } catch (err) {
            setError(err.message || 'Failed to compress image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Image Tools
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
                                    Upload Image
                                </Typography>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="image-upload"
                                    type="file"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="image-upload">
                                    <Button
                                        variant="contained"
                                        component="span"
                                        sx={{ mb: 2 }}
                                    >
                                        Select Image
                                    </Button>
                                </label>
                                {preview && (
                                    <Box sx={{ mt: 2 }}>
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: '300px' }}
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Image Operations
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleResize}
                                        disabled={!selectedFile || loading}
                                    >
                                        Resize Image
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleCompress}
                                        disabled={!selectedFile || loading}
                                    >
                                        Compress Image
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

export default ImageTools; 