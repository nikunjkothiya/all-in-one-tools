import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField, Alert, Link } from '@mui/material';
import { webToolsApi } from '../services/api';

const WebTools = () => {
    const [url, setUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [screenshot, setScreenshot] = useState(null);

    const handleShorten = async () => {
        if (!url.trim()) {
            setError('Please enter a URL to shorten');
            return;
        }

        setLoading(true);
        try {
            const response = await webToolsApi.shortenUrl(url);
            setShortUrl(response.shortUrl);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to shorten URL');
            setShortUrl('');
        } finally {
            setLoading(false);
        }
    };

    const handleScreenshot = async () => {
        if (!url.trim()) {
            setError('Please enter a URL to capture');
            return;
        }

        setLoading(true);
        try {
            const response = await webToolsApi.captureScreenshot(url);
            setScreenshot(response.screenshot);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to capture screenshot');
            setScreenshot(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!url.trim()) {
            setError('Please enter a URL to analyze');
            return;
        }

        setLoading(true);
        try {
            const response = await webToolsApi.analyzeWebsite(url);
            // Handle the analysis results
            console.log(response);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to analyze website');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Web Tools
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    URL Input
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Enter URL"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleShorten}
                                        disabled={!url.trim() || loading}
                                    >
                                        Shorten URL
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleScreenshot}
                                        disabled={!url.trim() || loading}
                                    >
                                        Capture Screenshot
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleAnalyze}
                                        disabled={!url.trim() || loading}
                                    >
                                        Analyze Website
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Results
                                </Typography>
                                {shortUrl && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Shortened URL:
                                        </Typography>
                                        <Link href={shortUrl} target="_blank" rel="noopener noreferrer">
                                            {shortUrl}
                                        </Link>
                                    </Box>
                                )}
                                {screenshot && (
                                    <Box>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Screenshot:
                                        </Typography>
                                        <img
                                            src={screenshot}
                                            alt="Website Screenshot"
                                            style={{ maxWidth: '100%', maxHeight: '300px' }}
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default WebTools; 