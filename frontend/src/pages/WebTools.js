import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField, Alert, Link, CircularProgress, List, ListItem, ListItemText, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';
import { webToolsApi } from '../services/api';

const WebTools = () => {
    const [url, setUrl] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [screenshotData, setScreenshotData] = useState(null);

    const handleScreenshot = async () => {
        if (!url.trim()) {
            setError('Please enter a URL to capture');
            return;
        }

        // Ensure URL has protocol
        let processedUrl = url.trim();
        if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = 'https://' + processedUrl;
        }

        setLoading(true);
        setError(null);
        setScreenshotData(null);

        try {
            const response = await webToolsApi.takeScreenshot(processedUrl);

            if (response.data.success && response.data.screenshot) {
                setScreenshotData({
                    imageUrl: response.data.screenshot,
                    filename: response.data.filename,
                    contentType: response.data.contentType
                });
            } else {
                throw new Error(response.data.error || 'Failed to capture screenshot');
            }
        } catch (err) {
            console.error('Screenshot error:', err);
            setError(err.message || 'Failed to capture screenshot. Please try again.');
            setScreenshotData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadScreenshot = () => {
        if (!screenshotData?.imageUrl) {
            setError('No screenshot available to download');
            return;
        }

        try {
            // Create a temporary link for download
            const link = document.createElement('a');

            // Convert base64 to blob for better download handling
            const base64Data = screenshotData.imageUrl.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);

                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                byteArrays.push(new Uint8Array(byteNumbers));
            }

            const blob = new Blob(byteArrays, { type: screenshotData.contentType || 'image/png' });
            link.href = URL.createObjectURL(blob);
            link.download = screenshotData.filename || 'screenshot.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error('Download error:', err);
            setError('Failed to download screenshot');
        }
    };

    const handleAnalyze = async () => {
        if (!url.trim()) {
            setError('Please enter a URL to analyze');
            return;
        }

        setLoading(true);
        try {
            const response = await webToolsApi.analyzeSeo(url);
            setResults({
                type: 'seo',
                data: response.data
            });

            setError(null);
            setScreenshotData(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to analyze website');
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckLinks = async () => {
        if (!url.trim()) {
            setError('Please enter a URL to check links');
            return;
        }

        setLoading(true);
        try {
            const response = await webToolsApi.checkLinks(url);
            setResults({
                type: 'links',
                data: response.data
            });
            setError(null);
            setScreenshotData(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to check links');
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const formatAuditValue = (item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'number') return item.toString();
        if (item === null || item === undefined) return '';

        // Handle numeric values with units
        if (item.type === 'bytes' || item.type === 'ms' || item.type === 'timespanMs') {
            return `${item.value} ${item.type}`;
        }

        // Handle percentage values
        if (item.type === 'percent') {
            return `${item.value}%`;
        }

        // Handle specific Lighthouse object types
        if (item.type && item.value) {
            return `${item.value}`;
        }

        // Handle URL objects
        if (item.url) return item.url;
        if (item.source) return item.source;
        if (item.text) return item.text;

        // Handle other common properties
        if (item.value !== undefined) return item.value.toString();
        if (item.name) return item.name;
        if (item.label) return item.label;

        // For other objects, extract meaningful information
        const possibleProps = ['title', 'description', 'displayValue', 'snippet'];
        for (const prop of possibleProps) {
            if (item[prop]) return item[prop];
        }

        // Last resort: stringify the object
        try {
            const str = JSON.stringify(item);
            return str.length > 100 ? str.substring(0, 97) + '...' : str;
        } catch (e) {
            return '[Complex Value]';
        }
    };

    const renderSeoResults = (data) => {
        // Extract scores from the data
        const scores = {
            seo: data.scores?.seo || 0,
            performance: data.scores?.performance || 0,
            accessibility: data.scores?.accessibility || 0,
            bestPractices: data.scores?.bestPractices || 0
        };

        // Extract audits from the data
        const auditCategories = {
            seo: data.audits?.seo || [],
            performance: data.audits?.performance || [],
            accessibility: data.audits?.accessibility || [],
            bestPractices: data.audits?.bestPractices || []
        };

        // Color mapping for score ranges
        const getScoreColor = (score) => {
            if (score >= 90) return 'success';
            if (score >= 50) return 'warning';
            return 'error';
        };

        return (
            <Box>
                {/* Overall Scores */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {Object.entries(scores).map(([category, score]) => (
                        <Grid item xs={12} sm={6} md={3} key={category}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s',
                                    '&:hover': { transform: 'scale(1.05)' }
                                }}
                            >
                                <CardContent
                                    sx={{
                                        textAlign: 'center',
                                        flexGrow: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            textTransform: 'capitalize',
                                            fontWeight: 'bold',
                                            color: 'text.secondary'
                                        }}
                                    >
                                        {category.replace(/([A-Z])/g, ' $1').trim()}
                                    </Typography>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            display: 'inline-flex',
                                            alignSelf: 'center'
                                        }}
                                    >
                                        <CircularProgress
                                            variant="determinate"
                                            value={score}
                                            size={100}
                                            thickness={4}
                                            color={getScoreColor(score)}
                                            sx={{
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                borderRadius: '50%'
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                position: 'absolute',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography
                                                variant="h4"
                                                component="div"
                                                color="text.secondary"
                                                sx={{ fontWeight: 'bold' }}
                                            >
                                                {score}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Detailed Audits */}
                {Object.entries(auditCategories).map(([category, audits]) => (
                    <Box key={category} sx={{ mb: 4 }}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                                textTransform: 'capitalize',
                                fontWeight: 'bold',
                                color: 'text.primary',
                                borderBottom: '2px solid',
                                borderColor: 'divider',
                                pb: 1,
                                mb: 2
                            }}
                        >
                            {category.replace(/([A-Z])/g, ' $1').trim()} Audits
                        </Typography>
                        <Grid container spacing={2}>
                            {audits.map((audit) => (
                                <Grid item xs={12} key={audit.id}>
                                    <Card
                                        sx={{
                                            transition: 'box-shadow 0.3s',
                                            '&:hover': {
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                            }
                                        }}
                                    >
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    mb: 2
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        flex: 1,
                                                        fontWeight: 'bold',
                                                        color: 'text.primary'
                                                    }}
                                                >
                                                    {audit.title}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={
                                                        audit.scoreDisplayMode === 'binary' ?
                                                            (audit.score === 1 ? 'Passed' : 'Failed') :
                                                            `${Math.round(audit.score * 100)}%`
                                                    }
                                                    color={
                                                        audit.score === 1 ? "success" :
                                                            audit.score === 0 ? "error" : "warning"
                                                    }
                                                    sx={{ ml: 1 }}
                                                />
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                gutterBottom
                                                sx={{ mb: 2 }}
                                            >
                                                {audit.description?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')}
                                            </Typography>
                                            {audit.warnings && audit.warnings.length > 0 && (
                                                <Box sx={{ mb: 2 }}>
                                                    {audit.warnings.map((warning, index) => (
                                                        <Alert
                                                            severity="warning"
                                                            key={index}
                                                            sx={{ mb: 1 }}
                                                        >
                                                            {warning}
                                                        </Alert>
                                                    ))}
                                                </Box>
                                            )}
                                            {audit.details?.items && Array.isArray(audit.details.items) && audit.details.items.length > 0 && (
                                                <Box
                                                    sx={{
                                                        backgroundColor: 'background.paper',
                                                        borderRadius: 1,
                                                        p: 2
                                                    }}
                                                >
                                                    <Typography
                                                        variant="subtitle2"
                                                        gutterBottom
                                                        sx={{
                                                            color: 'text.secondary',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        Details:
                                                    </Typography>
                                                    <List dense>
                                                        {audit.details.items.map((item, index) => {
                                                            let displayText = '';

                                                            if (typeof item === 'string') {
                                                                displayText = item;
                                                            } else if (typeof item === 'object') {
                                                                // Ensure we only display strings
                                                                displayText = item.url || item.text || item.source ||
                                                                    (item.node?.selector) ||
                                                                    (item.node?.snippet) ||
                                                                    JSON.stringify(item, null, 2);
                                                            }

                                                            return (
                                                                <ListItem
                                                                    key={index}
                                                                    sx={{
                                                                        backgroundColor: 'background.default',
                                                                        borderRadius: 1,
                                                                        mb: 1,
                                                                        '&:last-child': { mb: 0 }
                                                                    }}
                                                                >
                                                                    <ListItemText
                                                                        primary={
                                                                            typeof displayText === 'string' ?
                                                                                displayText :
                                                                                'Invalid Data'
                                                                        }
                                                                        primaryTypographyProps={{
                                                                            variant: 'body2',
                                                                            color: 'text.secondary'
                                                                        }}
                                                                    />
                                                                </ListItem>
                                                            );
                                                        })}
                                                    </List>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Box>
        );
    };


    const renderLinkResults = (data) => (
        <Box>
            <Typography variant="h6" gutterBottom>Link Analysis</Typography>
            <Box sx={{ mb: 2 }}>
                <Chip size="small" label={`Total Links: ${data.total}`} sx={{ mr: 1 }} />
                <Chip size="small" label={`Working: ${data.working}`} color="success" sx={{ mr: 1 }} />
                <Chip size="small" label={`Broken: ${data.broken}`} color="error" sx={{ mr: 1 }} />
                <Chip size="small" label={`Internal: ${data.internal}`} sx={{ mr: 1 }} />
                <Chip size="small" label={`External: ${data.external}`} />
            </Box>
            <List>
                {data.details.map((link, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={link.text}
                            secondary={
                                <>
                                    <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                        {link.url}
                                    </Link>
                                    <br />
                                    <Chip
                                        size="small"
                                        label={link.working ? 'Working' : 'Broken'}
                                        color={link.working ? "success" : "error"}
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip size="small" label={link.type} />
                                </>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const renderScreenshot = () => {
        if (!screenshotData?.imageUrl) return null;

        return (
            <Box
                sx={{
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 1,
                    mb: 2,
                    maxHeight: '500px',
                    overflow: 'auto',
                    backgroundColor: '#f5f5f5'
                }}
            >
                <Box
                    component="img"
                    src={screenshotData.imageUrl}
                    alt="Website Screenshot"
                    sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain'
                    }}
                    onError={() => {
                        setError('Failed to load screenshot. Please try again.');
                        setScreenshotData(null);
                    }}
                />
            </Box>
        );
    };

    const renderResults = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            );
        }

        console.log(results);

        if (!results && !screenshotData) return null;

        return (
            <Box>
                {screenshotData && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                Screenshot:
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadScreenshot}
                                size="small"
                                color="primary"
                            >
                                Download Screenshot
                            </Button>
                        </Box>
                        {renderScreenshot()}
                    </Box>
                )}
                {results && (
                    results.type === 'seo' ? renderSeoResults(results.data) : renderLinkResults(results.data)
                )}
            </Box>
        );
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
                                    disabled={loading}
                                />
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleScreenshot}
                                        disabled={!url.trim() || loading}
                                        startIcon={<CameraAltIcon />}
                                    >
                                        {loading ? 'Capturing...' : 'Capture Screenshot'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleAnalyze}
                                        disabled={!url.trim() || loading}
                                        startIcon={<SearchIcon />}
                                    >
                                        {loading ? 'Analyzing...' : 'Analyze SEO'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleCheckLinks}
                                        disabled={!url.trim() || loading}
                                        startIcon={<LinkIcon />}
                                    >
                                        {loading ? 'Checking...' : 'Check Links'}
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
                                {renderResults()}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default WebTools; 