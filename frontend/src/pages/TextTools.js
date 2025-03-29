import React, { useState } from "react";
import { Box, Container, Grid, Paper, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Tab, Tabs, Alert, IconButton, Chip, Tooltip, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails, Slider } from "@mui/material";
import { ContentCopy, CompareArrows, Info, Clear, ExpandMore, Warning, CheckCircle, InfoOutlined, Search, Save, Bookmark, BookmarkBorder } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { textToolsApi } from "../services/api";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`text-tool-tabpanel-${index}`} aria-labelledby={`text-tool-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const commonPatterns = [
  {
    name: "Email",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    description: "Matches standard email addresses",
    example: "user@example.com",
  },
  {
    name: "URL",
    pattern: "^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$",
    description: "Matches URLs with or without protocol",
    example: "https://example.com",
  },
  {
    name: "Phone (US)",
    pattern: "^\\+?1?\\d{10}$",
    description: "Matches US phone numbers",
    example: "+1234567890",
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$",
    description: "Matches dates in YYYY-MM-DD format",
    example: "2024-03-28",
  },
  {
    name: "Password (8+ chars, 1 uppercase, 1 lowercase, 1 number)",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$",
    description: "Matches passwords with minimum requirements",
    example: "Password123",
  },
  {
    name: "IPv4",
    pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$",
    description: "Matches IPv4 addresses",
    example: "192.168.1.1",
  },
  {
    name: "Credit Card",
    pattern: "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\\d{3})\\d{11})$",
    description: "Matches major credit card numbers",
    example: "4111111111111111",
  },
  {
    name: "Time (24h)",
    pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
    description: "Matches time in 24-hour format",
    example: "23:59",
  },
];

const regexCategories = [
  {
    name: "Text Validation",
    patterns: [
      {
        name: "Email",
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        description: "Matches standard email addresses",
        example: "user@example.com",
        breakdown: [
          { part: "^", desc: "Start of line" },
          { part: "[a-zA-Z0-9._%+-]+", desc: "One or more letters, numbers, or special characters for username" },
          { part: "@", desc: "Literal @ symbol" },
          { part: "[a-zA-Z0-9.-]+", desc: "One or more letters, numbers, dots, or hyphens for domain" },
          { part: "\\.", desc: "Literal dot" },
          { part: "[a-zA-Z]{2,}", desc: "Two or more letters for top-level domain" },
          { part: "$", desc: "End of line" },
        ],
      },
      {
        name: "Strong Password",
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        description: "Matches strong passwords with special requirements",
        example: "StrongP@ss123",
        breakdown: [
          { part: "^", desc: "Start of line" },
          { part: "(?=.*[a-z])", desc: "Positive lookahead for at least one lowercase letter" },
          { part: "(?=.*[A-Z])", desc: "Positive lookahead for at least one uppercase letter" },
          { part: "(?=.*\\d)", desc: "Positive lookahead for at least one digit" },
          { part: "(?=.*[@$!%*?&])", desc: "Positive lookahead for at least one special character" },
          { part: "[A-Za-z\\d@$!%*?&]{8,}", desc: "At least 8 characters from the allowed set" },
          { part: "$", desc: "End of line" },
        ],
      },
      {
        name: "Username",
        pattern: "^[a-zA-Z][a-zA-Z0-9_-]{3,15}$",
        description: "Matches usernames (4-16 chars, start with letter)",
        example: "john_doe123",
        breakdown: [
          { part: "^", desc: "Start of line" },
          { part: "[a-zA-Z]", desc: "Must start with a letter" },
          { part: "[a-zA-Z0-9_-]{3,15}", desc: "3-15 characters of letters, numbers, underscore, or hyphen" },
          { part: "$", desc: "End of line" },
        ],
      },
    ],
  },
  {
    name: "Web Development",
    patterns: [
      {
        name: "URL",
        pattern: "^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w-./?%&=]*)?$",
        description: "Matches URLs with optional protocol and path",
        example: "https://example.com/path?param=value",
        breakdown: [
          { part: "^", desc: "Start of line" },
          { part: "(https?:\\/\\/)?", desc: "Optional http:// or https://" },
          { part: "([\\w-]+\\.)+", desc: "One or more subdomains with dots" },
          { part: "[\\w-]+", desc: "Main domain name" },
          { part: "(\\/[\\w-./?%&=]*)?", desc: "Optional path with query parameters" },
          { part: "$", desc: "End of line" },
        ],
      },
      {
        name: "HTML Tag",
        pattern: "<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)",
        description: "Matches HTML tags with attributes and content",
        example: '<div class="container">Content</div>',
        breakdown: [
          { part: "<", desc: "Opening angle bracket" },
          { part: "([a-z]+)", desc: "Tag name (captured)" },
          { part: "([^<]+)*", desc: "Optional attributes" },
          { part: "(?:>(.*)<\\/\\1>|\\s+\\/>)", desc: "Either self-closing or content with closing tag" },
        ],
      },
      {
        name: "CSS Color",
        pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
        description: "Matches hex color codes (3 or 6 digits)",
        example: "#FF5733",
        breakdown: [
          { part: "^#", desc: "Start with hash" },
          { part: "([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})", desc: "Either 6 hex digits or 3 hex digits" },
          { part: "$", desc: "End of line" },
        ],
      },
    ],
  },
  {
    name: "Data Formats",
    patterns: [
      {
        name: "JSON Property",
        pattern: '"([^"]+)":\\s*("[^"]*"|\\d+|true|false|null|\\{[^}]*\\}|\\[[^\\]]*\\])',
        description: "Matches JSON key-value pairs",
        example: '"name": "John"',
        breakdown: [
          { part: '"([^"]+)"', desc: "Property name in quotes" },
          { part: ":", desc: "Colon separator" },
          { part: "\\s*", desc: "Optional whitespace" },
          { part: "(...)", desc: "Various value types (string, number, boolean, null, object, array)" },
        ],
      },
      {
        name: "ISO Date",
        pattern: "^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|[+-](?:[01]\\d|2[0-3]):[0-5]\\d)$",
        description: "Matches ISO 8601 datetime format",
        example: "2024-03-28T14:30:00.000Z",
        breakdown: [
          { part: "^\\d{4}", desc: "Year (YYYY)" },
          { part: "-(?:0[1-9]|1[0-2])", desc: "Month (01-12)" },
          { part: "-(?:0[1-9]|[12]\\d|3[01])", desc: "Day (01-31)" },
          { part: "T", desc: "Time separator" },
          { part: "(?:[01]\\d|2[0-3])", desc: "Hours (00-23)" },
          { part: ":[0-5]\\d", desc: "Minutes (00-59)" },
          { part: ":[0-5]\\d", desc: "Seconds (00-59)" },
          { part: "(?:\\.\\d+)?", desc: "Optional milliseconds" },
          { part: "(?:Z|[+-](?:[01]\\d|2[0-3]):[0-5]\\d)", desc: "Timezone (Z or ±HH:mm)" },
        ],
      },
    ],
  },
  {
    name: "Numbers & Currency",
    patterns: [
      {
        name: "Currency Amount",
        pattern: "^\\$?[0-9]{1,3}(?:,?[0-9]{3})*(?:\\.[0-9]{2})?$",
        description: "Matches currency amounts with optional commas and cents",
        example: "$1,234.56",
        breakdown: [
          { part: "^\\$?", desc: "Optional dollar sign" },
          { part: "[0-9]{1,3}", desc: "First group of 1-3 digits" },
          { part: "(?:,?[0-9]{3})*", desc: "Groups of 3 digits with optional commas" },
          { part: "(?:\\.[0-9]{2})?", desc: "Optional cents (2 decimal places)" },
          { part: "$", desc: "End of line" },
        ],
      },
      {
        name: "Scientific Notation",
        pattern: "^[+-]?\\d*\\.?\\d+(?:[Ee][+-]?\\d+)?$",
        description: "Matches numbers in scientific notation",
        example: "1.23e-4",
        breakdown: [
          { part: "^[+-]?", desc: "Optional sign" },
          { part: "\\d*\\.?\\d+", desc: "Integer or decimal number" },
          { part: "(?:[Ee][+-]?\\d+)?", desc: "Optional exponent" },
          { part: "$", desc: "End of line" },
        ],
      },
    ],
  },
  {
    name: "Common Patterns",
    patterns: [
      {
        name: "Phone Number",
        pattern: "^(?:\\+?\\d{1,3}[-. ]?)?\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}$",
        description: "Matches international phone numbers",
        example: "+1 (555) 123-4567",
        breakdown: [
          { part: "^", desc: "Start of line" },
          { part: "(?:\\+?\\d{1,3}[-. ]?)?", desc: "Optional country code with separator" },
          { part: "\\(?\\d{3}\\)?", desc: "Area code with optional parentheses" },
          { part: "[-. ]?", desc: "Optional separator (hyphen, dot, or space)" },
          { part: "\\d{3}", desc: "First 3 digits" },
          { part: "[-. ]?", desc: "Optional separator" },
          { part: "\\d{4}", desc: "Last 4 digits" },
          { part: "$", desc: "End of line" },
        ],
      },
      {
        name: "Zip Code",
        pattern: "^\\d{5}(?:-\\d{4})?$",
        description: "Matches US ZIP codes with optional +4",
        example: "12345-6789",
        breakdown: [
          { part: "^\\d{5}", desc: "5-digit ZIP code" },
          { part: "(?:-\\d{4})?", desc: "Optional 4-digit extension" },
          { part: "$", desc: "End of line" },
        ],
      },
    ],
  },
];

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
  const [regexFlags, setRegexFlags] = useState("g");
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [patternDialogOpen, setPatternDialogOpen] = useState(false);
  const [highlightedText, setHighlightedText] = useState("");
  const [captureGroups, setCaptureGroups] = useState([]);
  const [regexExplanation, setRegexExplanation] = useState("");
  const [isValidRegex, setIsValidRegex] = useState(true);
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
  const [selectedPatternTab, setSelectedPatternTab] = useState(0);
  const [patternParts, setPatternParts] = useState([]);
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [showPatternLibrary, setShowPatternLibrary] = useState(false);
  const [loremType, setLoremType] = useState("paragraphs"); // "paragraphs" or "words"
  const [customCount, setCustomCount] = useState(1);
  const [markdownExample] = useState(`# Markdown Guide

## Headers
# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading

## Lists

### Unordered
* Item 1
* Item 2
  * Item 2a
  * Item 2b
* Item 3

### Ordered
1. Item 1
2. Item 2
   1. Item 2a
   2. Item 2b
3. Item 3

## Emphasis
*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

## Links
[Link Text](https://example.com)
[Link with Title](https://example.com "Title")

## Images
![Alt Text](https://example.com/image.jpg)

## Blockquotes
> This is a blockquote
> It can span multiple lines
>
> And have multiple paragraphs

## Code
Inline \`code\` has \`back-ticks around\` it.

\`\`\`javascript
// Code block
function example() {
  console.log('Hello World!');
}
\`\`\`

## Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`);

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
      const response = await textToolsApi.testRegex(inputText, regexPattern, regexFlags);
      setRegexMatches(response.data.matches);
      setRegexError(response.data.error);
      setHighlightedText(response.data.highlightedText);
      setCaptureGroups(response.data.captureGroups);
      setPatternParts(response.data.patternParts);
      setIsValidRegex(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to test regex pattern");
      setIsValidRegex(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePatternSelect = (pattern) => {
    setRegexPattern(pattern.pattern);
    setShowPatternLibrary(false);
    handleRegexTest();
  };

  const handleRegexFlagsChange = (flag) => {
    setRegexFlags((prev) => {
      if (prev.includes(flag)) {
        return prev.replace(flag, "");
      }
      return prev + flag;
    });
  };

  const handleLoremIpsum = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await textToolsApi.generateLoremIpsum(customCount, loremType);
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

  const handleSavePattern = () => {
    if (regexPattern && !savedPatterns.some((p) => p.pattern === regexPattern)) {
      const newPattern = {
        pattern: regexPattern,
        name: `Custom Pattern ${savedPatterns.length + 1}`,
        description: "User saved pattern",
      };
      setSavedPatterns([...savedPatterns, newPattern]);
    }
  };

  const handleLoremTypeChange = (e) => {
    const newType = e.target.value;
    setLoremType(newType);
    setCustomCount(newType === "paragraphs" ? 1 : 100);
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
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Regex Pattern Builder
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        label="Regular Expression Pattern"
                        value={regexPattern}
                        onChange={(e) => setRegexPattern(e.target.value)}
                        error={!isValidRegex}
                        helperText={regexError}
                        InputProps={{
                          startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
                          endAdornment: (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {regexPattern && (
                                <IconButton size="small" onClick={() => setRegexPattern("")}>
                                  <Clear />
                                </IconButton>
                              )}
                              <IconButton size="small" onClick={handleSavePattern}>
                                <Bookmark />
                              </IconButton>
                            </Box>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Flags</InputLabel>
                        <Select
                          multiple
                          value={regexFlags.split("")}
                          onChange={(e) => setRegexFlags(e.target.value.join(""))}
                          label="Flags"
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((flag) => (
                                <Chip key={flag} label={flag} size="small" color={flag === "g" ? "primary" : flag === "i" ? "secondary" : flag === "m" ? "warning" : "info"} />
                              ))}
                            </Box>
                          )}
                        >
                          <MenuItem value="g">
                            <Tooltip title="Match all occurrences">
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography>Global (g)</Typography>
                                <InfoOutlined sx={{ ml: 1, fontSize: "small" }} />
                              </Box>
                            </Tooltip>
                          </MenuItem>
                          <MenuItem value="i">
                            <Tooltip title="Case-insensitive matching">
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography>Case Insensitive (i)</Typography>
                                <InfoOutlined sx={{ ml: 1, fontSize: "small" }} />
                              </Box>
                            </Tooltip>
                          </MenuItem>
                          <MenuItem value="m">
                            <Tooltip title="Multiline mode - ^ and $ match start/end of each line">
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography>Multiline (m)</Typography>
                                <InfoOutlined sx={{ ml: 1, fontSize: "small" }} />
                              </Box>
                            </Tooltip>
                          </MenuItem>
                          <MenuItem value="s">
                            <Tooltip title="Dot matches newline characters">
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography>Single Line (s)</Typography>
                                <InfoOutlined sx={{ ml: 1, fontSize: "small" }} />
                              </Box>
                            </Tooltip>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ height: "100%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={selectedPatternTab} onChange={(e, newValue) => setSelectedPatternTab(newValue)} variant="scrollable" scrollButtons="auto">
                    {regexCategories.map((category, index) => (
                      <Tab key={index} label={category.name} />
                    ))}
                    {savedPatterns.length > 0 && <Tab label="Saved" />}
                  </Tabs>
                </Box>
                {regexCategories.map((category, index) => (
                  <TabPanel key={index} value={selectedPatternTab} index={index}>
                    <List>
                      {category.patterns.map((pattern, patternIndex) => (
                        <ListItem key={patternIndex} button onClick={() => handlePatternSelect(pattern)}>
                          <ListItemText
                            primary={pattern.name}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {pattern.description}
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                                  Example: {pattern.example}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyText(pattern.pattern);
                              }}
                            >
                              <ContentCopy />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </TabPanel>
                ))}
                {savedPatterns.length > 0 && (
                  <TabPanel value={selectedPatternTab} index={regexCategories.length}>
                    <List>
                      {savedPatterns.map((pattern, index) => (
                        <ListItem key={index} button onClick={() => handlePatternSelect(pattern)}>
                          <ListItemText primary={pattern.name} secondary={pattern.description} />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => {
                                const newPatterns = [...savedPatterns];
                                newPatterns.splice(index, 1);
                                setSavedPatterns(newPatterns);
                              }}
                            >
                              <Clear />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </TabPanel>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField fullWidth multiline rows={6} label="Test Text" value={inputText} onChange={(e) => setInputText(e.target.value)} variant="outlined" placeholder="Enter text to test against the regex pattern..." />
              <Button variant="contained" onClick={handleRegexTest} disabled={loading || !regexPattern} sx={{ mt: 2 }}>
                Test Pattern
              </Button>

              {regexPattern && inputText && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Results
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography>Test Results</Typography>
                            {regexError ? <Chip size="small" icon={<Warning />} label="Invalid Pattern" color="error" /> : regexMatches.length > 0 ? <Chip size="small" icon={<CheckCircle />} label={`${regexMatches.length} Match${regexMatches.length > 1 ? "es" : ""}`} color="success" /> : <Chip size="small" label="No Matches" color="default" />}
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {regexError ? (
                            <Alert severity="error" sx={{ mb: 2 }}>
                              {regexError}
                            </Alert>
                          ) : (
                            <>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  bgcolor: "#fafafa",
                                  border: "1px solid",
                                  borderColor: regexMatches.length > 0 ? "success.light" : "grey.300",
                                }}
                              >
                                <Box dangerouslySetInnerHTML={{ __html: highlightedText || inputText }} />
                              </Paper>

                              {regexMatches.length > 0 ? (
                                <List>
                                  {regexMatches.map((match, index) => (
                                    <ListItem key={index}>
                                      <ListItemText
                                        primary={<Typography sx={{ fontFamily: "monospace" }}>{match}</Typography>}
                                        secondary={
                                          captureGroups[index]?.length > 1 && (
                                            <Box sx={{ mt: 1 }}>
                                              {captureGroups[index].slice(1).map((group, groupIndex) => (
                                                <Chip key={groupIndex} label={`Group ${groupIndex + 1}: ${group}`} size="small" sx={{ mr: 1, mb: 1 }} />
                                              ))}
                                            </Box>
                                          )
                                        }
                                      />
                                      <ListItemSecondaryAction>
                                        <IconButton edge="end" onClick={() => handleCopyText(match)}>
                                          <ContentCopy />
                                        </IconButton>
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  ))}
                                </List>
                              ) : (
                                <Box sx={{ textAlign: "center", py: 2 }}>
                                  <Typography color="textSecondary" gutterBottom>
                                    No matches found in the test text.
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Try adjusting your pattern or checking the test text.
                                  </Typography>
                                </Box>
                              )}
                            </>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </Grid>

                    <Grid item xs={12}>
                      <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography>Pattern Explanation</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <PatternExplanation pattern={regexCategories.flatMap((cat) => cat.patterns).find((p) => p.pattern === regexPattern)} parts={patternParts} />
                          {regexFlags && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Active Flags:
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                {regexFlags.split("").map((flag) => (
                                  <Chip key={flag} label={flag === "g" ? "Global (g)" : flag === "i" ? "Case Insensitive (i)" : flag === "m" ? "Multiline (m)" : flag === "s" ? "Single Line (s)" : flag} size="small" color={flag === "g" ? "primary" : flag === "i" ? "secondary" : flag === "m" ? "warning" : "info"} />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </Grid>

                    <Grid item xs={12}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography>Quick Reference</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                              <Typography variant="subtitle2" gutterBottom>
                                Character Classes
                              </Typography>
                              <List dense>
                                <ListItem>
                                  <ListItemText primary={<Typography sx={{ fontFamily: "monospace" }}>\d</Typography>} secondary="Any digit (0-9)" />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary={<Typography sx={{ fontFamily: "monospace" }}>\w</Typography>} secondary="Word character (a-z, A-Z, 0-9, _)" />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary={<Typography sx={{ fontFamily: "monospace" }}>\s</Typography>} secondary="Whitespace character" />
                                </ListItem>
                              </List>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Typography variant="subtitle2" gutterBottom>
                                Quantifiers
                              </Typography>
                              <List dense>
                                <ListItem>
                                  <ListItemText primary={<Typography sx={{ fontFamily: "monospace" }}>*</Typography>} secondary="0 or more times" />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary={<Typography sx={{ fontFamily: "monospace" }}>+</Typography>} secondary="1 or more times" />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary={<Typography sx={{ fontFamily: "monospace" }}>?</Typography>} secondary="0 or 1 time" />
                                </ListItem>
                              </List>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Typography variant="subtitle2" gutterBottom>
                                Anchors
                              </Typography>
                              <List dense>
                                <ListItem>
                                  <ListItemText primary={<Typography sx={{ fontFamily: "monospace" }}>^</Typography>} secondary="Start of line" />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary={<Typography sx={{ fontFamily: "monospace" }}>$</Typography>} secondary="End of line" />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary={<Typography sx={{ fontFamily: "monospace" }}>\b</Typography>} secondary="Word boundary" />
                                </ListItem>
                              </List>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Generation Type</InputLabel>
                  <Select value={loremType} label="Generation Type" onChange={handleLoremTypeChange}>
                    <MenuItem value="paragraphs">Paragraphs</MenuItem>
                    <MenuItem value="words">Words</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {loremType === "paragraphs" ? "Number of Paragraphs" : "Number of Words"}
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Slider
                        value={customCount}
                        onChange={(e, newValue) => setCustomCount(newValue)}
                        min={1}
                        max={loremType === "paragraphs" ? 10 : 1000}
                        marks={
                          loremType === "paragraphs"
                            ? [
                                { value: 1, label: "1" },
                                { value: 5, label: "5" },
                                { value: 10, label: "10" },
                              ]
                            : [
                                { value: 1, label: "1" },
                                { value: 250, label: "250" },
                                { value: 500, label: "500" },
                                { value: 1000, label: "1000" },
                              ]
                        }
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        value={customCount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > 0 && value <= (loremType === "paragraphs" ? 10 : 1000)) {
                            setCustomCount(value);
                          }
                        }}
                        inputProps={{
                          min: 1,
                          max: loremType === "paragraphs" ? 10 : 1000,
                        }}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Button variant="contained" onClick={handleLoremIpsum} disabled={loading} fullWidth>
                  Generate Lorem Ipsum
                </Button>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {loremType === "paragraphs" ? "Generate between 1-10 paragraphs of Lorem Ipsum text" : "Generate between 1-1000 words of Lorem Ipsum text"}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative" }}>
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
                {outputText && (
                  <Tooltip title="Copy to Clipboard">
                    <IconButton sx={{ position: "absolute", top: 8, right: 8 }} onClick={() => handleCopyText(outputText)}>
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6">Markdown Editor</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => handleCopyText(markdownText)}>
                  Copy Markdown
                </Button>
                <Button variant="outlined" onClick={() => setMarkdownText(markdownExample)}>
                  Load Example
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ height: "100%" }}>
                <TextField
                  fullWidth
                  multiline
                  rows={25}
                  value={markdownText}
                  onChange={(e) => setMarkdownText(e.target.value)}
                  variant="outlined"
                  placeholder="Enter markdown text here..."
                  InputProps={{
                    sx: {
                      fontFamily: "monospace",
                      fontSize: "14px",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 0,
                      "& fieldset": {
                        border: "none",
                      },
                    },
                  }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  height: "100%",
                  maxHeight: "800px",
                  overflow: "auto",
                  "& h1": {
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 1,
                    mb: 2,
                  },
                  "& h2": {
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 1,
                    mb: 2,
                    mt: 3,
                  },
                  "& h3, h4, h5, h6": {
                    mt: 2,
                    mb: 1,
                  },
                  "& p": {
                    my: 1,
                    "& img": {
                      maxWidth: "100%",
                      height: "auto",
                      display: "block",
                      margin: "1rem auto",
                      borderRadius: 1,
                      boxShadow: 1,
                    },
                  },
                  "& ul, ol": {
                    pl: 3,
                    my: 1,
                  },
                  "& li": {
                    my: 0.5,
                  },
                  "& blockquote": {
                    borderLeft: "4px solid",
                    borderColor: "grey.300",
                    pl: 2,
                    py: 1,
                    my: 2,
                    bgcolor: "grey.50",
                  },
                  "& code": {
                    fontFamily: "monospace",
                    bgcolor: "grey.100",
                    p: 0.5,
                    borderRadius: 1,
                  },
                  "& pre": {
                    bgcolor: "grey.900",
                    color: "common.white",
                    p: 2,
                    borderRadius: 1,
                    overflow: "auto",
                    "& code": {
                      bgcolor: "transparent",
                    },
                  },
                  "& table": {
                    borderCollapse: "collapse",
                    width: "100%",
                    my: 2,
                    "& thead": {
                      bgcolor: "grey.50",
                    },
                    "& th, td": {
                      border: "1px solid",
                      borderColor: "divider",
                      p: 1.5,
                      textAlign: "left",
                    },
                    "& th": {
                      fontWeight: "bold",
                    },
                    "& tr:nth-of-type(even)": {
                      bgcolor: "grey.50",
                    },
                    "& tr:hover": {
                      bgcolor: "action.hover",
                    },
                  },
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                    margin: "1rem auto",
                    borderRadius: 1,
                    boxShadow: 1,
                  },
                  "& a": {
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  },
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    img: ({ node, ...props }) => (
                      <Box sx={{ my: 2 }}>
                        <img style={{ maxWidth: "100%", height: "auto" }} {...props} alt={props.alt || ""} />
                      </Box>
                    ),
                    table: ({ node, ...props }) => (
                      <Box sx={{ overflowX: "auto", my: 2 }}>
                        <table {...props} />
                      </Box>
                    ),
                  }}
                >
                  {markdownText}
                </ReactMarkdown>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}

function PatternExplanation({ pattern, parts }) {
  const selectedPattern = pattern || {
    breakdown: parts.map((p) => ({
      part: p.pattern,
      desc: p.explanation,
    })),
  };

  return (
    <Box>
      {selectedPattern.breakdown && (
        <>
          {pattern && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {pattern.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {pattern.description}
              </Typography>
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                  Example:
                </Typography>
                <Chip label={pattern.example} sx={{ fontFamily: "monospace" }} />
              </Box>
              <Divider />
            </Box>
          )}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Pattern Breakdown:
          </Typography>
          <List>
            {selectedPattern.breakdown.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        component="span"
                        sx={{
                          fontFamily: "monospace",
                          bgcolor: "grey.100",
                          p: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {item.part}
                      </Typography>
                      {parts && parts[index]?.type && <Chip size="small" label={parts[index].type} color={parts[index].type === "characterClass" ? "primary" : parts[index].type === "quantifier" ? "secondary" : parts[index].type === "anchor" ? "warning" : parts[index].type === "group" ? "info" : "default"} />}
                    </Box>
                  }
                  secondary={item.desc}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
}

export default TextTools;
