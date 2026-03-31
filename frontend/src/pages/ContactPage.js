import React, { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdminPanelSettings, BugReport, ContentCopy, Forum, Lightbulb, SupportAgent } from "@mui/icons-material";
import InfoPageShell from "../components/InfoPageShell";

const supportCards = [
  {
    title: "Product questions",
    description: "Use this when users need help understanding what a tool does, which input format is expected, or where to find a related workflow.",
    icon: <SupportAgent color="primary" />,
  },
  {
    title: "Bug reports",
    description: "Best for broken outputs, failed downloads, mismatched validation, or a frontend/backend connection that is not behaving correctly.",
    icon: <BugReport color="primary" />,
  },
  {
    title: "Feature requests",
    description: "Useful when a missing day-to-day tool or workflow would make the platform more valuable for developers, teams, or creators.",
    icon: <Lightbulb color="primary" />,
  },
  {
    title: "Admin support",
    description: "Use this for provider setup, monetization configuration, deployment questions, or environment-specific platform management.",
    icon: <AdminPanelSettings color="primary" />,
  },
];

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "",
    tool: "",
    message: "",
    expectedResult: "",
  });
  const [copied, setCopied] = useState(false);

  const supportTemplate = useMemo(() => {
    const lines = [
      "Support Request",
      `Name: ${form.name || "-"}`,
      `Email: ${form.email || "-"}`,
      `Topic: ${form.topic || "-"}`,
      `Tool or page: ${form.tool || "-"}`,
      `Expected result: ${form.expectedResult || "-"}`,
      `Message: ${form.message || "-"}`,
    ];

    return lines.join("\n");
  }, [form]);

  const updateField = (field) => (event) => {
    setCopied(false);
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(supportTemplate);
    setCopied(true);
  };

  const handleReset = () => {
    setCopied(false);
    setForm({
      name: "",
      email: "",
      topic: "",
      tool: "",
      message: "",
      expectedResult: "",
    });
  };

  return (
    <InfoPageShell
      eyebrow="Contact And Support"
      title="Get the right details together fast"
      description="This page is designed to help users capture a clean support request before sharing it with the project owner or deployment team. That makes bug reports easier to reproduce and helps feature requests stay actionable."
      chips={["Bug reports", "Feature requests", "Admin support"]}
      actions={[
        <Button key="home" variant="contained" component={RouterLink} to="/">
          Back Home
        </Button>,
        <Button key="admin" variant="outlined" component={RouterLink} to="/admin/login">
          Admin Login
        </Button>,
      ]}
    >
      <Grid container spacing={2.5}>
        {supportCards.map((card) => (
          <Grid item xs={12} md={6} key={card.title}>
            <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1.25}>
                  {card.icon}
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={7}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
              Support request builder
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Fill in the important details, then copy the generated summary. This keeps support messages structured without pretending there is a live contact backend when there is not one configured.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Name" value={form.name} onChange={updateField("name")} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Email" value={form.email} onChange={updateField("email")} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Topic" value={form.topic} onChange={updateField("topic")} placeholder="Bug report, feature request, admin setup" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Tool or page" value={form.tool} onChange={updateField("tool")} placeholder="Image Tools, PDF Tools, /admin" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Expected result" value={form.expectedResult} onChange={updateField("expectedResult")} placeholder="What should have happened?" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={6} label="Message" value={form.message} onChange={updateField("message")} placeholder="What happened, what you tried, and how to reproduce it." />
              </Grid>
            </Grid>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<ContentCopy />} onClick={handleCopy}>
                Copy Support Summary
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                Clear
              </Button>
            </Stack>

            {copied ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                Support summary copied to the clipboard.
              </Alert>
            ) : null}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Forum color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                What to include
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Exact page or tool
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mention the route and the tool action that failed, for example `/image-tools` live preview or PDF metadata update.
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Expected vs actual behavior
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clear before-and-after descriptions save time and make UI or API regressions much easier to trace.
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Sample input
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If the issue depends on a specific file, payload, or option set, mention it so the problem can be reproduced.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </InfoPageShell>
  );
}

export default ContactPage;
