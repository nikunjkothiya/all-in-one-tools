import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  AutoAwesome,
  Devices,
  FlashOn,
  Groups,
  Security,
  Storage,
} from "@mui/icons-material";
import InfoPageShell from "../components/InfoPageShell";

const valueCards = [
  {
    title: "Built for day-to-day work",
    description: "The platform groups the tools people repeatedly need across text, images, PDFs, media, data, privacy, web checks, loaders, and developer workflows.",
    icon: <FlashOn color="primary" />,
  },
  {
    title: "Made for multiple user types",
    description: "Developers, operations teams, content creators, managers, and general users can solve focused tasks without moving between disconnected websites.",
    icon: <Groups color="primary" />,
  },
  {
    title: "Local-first platform controls",
    description: "Admin and monetization settings are stored locally with SQLite, keeping deployment simple while still giving the owner real control over platform configuration.",
    icon: <Storage color="primary" />,
  },
  {
    title: "Responsive by design",
    description: "Pages are built with responsive MUI layouts so the same tool collection remains usable across desktop, tablet, and mobile screens.",
    icon: <Devices color="primary" />,
  },
];

const audienceGroups = [
  "Developers formatting code, testing regex, or auditing websites",
  "Operations and management users handling PDFs, files, conversions, and quick data cleanup",
  "Studio and content teams preparing images, media, and graphics assets",
  "General users solving one-off tasks without installing desktop software",
];

const principles = [
  {
    title: "Clarity",
    detail: "Each tool should explain what it does, what input it expects, and what result a user can download or copy.",
  },
  {
    title: "Speed",
    detail: "High-frequency tasks should take as few clicks as possible, with sensible defaults and compact controls.",
  },
  {
    title: "Trust",
    detail: "Error states should be explicit, outputs should be deterministic, and admin/provider settings should never be hidden in code.",
  },
  {
    title: "Coverage",
    detail: "The product should feel like one destination for practical work rather than a loose list of unrelated demos.",
  },
];

function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="About The Platform"
      title="One toolbox for practical web work"
      description="All-in-One Tools is designed as a browser-based utility platform that brings together the repetitive tasks users usually solve across many separate websites. The goal is simple: fewer tabs, faster workflows, and a more consistent experience from one tool category to the next."
      chips={["11 tool families", "Frontend + backend architecture", "Local admin + monetization controls"]}
      actions={[
        <Button key="tools" variant="contained" component="a" href="/#tools">
          Explore Tools
        </Button>,
        <Button key="contact" variant="outlined" component={RouterLink} to="/contact">
          Contact
        </Button>,
      ]}
    >
      <Grid container spacing={2.5}>
        {valueCards.map((card) => (
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
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
              Who this application is for
            </Typography>
            <Stack spacing={1.25}>
              {audienceGroups.map((item) => (
                <Box key={item} sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Product principles
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {principles.map((item) => (
                <Box key={item.title}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <AutoAwesome sx={{ fontSize: 18, color: "primary.main" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {item.detail}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 2.5 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              What makes the experience stronger
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 860 }}>
              The platform works best when every route is complete, every result card is accurate, and the navigation feels trustworthy. That is why the current polish work focuses on real route coverage, clean builds, accurate tool feedback, and consistent page shells instead of only adding more features.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Clean builds" color="primary" variant="outlined" />
            <Chip label="Consistent layout" color="primary" variant="outlined" />
            <Chip label="Practical tools" color="primary" variant="outlined" />
          </Stack>
        </Stack>
      </Paper>
    </InfoPageShell>
  );
}

export default AboutPage;
