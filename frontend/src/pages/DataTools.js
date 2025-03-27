import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { dataToolsApi } from '../services/api';

const DataTools = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState('json');

    const handleConvert = async () => {
        if (!input.trim()) {
            setError('Please enter some data to convert');
            return;
        }

        setLoading(true);
        try {
            const response = await dataToolsApi.convertData(input, format);
            setOutput(response.converted);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to convert data');
            setOutput('');
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!input.trim()) {
            setError('Please enter some data to validate');
            return;
        }

        setLoading(true);
        try {
            const response = await dataToolsApi.validateData(input, format);
            setOutput(JSON.stringify(response, null, 2));
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to validate data');
            setOutput('');
        } finally {
            setLoading(false);
        }
    };

    const handleTransform = async () => {
        if (!input.trim()) {
            setError('Please enter some data to transform');
            return;
        }

        setLoading(true);
        try {
            const response = await dataToolsApi.transformData(input, format);
            setOutput(response.transformed);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to transform data');
            setOutput('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Data Tools
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
                                    <InputLabel>Data Format</InputLabel>
                                    <Select
                                        value={format}
                                        label="Data Format"
                                        onChange={(e) => setFormat(e.target.value)}
                                    >
                                        <MenuItem value="json">JSON</MenuItem>
                                        <MenuItem value="xml">XML</MenuItem>
                                        <MenuItem value="csv">CSV</MenuItem>
                                        <MenuItem value="yaml">YAML</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter data to process..."
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
                                onClick={handleConvert}
                                disabled={!input.trim() || loading}
                            >
                                Convert Format
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleValidate}
                                disabled={!input.trim() || loading}
                            >
                                Validate Data
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleTransform}
                                disabled={!input.trim() || loading}
                            >
                                Transform Data
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default DataTools; 