import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { AutoFixHigh, CheckCircleOutline, Compress, ContentCopy } from "@mui/icons-material";
import { developerToolsApi } from "../services/api";
import ToolPageHeader from "../components/ToolPageHeader";

const codeExamples = {
  json: '{\n  "name":"All In One Tools","tools":["formatter","validator"],"active":true\n}',
  html: "<div><h1>Hello</h1><p>Developer tools are ready.</p></div>",
  css: "body{margin:0;font-family:sans-serif}.card{padding:16px;border-radius:12px}",
  js: "const tools=['format','minify','validate'];console.log(tools.join(', '));",
};

const formatLabels = {
  json: "JSON",
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
};

const operationMeta = [
  {
    label: "Formatter",
    icon: <AutoFixHigh fontSize="small" />,
    description: "Beautify JSON, HTML, CSS, and JavaScript for easier reading and editing.",
  },
  {
    label: "Minifier",
    icon: <Compress fontSize="small" />,
    description: "Reduce payload size before deployment or sharing snippets.",
  },
  {
    label: "Validator",
    icon: <CheckCircleOutline fontSize="small" />,
    description: "Quick syntax checks for common developer-facing formats.",
  },
];

const parseErrorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0]?.msg ||
  error?.message ||
  fallback;

function DeveloperTools() {
  const [activeTab, setActiveTab] = useState(0);
  const [format, setFormat] = useState("json");
  const [input, setInput] = useState(codeExamples.json);
  const [output, setOutput] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const pageTitle = useMemo(() => operationMeta[activeTab], [activeTab]);

  const handleFormatChange = (event) => {
    const nextFormat = event.target.value;
    setFormat(nextFormat);
    setInput(codeExamples[nextFormat]);
    setOutput("");
    setValidationResult(null);
    setError(null);
    setSuccess(null);
  };

  const handleTabChange = (_, nextValue) => {
    setActiveTab(nextValue);
    setOutput("");
    setValidationResult(null);
    setError(null);
    setSuccess(null);
  };

  const handleRun = async () => {
    if (!input.trim()) {
      setError("Please enter code before running the tool.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setOutput("");
    setValidationResult(null);

    try {
      if (activeTab === 0) {
        const response = await developerToolsApi.formatCode(input, format);
        setOutput(response.data.formatted);
        setSuccess(`${formatLabels[format]} formatted successfully.`);
      } else if (activeTab === 1) {
        const response = await developerToolsApi.minifyCode(input, format);
        setOutput(response.data.minified);
        setSuccess(`${formatLabels[format]} minified successfully.`);
      } else {
        const response = await developerToolsApi.validateCode(input, format);
        setValidationResult(response.data);
        setSuccess(response.data.valid ? `${formatLabels[format]} is valid.` : "Validation completed with issues.");
      }
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Developer tool request failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (value) => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setSuccess("Copied to clipboard.");
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        <ToolPageHeader
          title="Developer Tools"
          description="Format, minify, and validate the snippets developers use every day without leaving the dashboard."
          chips={[formatLabels[format], pageTitle.label]}
        />

        {(error || success) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }} onClose={() => (error ? setError(null) : setSuccess(null))}>
            {error || success}
          </Alert>
        )}

        <Paper sx={{ p: 1, mb: 2, borderRadius: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {operationMeta.map((item) => (
              <Tab key={item.label} label={item.label} icon={item.icon} iconPosition="start" />
            ))}
          </Tabs>
        </Paper>

        <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 2, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {pageTitle.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pageTitle.description}
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Code Type</InputLabel>
              <Select value={format} label="Code Type" onChange={handleFormatChange}>
                {Object.entries(formatLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                minRows={18}
                label={`${formatLabels[format]} Input`}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                InputProps={{
                  style: {
                    fontFamily: "monospace",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              {activeTab === 2 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    minHeight: 380,
                    borderRadius: 2.5,
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Validation Result
                  </Typography>
                  {validationResult ? (
                    <Stack spacing={1.5}>
                      <Alert severity={validationResult.valid ? "success" : "warning"}>
                        {validationResult.valid ? "The snippet passed validation." : validationResult.message || "The snippet did not validate cleanly."}
                      </Alert>
                      {validationResult.message ? (
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {validationResult.message}
                        </Typography>
                      ) : null}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Run the validator to inspect the current snippet.
                    </Typography>
                  )}
                </Paper>
              ) : (
                <TextField
                  fullWidth
                  multiline
                  minRows={18}
                  label="Output"
                  value={output}
                  InputProps={{
                    readOnly: true,
                    style: {
                      fontFamily: "monospace",
                    },
                  }}
                />
              )}
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleRun} disabled={loading}>
              {loading ? "Running..." : pageTitle.label}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={() => handleCopy(activeTab === 2 ? JSON.stringify(validationResult, null, 2) : output)}
              disabled={activeTab === 2 ? !validationResult : !output}
            >
              Copy Result
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setInput(codeExamples[format]);
                setOutput("");
                setValidationResult(null);
                setError(null);
                setSuccess(null);
              }}
            >
              Reset Example
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}

export default DeveloperTools;
