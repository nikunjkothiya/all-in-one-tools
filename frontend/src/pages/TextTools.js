import React, { useState } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tab,
    Tabs,
} from '@mui/material';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`text-tool-tabpanel-${index}`}
            aria-labelledby={`text-tool-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function TextTools() {
    const [tabValue, setTabValue] = useState(0);
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [caseType, setCaseType] = useState('uppercase');

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCaseConversion = () => {
        switch (caseType) {
            case 'uppercase':
                setOutputText(inputText.toUpperCase());
                break;
            case 'lowercase':
                setOutputText(inputText.toLowerCase());
                break;
            case 'titlecase':
                setOutputText(
                    inputText
                        .split(' ')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ')
                );
                break;
            default:
                setOutputText(inputText);
        }
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                Text Tools
            </Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="text tools tabs"
                >
                    <Tab label="Case Converter" />
                    <Tab label="Text Diff" />
                    <Tab label="Regex Tester" />
                    <Tab label="Lorem Ipsum" />
                    <Tab label="Markdown Preview" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                label="Input Text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <FormControl sx={{ mb: 2 }}>
                                    <InputLabel>Case Type</InputLabel>
                                    <Select
                                        value={caseType}
                                        label="Case Type"
                                        onChange={(e) => setCaseType(e.target.value)}
                                    >
                                        <MenuItem value="uppercase">UPPERCASE</MenuItem>
                                        <MenuItem value="lowercase">lowercase</MenuItem>
                                        <MenuItem value="titlecase">Title Case</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    onClick={handleCaseConversion}
                                    sx={{ mb: 2 }}
                                >
                                    Convert
                                </Button>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={6}
                                    label="Output Text"
                                    value={outputText}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    variant="outlined"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography>Text Diff Tool - Coming Soon</Typography>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Typography>Regex Tester - Coming Soon</Typography>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <Typography>Lorem Ipsum Generator - Coming Soon</Typography>
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                    <Typography>Markdown Preview - Coming Soon</Typography>
                </TabPanel>
            </Paper>
        </Container>
    );
}

export default TextTools; 