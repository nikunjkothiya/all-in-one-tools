import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { privacyToolsApi } from '../services/api';

const PrivacyTools = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [algorithm, setAlgorithm] = useState('aes-256-cbc');
    const [key, setKey] = useState('');

    const handleEncrypt = async () => {
        if (!input.trim()) {
            setError('Please enter some text to encrypt');
            return;
        }

        setLoading(true);
        try {
            const response = await privacyToolsApi.encryptText(input, algorithm, key);
            setOutput(JSON.stringify(response, null, 2));
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to encrypt text');
            setOutput('');
        } finally {
            setLoading(false);
        }
    };

    const handleDecrypt = async () => {
        if (!input.trim()) {
            setError('Please enter encrypted text to decrypt');
            return;
        }

        setLoading(true);
        try {
            const response = await privacyToolsApi.decryptText(input, key, algorithm);
            setOutput(response.decrypted);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to decrypt text');
            setOutput('');
        } finally {
            setLoading(false);
        }
    };

    const handleHash = async () => {
        if (!input.trim()) {
            setError('Please enter a password to hash');
            return;
        }

        setLoading(true);
        try {
            const response = await privacyToolsApi.hashPassword(input, algorithm);
            setOutput(JSON.stringify(response, null, 2));
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to hash password');
            setOutput('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Privacy Tools
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
                                    <InputLabel>Algorithm</InputLabel>
                                    <Select
                                        value={algorithm}
                                        label="Algorithm"
                                        onChange={(e) => setAlgorithm(e.target.value)}
                                    >
                                        <MenuItem value="aes-256-cbc">AES-256-CBC</MenuItem>
                                        <MenuItem value="aes-256-gcm">AES-256-GCM</MenuItem>
                                        <MenuItem value="des-ede3-cbc">DES-EDE3-CBC</MenuItem>
                                        <MenuItem value="sha256">SHA-256</MenuItem>
                                        <MenuItem value="sha512">SHA-512</MenuItem>
                                        <MenuItem value="bcrypt">BCrypt</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="Key (optional)"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter text to process..."
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
                                onClick={handleEncrypt}
                                disabled={!input.trim() || loading}
                            >
                                Encrypt Text
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleDecrypt}
                                disabled={!input.trim() || loading}
                            >
                                Decrypt Text
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleHash}
                                disabled={!input.trim() || loading}
                            >
                                Hash Password
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default PrivacyTools; 