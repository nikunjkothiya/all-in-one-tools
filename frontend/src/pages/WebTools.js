import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  CameraAlt,
  ContentCopy,
  Download,
  Insights,
  Link as LinkIcon,
  Lock,
  Search,
  Speed,
  TravelExplore,
} from "@mui/icons-material";
import { webToolsApi } from "../services/api";
import ToolPageHeader from "../components/ToolPageHeader";

const toolTabs = [
  { label: "Screenshot", icon: <CameraAlt fontSize="small" /> },
  { label: "SEO Audit", icon: <Search fontSize="small" /> },
  { label: "Link Checker", icon: <LinkIcon fontSize="small" /> },
  { label: "Short URL", icon: <TravelExplore fontSize="small" /> },
  { label: "Metadata", icon: <Insights fontSize="small" /> },
  { label: "Performance", icon: <Speed fontSize="small" /> },
  { label: "SSL", icon: <Lock fontSize="small" /> },
  { label: "Robots", icon: <Search fontSize="small" /> },
  { label: "Overview", icon: <Insights fontSize="small" /> },
];

const scoreColor = (score) => {
  if (score >= 90) {
    return "success";
  }
  if (score >= 50) {
    return "warning";
  }
  return "error";
};

const parseErrorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const normalizeUrl = (value) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return "";
  }

  return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
};

const JsonPanel = ({ title, data }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: 3,
      bgcolor: "grey.50",
      minHeight: 300,
    }}
  >
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
      {title}
    </Typography>
    <Box
      component="pre"
      sx={{
        m: 0,
        overflowX: "auto",
        fontFamily: "monospace",
        fontSize: 13,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </Box>
  </Paper>
);

function WebTools() {
  const [activeTab, setActiveTab] = useState(0);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [result, setResult] = useState(null);
  const [screenshotData, setScreenshotData] = useState(null);
  const [shortUrl, setShortUrl] = useState("");

  const activeLabel = useMemo(() => toolTabs[activeTab].label, [activeTab]);

  const clearOutputs = () => {
    setResult(null);
    setScreenshotData(null);
    setShortUrl("");
  };

  const handleTabChange = (_, nextValue) => {
    setActiveTab(nextValue);
    setError(null);
    setSuccess(null);
    clearOutputs();
  };

  const runTool = async () => {
    const processedUrl = normalizeUrl(url);

    if (!processedUrl) {
      setError("Please enter a valid URL first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    clearOutputs();

    try {
      if (activeTab === 0) {
        const response = await webToolsApi.takeScreenshot(processedUrl);
        const data = response.data;

        if (!data.success || !data.screenshot) {
          throw new Error(data.error || "Screenshot capture failed.");
        }

        setScreenshotData({
          imageUrl: data.screenshot,
          filename: data.filename,
          contentType: data.contentType,
        });
        setSuccess("Screenshot captured successfully.");
      } else if (activeTab === 1) {
        const response = await webToolsApi.analyzeSeo(processedUrl);
        setResult(response.data);
        setSuccess("SEO audit completed.");
      } else if (activeTab === 2) {
        const response = await webToolsApi.checkLinks(processedUrl);
        setResult(response.data);
        setSuccess("Link check completed.");
      } else if (activeTab === 3) {
        const response = await webToolsApi.shortenUrl(processedUrl);
        setShortUrl(response.data.shortened);
        setSuccess("Short URL created.");
      } else if (activeTab === 4) {
        const response = await webToolsApi.scrapeMetadata(processedUrl);
        setResult(response.data);
        setSuccess("Metadata loaded.");
      } else if (activeTab === 5) {
        const response = await webToolsApi.analyzePerformance(processedUrl);
        setResult(response.data);
        setSuccess("Performance headers analyzed.");
      } else if (activeTab === 6) {
        const response = await webToolsApi.checkSsl(processedUrl);
        setResult(response.data);
        setSuccess("SSL certificate loaded.");
      } else if (activeTab === 7) {
        const response = await webToolsApi.parseRobots(processedUrl);
        setResult(response.data);
        setSuccess(response.data.exists ? "Robots.txt parsed." : "No robots.txt file was found for this site.");
      } else {
        const response = await webToolsApi.analyzeWebsite(processedUrl);
        setResult(response.data.analysis);
        setSuccess("Website overview completed.");
      }
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Web tool request failed."));
    } finally {
      setLoading(false);
    }
  };

  const copyValue = async (value) => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setSuccess("Copied to clipboard.");
  };

  const downloadScreenshot = () => {
    if (!screenshotData?.imageUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = screenshotData.imageUrl;
    link.download = screenshotData.filename || "website-screenshot.jpg";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const renderSeoResults = (data) => {
    const scores = {
      seo: data.scores?.seo || 0,
      performance: data.scores?.performance || 0,
      accessibility: data.scores?.accessibility || 0,
      bestPractices: data.scores?.bestPractices || 0,
    };

    return (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          {Object.entries(scores).map(([label, score]) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                      {label.replace(/([A-Z])/g, " $1").trim()}
                    </Typography>
                    <Chip color={scoreColor(score)} label={`${score}/100`} sx={{ width: "fit-content", fontWeight: 700 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {Object.entries(data.audits || {}).map(([category, audits]) => {
          const importantAudits = (audits || []).filter((audit) => audit.score !== 1).slice(0, 6);
          if (!importantAudits.length) {
            return null;
          }

          return (
            <Paper key={category} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, textTransform: "capitalize" }}>
                {category.replace(/([A-Z])/g, " $1").trim()}
              </Typography>
              <Stack spacing={1.25}>
                {importantAudits.map((audit) => (
                  <Box key={audit.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {audit.title}
                      </Typography>
                      <Chip
                        size="small"
                        color={audit.score === 1 ? "success" : audit.score === 0 ? "error" : "warning"}
                        label={audit.scoreDisplayMode === "binary" ? (audit.score === 1 ? "Passed" : "Needs work") : `${Math.round((audit.score || 0) * 100)}%`}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {audit.description?.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  };

  const renderLinkResults = (data) => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={`Total ${data.total}`} />
        <Chip label={`Working ${data.working}`} color="success" />
        <Chip label={`Broken ${data.broken}`} color="error" />
        <Chip label={`Internal ${data.internal}`} />
        <Chip label={`External ${data.external}`} />
      </Stack>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Stack spacing={1.5}>
          {(data.details || []).map((item, index) => (
            <Box key={`${item.url}-${index}`} sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {item.text}
              </Typography>
              <Link href={item.url} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: "block", mt: 0.5 }}>
                {item.url}
              </Link>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip size="small" label={item.working ? "Working" : "Broken"} color={item.working ? "success" : "error"} />
                <Chip size="small" label={item.type} />
                <Chip size="small" label={`Status ${item.status}`} />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );

  const renderResult = () => {
    if (screenshotData) {
      return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1} sx={{ mb: 1.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Website Screenshot
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {screenshotData.filename}
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Download />} onClick={downloadScreenshot}>
              Download
            </Button>
          </Stack>
          <Box
            component="img"
            src={screenshotData.imageUrl}
            alt="Website screenshot"
            sx={{
              width: "100%",
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          />
        </Paper>
      );
    }

    if (shortUrl) {
      return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Shortened Link
          </Typography>
          <TextField fullWidth value={shortUrl} InputProps={{ readOnly: true }} />
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button variant="contained" startIcon={<ContentCopy />} onClick={() => copyValue(shortUrl)}>
              Copy
            </Button>
            <Button variant="outlined" component="a" href={shortUrl} target="_blank" rel="noopener noreferrer">
              Open
            </Button>
          </Stack>
        </Paper>
      );
    }

    if (!result) {
      return null;
    }

    if (activeTab === 1) {
      return renderSeoResults(result);
    }

    if (activeTab === 2) {
      return renderLinkResults(result);
    }

    return <JsonPanel title={`${activeLabel} Result`} data={result} />;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        <ToolPageHeader
          title="Web Tools"
          description="Inspect public pages, capture screenshots, review metadata, and run technical checks from one workspace."
          chips={[activeLabel]}
        />

        {(error || success) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }} onClose={() => (error ? setError(null) : setSuccess(null))}>
            {error || success}
          </Alert>
        )}

        <Paper sx={{ p: 1, mb: 2, borderRadius: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {toolTabs.map((tab) => (
              <Tab key={tab.label} label={tab.label} icon={tab.icon} iconPosition="start" />
            ))}
          </Tabs>
        </Paper>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2.25, borderRadius: 3, position: { lg: "sticky" }, top: { lg: 88 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Website Input
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter any public URL and run the currently selected check.
              </Typography>
              <TextField
                fullWidth
                label="Website URL"
                placeholder="https://example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                <Button variant="contained" onClick={runTool} disabled={loading}>
                  {loading ? "Running..." : `Run ${activeLabel}`}
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    setUrl("");
                    setError(null);
                    setSuccess(null);
                    clearOutputs();
                  }}
                >
                  Clear
                </Button>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Chip size="small" variant="outlined" label="Screenshot capture" />
                <Chip size="small" variant="outlined" label="SEO and links" />
                <Chip size="small" variant="outlined" label="Metadata and SSL" />
                <Chip size="small" variant="outlined" label="Short URLs and robots.txt" />
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={8}>
            {renderResult() || (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  Run {activeLabel.toLowerCase()} to see live results here.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default WebTools;
