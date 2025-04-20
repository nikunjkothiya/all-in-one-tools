import React from "react";
import { Link } from "react-router-dom";
import { Box, Container, Typography, Grid, Divider, useTheme } from "@mui/material";

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  // Footer links - simplified to only tools and contact
  const tools = [
    { name: "Text Tools", path: "/text-tools" },
    { name: "Image Tools", path: "/image-tools" },
    { name: "PDF Tools", path: "/pdf-tools" },
    { name: "Media Tools", path: "/media-tools" },
    { name: "Misc Tools", path: "/misc-tools" },
    { name: "Loader Tools", path: "/loader-tools" },
    { name: "Web Tools", path: "/web-tools" },
    { name: "Data Tools", path: "/data-tools" },
    { name: "Privacy Tools", path: "/privacy-tools" },
    { name: "File Tools", path: "/file-tools" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={1} justifyContent="space-between">
          {/* Tools Column */}
          <Grid item xs={12} md={8}>
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

          {/* Contact Column */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }} gutterBottom>
              Contact Us
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
          </Grid>
        </Grid>

        <Divider sx={{ my: 1 }} />

        {/* Copyright */}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: "0.75rem" }}>
          © {currentYear} All-in-One Tools
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
