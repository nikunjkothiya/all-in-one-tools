import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField, Alert, Select, MenuItem, FormControl, InputLabel, Divider } from '@mui/material';
import { privacyToolsApi } from '../services/api';

// Algorithm categories and descriptions
const ALGORITHMS = {
    encryption: {
        title: 'Encryption Algorithms',
        description: 'Use these algorithms when you need to encrypt data that can be decrypted later',
        algorithms: {
            'aes-256-cbc': {
                name: 'AES-256-CBC',
                description: 'Strong encryption, suitable for most sensitive data. Requires a key and IV.',
                keyRequired: true
            },
            'aes-256-gcm': {
                name: 'AES-256-GCM',
                description: 'Advanced encryption with additional authentication. Best for secure communications.',
                keyRequired: true
            },
            'des-ede3-cbc': {
                name: 'DES-EDE3-CBC',
                description: 'Legacy encryption algorithm. Use AES instead for new applications.',
                keyRequired: true
            }
        }
    },
    hashing: {
        title: 'Hashing Algorithms',
        description: 'Use these algorithms for one-way hashing (cannot be reversed)',
        algorithms: {
            'sha256': {
                name: 'SHA-256',
                description: 'Fast, secure hash. Good for file integrity checks and digital signatures.',
                keyRequired: false
            },
            'sha512': {
                name: 'SHA-512',
                description: 'Stronger variant of SHA-256. Best for highly sensitive data hashing.',
                keyRequired: false
            },
            'bcrypt': {
                name: 'BCrypt',
                description: 'Specifically designed for password hashing. Includes salt automatically.',
                keyRequired: false
            }
        }
    }
};

const PrivacyTools = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [algorithm, setAlgorithm] = useState('aes-256-cbc');
    const [key, setKey] = useState('');

    // Helper function to determine if current algorithm is for encryption
    const isEncryptionAlgorithm = () => {
        return Object.keys(ALGORITHMS.encryption.algorithms).includes(algorithm);
    };

    // Helper function to determine if current algorithm is for hashing
    const isHashingAlgorithm = () => {
        return Object.keys(ALGORITHMS.hashing.algorithms).includes(algorithm);
    };

    // Helper function to get current algorithm info
    const getCurrentAlgorithmInfo = () => {
        for (const category of Object.values(ALGORITHMS)) {
            if (algorithm in category.algorithms) {
                return category.algorithms[algorithm];
            }
        }
        return null;
    };

    const handleEncrypt = async () => {
        if (!input.trim()) {
            setError('Please enter some text to encrypt');
            return;
        }
        if (getCurrentAlgorithmInfo()?.keyRequired && !key) {
            setError('Please enter an encryption key');
            return;
        }

        setLoading(true);
        try {
            const response = await privacyToolsApi.encryptText(input, algorithm, key);
            const encryptionOutput = {
                encrypted: response.data.encrypted,
                iv: response.data.iv
            };
            setOutput(JSON.stringify(encryptionOutput, null, 2));
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
        if (getCurrentAlgorithmInfo()?.keyRequired && !key) {
            setError('Please enter the decryption key');
            return;
        }

        setLoading(true);
        try {
            let encryptedText, iv;
            try {
                const parsedInput = JSON.parse(input);
                encryptedText = parsedInput.encrypted;
                iv = parsedInput.iv;
                if (!encryptedText || !iv) {
                    throw new Error('Invalid format');
                }
            } catch (e) {
                throw new Error(`For decryption, please paste the complete JSON output from encryption. Example format:
{
    "encrypted": "abc123...",
    "iv": "xyz789..."
}`);
            }

            const response = await privacyToolsApi.decryptText(encryptedText, key, algorithm, iv);
            setOutput(response.data.decrypted);
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
            setError('Please enter text to hash');
            return;
        }

        setLoading(true);
        try {
            const response = await privacyToolsApi.hashPassword(input, algorithm);
            setOutput(response.data.hashed);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to hash text');
            setOutput('');
        } finally {
            setLoading(false);
        }
    };

    const algorithmInfo = getCurrentAlgorithmInfo();

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
                                        onChange={(e) => {
                                            setAlgorithm(e.target.value);
                                            // Clear output and error when algorithm changes
                                            setOutput('');
                                            setError(null);
                                            // Clear key if switching to hashing algorithm
                                            if (!ALGORITHMS.encryption.algorithms[e.target.value]) {
                                                setKey('');
                                            }
                                        }}
                                    >
                                        {Object.entries(ALGORITHMS).map(([categoryKey, category]) => [
                                            <MenuItem
                                                key={`header-${categoryKey}`}
                                                disabled
                                                sx={{
                                                    opacity: 1,
                                                    fontWeight: 'bold',
                                                    backgroundColor: 'background.default',
                                                    '&:hover': {
                                                        backgroundColor: 'background.default',
                                                    }
                                                }}
                                            >
                                                {category.title}
                                            </MenuItem>,
                                            Object.entries(category.algorithms).map(([value, algo]) => (
                                                <MenuItem
                                                    key={value}
                                                    value={value}
                                                    sx={{
                                                        pl: 4,
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover',
                                                        }
                                                    }}
                                                >
                                                    {algo.name}
                                                </MenuItem>
                                            )),
                                            <Divider key={`divider-${categoryKey}`} />
                                        ]).flat()}
                                    </Select>
                                </FormControl>

                                {algorithmInfo && (
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        {algorithmInfo.description}
                                    </Alert>
                                )}

                                {algorithmInfo?.keyRequired && (
                                    <TextField
                                        fullWidth
                                        label="Encryption Key"
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        required
                                        helperText={
                                            algorithm === 'des-ede3-cbc'
                                                ? "For DES encryption, key must be at least 24 characters long"
                                                : "Required for encryption/decryption"
                                        }
                                        error={algorithm === 'des-ede3-cbc' && key.length > 0 && key.length < 24}
                                        sx={{ mb: 2 }}
                                    />
                                )}

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        isEncryptionAlgorithm()
                                            ? 'Enter text to encrypt or paste encrypted JSON for decryption'
                                            : 'Enter text to hash'
                                    }
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
                                disabled={!input.trim() || loading || !isEncryptionAlgorithm()}
                            >
                                Encrypt Text
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleDecrypt}
                                disabled={!input.trim() || loading || !isEncryptionAlgorithm()}
                            >
                                Decrypt Text
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleHash}
                                disabled={!input.trim() || loading || !isHashingAlgorithm()}
                            >
                                Hash Text
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default PrivacyTools; 