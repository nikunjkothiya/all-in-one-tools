import React from "react";
import { Link } from "react-router-dom";
import { Box, Container, Typography, Grid, Divider, useTheme } from "@mui/material";

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const tools = [
    { name: "Text Tools", path: "/text-tools" },
    { name: "Image Tools", path: "/image-tools" },
    { name: "PDF Tools", path: "/pdf-tools" },
    { name: "Media Tools", path: "/media-tools" },
    { name: "Misc Tools", path: "/misc-tools" },
    { name: "Loader Tools", path: "/loader-tools" },
    { name: "Developer Tools", path: "/developer-tools" },
    { name: "Web Tools", path: "/web-tools" },
    { name: "Data Tools", path: "/data-tools" },
    { name: "Privacy Tools", path: "/privacy-tools" },
    { name: "File Tools", path: "/file-tools" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }} gutterBottom>
              All-in-One Tools
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
              A browser-based toolkit for practical work across documents, media, web utilities, data cleanup, privacy, and developer workflows.
            </Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }} gutterBottom>
              Tools
            </Typography>
            <Grid container>
              {tools.map((tool) => (
                <Grid item xs={6} sm={4} md={3} key={tool.name}>
                  <Typography
                    component={Link}
                    to={tool.path}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textDecoration: "none",
                      display: "block",
                      mb: 1,
                      "&:hover": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    {tool.name}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }} gutterBottom>
              Platform
            </Typography>
            <Typography
              component={Link}
              to="/about"
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: "none",
                display: "block",
                mb: 1,
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              About
            </Typography>
            <Typography
              component={Link}
              to="/contact"
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: "none",
                display: "block",
                mb: 1,
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              Contact
            </Typography>
            <Typography
              component={Link}
              to="/admin/login"
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: "none",
                display: "block",
                mb: 1,
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              Admin Login
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Copyright */}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: "0.75rem" }}>
          © {currentYear} All-in-One Tools
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
