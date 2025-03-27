import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { developerToolsApi } from '../services/api';

const DeveloperTools = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formatType, setFormatType] = useState('json');

    const handleFormat = async () => {
        if (!input.trim()) {
            setError('Please enter some input to format');
            return;
        }

        setLoading(true);
        try {
            const response = await developerToolsApi.formatCode(input, formatType);
            setOutput(response.formatted);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to format code');
            setOutput('');
        } finally {
            setLoading(false);
        }
    };

    const handleMinify = async () => {
        if (!input.trim()) {
            setError('Please enter some input to minify');
            return;
        }

        setLoading(true);
        try {
            const response = await developerToolsApi.minifyCode(input, formatType);
            setOutput(response.minified);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to minify code');
            setOutput('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Developer Tools
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
                                    Input
                                </Typography>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Format Type</InputLabel>
                                    <Select
                                        value={formatType}
                                        label="Format Type"
                                        onChange={(e) => setFormatType(e.target.value)}
                                    >
                                        <MenuItem value="json">JSON</MenuItem>
                                        <MenuItem value="html">HTML</MenuItem>
                                        <MenuItem value="css">CSS</MenuItem>
                                        <MenuItem value="javascript">JavaScript</MenuItem>
                                        <MenuItem value="xml">XML</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter code or text to format..."
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Output
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    value={output}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={handleFormat}
                                disabled={!input.trim() || loading}
                            >
                                Format
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleMinify}
                                disabled={!input.trim() || loading}
                            >
                                Minify
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default DeveloperTools; 