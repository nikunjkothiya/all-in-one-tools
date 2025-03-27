import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Alert, Slider, TextField } from '@mui/material';
import { mediaToolsApi } from '../services/api';

const MediaTools = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [quality, setQuality] = useState(80);
    const [format, setFormat] = useState('mp4');

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
            setSuccess(null);
        }
    };

    const handleCompress = async () => {
        if (!selectedFile) {
            setError('Please select a media file first');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('quality', quality);
            formData.append('format', format);

            const response = await mediaToolsApi.compressMedia(formData);
            setSuccess('Media compressed successfully!');
            // Handle the response (e.g., download the compressed media)
        } catch (err) {
            setError(err.message || 'Failed to compress media');
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = async () => {
        if (!selectedFile) {
            setError('Please select a media file first');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('format', format);

            const response = await mediaToolsApi.convertMedia(formData);
            setSuccess(`Media converted to ${format.toUpperCase()} successfully!`);
            // Handle the response (e.g., download the converted media)
        } catch (err) {
            setError(err.message || 'Failed to convert media');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Media Tools
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
                                    Upload Media File
                                </Typography>
                                <input
                                    accept="video/*,audio/*"
                                    style={{ display: 'none' }}
                                    id="media-upload"
                                    type="file"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="media-upload">
                                    <Button
                                        variant="contained"
                                        component="span"
                                        sx={{ mb: 2 }}
                                    >
                                        Select Media File
                                    </Button>
                                </label>
                                {preview && (
                                    <Box sx={{ mt: 2 }}>
                                        <video
                                            src={preview}
                                            controls
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
                                    Media Operations
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                    <TextField
                                        select
                                        label="Output Format"
                                        value={format}
                                        onChange={(e) => setFormat(e.target.value)}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    >
                                        <option value="mp4">MP4</option>
                                        <option value="webm">WebM</option>
                                        <option value="avi">AVI</option>
                                        <option value="mov">MOV</option>
                                    </TextField>

                                    <Typography gutterBottom>
                                        Quality: {quality}%
                                    </Typography>
                                    <Slider
                                        value={quality}
                                        onChange={(e, newValue) => setQuality(newValue)}
                                        min={1}
                                        max={100}
                                        valueLabelDisplay="auto"
                                        sx={{ mb: 2 }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={handleCompress}
                                        disabled={!selectedFile || loading}
                                    >
                                        Compress Media
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleConvert}
                                        disabled={!selectedFile || loading}
                                    >
                                        Convert Format
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

export default MediaTools; 