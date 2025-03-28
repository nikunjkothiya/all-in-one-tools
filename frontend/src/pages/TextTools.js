import React, { useState } from "react";
import { Box, Container, Grid, Paper, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Tab, Tabs, Alert, IconButton, Chip, Tooltip, Divider } from "@mui/material";
import { ContentCopy, CompareArrows, Info, Clear } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { textToolsApi } from "../services/api";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
    <div role="tabpanel" hidden={value !== index} id={`text-tool-tabpanel-${index}`} aria-labelledby={`text-tool-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function TextTools() {
    const [tabValue, setTabValue] = useState(0);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [caseType, setCaseType] = useState("uppercase");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffResult, setDiffResult] = useState([]);
  const [regexPattern, setRegexPattern] = useState("");
  const [regexMatches, setRegexMatches] = useState([]);
  const [regexError, setRegexError] = useState("");
  const [paragraphs, setParagraphs] = useState(1);
  const [markdownText, setMarkdownText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [diffStats, setDiffStats] = useState({
    additions: 0,
    deletions: 0,
    changes: 0,
    totalDiffs: 0,
  });
  const [diffMode, setDiffMode] = useState("line"); // "line", "word", "char"
  const [showLineNumbers, setShowLineNumbers] = useState(true);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    setError("");
    };

    const handleCaseConversion = () => {
        switch (caseType) {
      case "uppercase":
                setOutputText(inputText.toUpperCase());
                break;
      case "lowercase":
                setOutputText(inputText.toLowerCase());
                break;
      case "titlecase":
                setOutputText(
                    inputText
            .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")
                );
                break;
            default:
                setOutputText(inputText);
        }
    };

  const handleTextDiff = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await textToolsApi.compareText(text1, text2, diffMode);
      setDiffResult(response.data.differences);
      setDiffStats(response.data.stats);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to compare texts");
    } finally {
      setLoading(false);
    }
  };

  const handleRegexTest = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await textToolsApi.testRegex(inputText, regexPattern);
      setRegexMatches(response.data.matches);
      setRegexError(response.data.error);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to test regex");
    } finally {
      setLoading(false);
    }
  };

  const handleLoremIpsum = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await textToolsApi.generateLoremIpsum(paragraphs);
      setOutputText(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate Lorem Ipsum");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkdownPreview = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await textToolsApi.previewMarkdown(markdownText);
      setOutputText(response.data.html);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to preview markdown");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSwapTexts = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
  };

  const handleClearTexts = () => {
    setText1("");
    setText2("");
    setDiffResult([]);
    setDiffStats({
      additions: 0,
      deletions: 0,
      changes: 0,
      totalDiffs: 0,
    });
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                Text Tools
            </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: "100%", mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="text tools tabs">
                    <Tab label="Case Converter" />
                    <Tab label="Text Diff" />
                    <Tab label="Regex Tester" />
                    <Tab label="Lorem Ipsum" />
                    <Tab label="Markdown Preview" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
              <TextField fullWidth multiline rows={6} label="Input Text" value={inputText} onChange={(e) => setInputText(e.target.value)} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                <FormControl sx={{ mb: 2 }}>
                                    <InputLabel>Case Type</InputLabel>
                  <Select value={caseType} label="Case Type" onChange={(e) => setCaseType(e.target.value)}>
                                        <MenuItem value="uppercase">UPPERCASE</MenuItem>
                                        <MenuItem value="lowercase">lowercase</MenuItem>
                                        <MenuItem value="titlecase">Title Case</MenuItem>
                                    </Select>
                                </FormControl>
                <Button variant="contained" onClick={handleCaseConversion} sx={{ mb: 2 }}>
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Diff Mode</InputLabel>
                  <Select value={diffMode} label="Diff Mode" onChange={(e) => setDiffMode(e.target.value)}>
                    <MenuItem value="line">Line by Line</MenuItem>
                    <MenuItem value="word">Word by Word</MenuItem>
                    <MenuItem value="char">Character by Character</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={() => setShowLineNumbers(!showLineNumbers)} startIcon={<Info />}>
                  {showLineNumbers ? "Hide Line Numbers" : "Show Line Numbers"}
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Swap Texts">
                  <IconButton onClick={handleSwapTexts} color="primary">
                    <CompareArrows />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear All">
                  <IconButton onClick={handleClearTexts} color="error">
                    <Clear />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative" }}>
                <TextField fullWidth multiline rows={10} label="First Text" value={text1} onChange={(e) => setText1(e.target.value)} variant="outlined" placeholder="Enter or paste your first text here..." />
                <Tooltip title="Copy Text">
                  <IconButton sx={{ position: "absolute", top: 8, right: 8 }} onClick={() => handleCopyText(text1)}>
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative" }}>
                <TextField fullWidth multiline rows={10} label="Second Text" value={text2} onChange={(e) => setText2(e.target.value)} variant="outlined" placeholder="Enter or paste your second text here..." />
                <Tooltip title="Copy Text">
                  <IconButton sx={{ position: "absolute", top: 8, right: 8 }} onClick={() => handleCopyText(text2)}>
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <Button variant="contained" onClick={handleTextDiff} disabled={loading || !text1 || !text2}>
                  Compare Texts
                </Button>
                {diffResult.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip label={`${diffStats.additions} Additions`} color="success" variant="outlined" />
                    <Chip label={`${diffStats.deletions} Deletions`} color="error" variant="outlined" />
                    <Chip label={`${diffStats.changes} Changes`} color="warning" variant="outlined" />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  maxHeight: "500px",
                  overflow: "auto",
                  bgcolor: "#fafafa",
                  ...(diffResult.length === 0 && {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "200px",
                  }),
                }}
              >
                {diffResult.length === 0 ? (
                  <Typography color="textSecondary">Enter text in both fields and click "Compare Texts" to see the differences</Typography>
                ) : (
                  diffResult.map((diff, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1,
                        my: 0.5,
                        borderRadius: 1,
                        fontFamily: "monospace",
                        fontSize: "14px",
                        bgcolor: diff.type === "add" ? "success.light" : diff.type === "remove" ? "error.light" : "warning.light",
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                      }}
                    >
                      {showLineNumbers && (
                        <Typography
                          sx={{
                            color: "text.secondary",
                            minWidth: "3em",
                            textAlign: "right",
                            mr: 2,
                            userSelect: "none",
                          }}
                        >
                          {diff.lineNumber || index + 1}
                        </Typography>
                      )}
                      <Box sx={{ flexGrow: 1 }}>
                        {diff.type === "change" ? (
                          <>
                            <Box sx={{ color: "error.dark", mb: 0.5 }}>- {diff.oldLine}</Box>
                            <Box sx={{ color: "success.dark" }}>+ {diff.newLine}</Box>
                          </>
                        ) : (
                          <Box
                            sx={{
                              color: diff.type === "add" ? "success.dark" : "error.dark",
                            }}
                          >
                            {diff.type === "add" ? "+ " : "- "}
                            {diff.line}
                          </Box>
                        )}
                      </Box>
                      <Tooltip title="Copy Text">
                        <IconButton size="small" onClick={() => handleCopyText(diff.type === "change" ? `${diff.oldLine}\n${diff.newLine}` : diff.line)}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))
                )}
              </Paper>
            </Grid>
          </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth multiline rows={6} label="Test Text" value={inputText} onChange={(e) => setInputText(e.target.value)} variant="outlined" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Regex Pattern" value={regexPattern} onChange={(e) => setRegexPattern(e.target.value)} variant="outlined" sx={{ mb: 2 }} />
              <Button variant="contained" onClick={handleRegexTest} disabled={loading} sx={{ mb: 2 }}>
                Test Regex
              </Button>
              {regexError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {regexError}
                </Alert>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Matches ({regexMatches.length}):
                  </Typography>
                  {regexMatches.map((match, index) => (
                    <Typography key={index} sx={{ ml: 2 }}>
                      {match}
                    </Typography>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Number of Paragraphs</InputLabel>
                <Select value={paragraphs} label="Number of Paragraphs" onChange={(e) => setParagraphs(e.target.value)}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={handleLoremIpsum} disabled={loading}>
                Generate Lorem Ipsum
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={10}
                label="Generated Text"
                value={outputText}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
              />
            </Grid>
          </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth multiline rows={10} label="Markdown Text" value={markdownText} onChange={(e) => setMarkdownText(e.target.value)} variant="outlined" />
              <Button variant="contained" onClick={handleMarkdownPreview} disabled={loading} sx={{ mt: 2 }}>
                Preview
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 2,
                  minHeight: "300px",
                  maxHeight: "500px",
                  overflow: "auto",
                }}
              >
                <ReactMarkdown>{markdownText}</ReactMarkdown>
              </Paper>
            </Grid>
          </Grid>
                </TabPanel>
            </Paper>
        </Container>
    );
}

export default TextTools; 
