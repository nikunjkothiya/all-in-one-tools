import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import InfoPageShell from "../components/InfoPageShell";

const quickLinks = [
  { label: "Text Tools", path: "/text-tools" },
  { label: "Image Tools", path: "/image-tools" },
  { label: "PDF Tools", path: "/pdf-tools" },
  { label: "Developer Tools", path: "/developer-tools" },
  { label: "Web Tools", path: "/web-tools" },
];

function NotFoundPage() {
  return (
    <InfoPageShell
      eyebrow="Page Not Found"
      title="This route does not exist yet"
      description="The page you tried to open is missing or the URL is incorrect. Use one of the quick links below to get back into the main application."
      actions={[
        <Button key="home" variant="contained" component={RouterLink} to="/">
          Go Home
        </Button>,
        <Button key="contact" variant="outlined" component={RouterLink} to="/contact">
          Contact
        </Button>,
      ]}
    >
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
          Jump back into a working area
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {quickLinks.map((link) => (
            <Chip key={link.path} component={RouterLink} to={link.path} clickable label={link.label} color="primary" variant="outlined" />
          ))}
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            If this route should exist, it is worth checking the navigation target or route mapping in the frontend application shell.
          </Typography>
        </Box>
      </Paper>
    </InfoPageShell>
  );
}

export default NotFoundPage;
