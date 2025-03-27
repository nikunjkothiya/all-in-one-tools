import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
    FormHelperText
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { dataToolsApi } from '../services/api';

const DataTools = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState('json');
    const [targetFormat, setTargetFormat] = useState('json');

    const formatExamples = {
        json: '{\n  "name": "John",\n  "age": 30\n}',
        xml: '<?xml version="1.0"?>\n<person>\n  <name>John</name>\n  <age>30</age>\n</person>',
        csv: 'name,age\nJohn,30',
        yaml: 'name: John\nage: 30'
    };

    const handleConvert = async () => {
        if (!input.trim()) {
            setError('Please enter some data to convert');
            return;
        }

        if (format === targetFormat) {
            setError('Input and target formats must be different');
            return;
        }

        setLoading(true);
        try {
            const response = await dataToolsApi.convertData(input, format, targetFormat);
            setOutput(response.data.converted);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to convert data');
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
            if (response.data.valid) {
                setOutput(response.data.message);
                setError(null);
            } else {
                setError(response.data.message);
                setOutput(response.data.errors.join('\n'));
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to validate data');
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
            setOutput(response.data.transformed);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to transform data');
            setOutput('');
        } finally {
            setLoading(false);
        }
    };

    const handleFormatChange = (e) => {
        const newFormat = e.target.value;
        setFormat(newFormat);
        setInput(input.trim() ? input : formatExamples[newFormat]);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Data Tools
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Convert, validate, and transform data between different formats. Select your input format, paste your data, and choose an operation.
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
                                    <InputLabel>Input Format</InputLabel>
                                    <Select
                                        value={format}
                                        label="Input Format"
                                        onChange={handleFormatChange}
                                    >
                                        <MenuItem value="json">JSON</MenuItem>
                                        <MenuItem value="xml">XML</MenuItem>
                                        <MenuItem value="csv">CSV</MenuItem>
                                        <MenuItem value="yaml">YAML</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        Select the format of your input data
                                    </FormHelperText>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Enter ${format.toUpperCase()} data or click the format dropdown for an example`}
                                    helperText={`Enter valid ${format.toUpperCase()} data`}
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
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Target Format</InputLabel>
                                    <Select
                                        value={targetFormat}
                                        label="Target Format"
                                        onChange={(e) => setTargetFormat(e.target.value)}
                                    >
                                        <MenuItem value="json">JSON</MenuItem>
                                        <MenuItem value="xml">XML</MenuItem>
                                        <MenuItem value="csv">CSV</MenuItem>
                                        <MenuItem value="yaml">YAML</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        Select the format you want to convert to
                                    </FormHelperText>
                                </FormControl>
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
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                            <Tooltip title={`Convert from ${format.toUpperCase()} to ${targetFormat.toUpperCase()}`}>
                                <Button
                                    variant="contained"
                                    onClick={handleConvert}
                                    disabled={!input.trim() || loading || format === targetFormat}
                                >
                                    Convert Format
                                </Button>
                            </Tooltip>
                            <Tooltip title={`Check if your input is valid ${format.toUpperCase()}`}>
                                <Button
                                    variant="contained"
                                    onClick={handleValidate}
                                    disabled={!input.trim() || loading}
                                >
                                    Validate Data
                                </Button>
                            </Tooltip>
                            <Tooltip title={`Transform data while keeping ${format.toUpperCase()} format (e.g., prettify JSON)`}>
                                <Button
                                    variant="contained"
                                    onClick={handleTransform}
                                    disabled={!input.trim() || loading}
                                >
                                    Transform Data
                                </Button>
                            </Tooltip>
                        </Box>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                <InfoIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                                Hover over the buttons to see what each operation does
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default DataTools; 