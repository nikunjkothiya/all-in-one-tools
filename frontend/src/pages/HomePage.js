import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Container,
  Paper,
  Button,
  Divider,
  Stack,
  Chip,
  useTheme,
} from "@mui/material";
import {
  TextFields,
  Image,
  PictureAsPdf,
  Folder,
  VideoLibrary,
  Language,
  Storage,
  Security,
  Code,
  QrCode2,
  DeveloperMode,
  ArrowForward,
  BoltOutlined,
  DevicesRounded,
  DashboardCustomizeOutlined,
} from "@mui/icons-material";
import AdSlot from "../components/AdSlot";

const toolCategories = [
  {
    id: "text",
    name: "Text Tools",
    description: "Transform, clean, compare, and convert text for everyday writing and content tasks.",
    icon: <TextFields fontSize="large" />,
    path: "/text-tools",
    color: "#3f51b5",
  },
  {
    id: "image",
    name: "Image Tools",
    description: "Resize, convert, compress, and edit images with a focused visual workspace.",
    icon: <Image fontSize="large" />,
    path: "/image-tools",
    color: "#f50057",
  },
  {
    id: "pdf",
    name: "PDF Tools",
    description: "Merge, split, inspect, protect, and update PDF files from one place.",
    icon: <PictureAsPdf fontSize="large" />,
    path: "/pdf-tools",
    color: "#2196f3",
  },
  {
    id: "media",
    name: "Media Tools",
    description: "Convert, trim, compress, and adjust video or audio without leaving the app.",
    icon: <VideoLibrary fontSize="large" />,
    path: "/media-tools",
    color: "#ff5722",
  },
  {
    id: "file",
    name: "File Tools",
    description: "Compress, encrypt, inspect, and work with files through practical utility flows.",
    icon: <Folder fontSize="large" />,
    path: "/file-tools",
    color: "#4caf50",
  },
  {
    id: "web",
    name: "Web Tools",
    description: "Check metadata, headers, links, robots, screenshots, and site diagnostics.",
    icon: <Language fontSize="large" />,
    path: "/web-tools",
    color: "#9c27b0",
  },
  {
    id: "data",
    name: "Data Tools",
    description: "Convert, format, and inspect structured data for reporting and cleanup work.",
    icon: <Storage fontSize="large" />,
    path: "/data-tools",
    color: "#ff9800",
  },
  {
    id: "privacy",
    name: "Privacy Tools",
    description: "Encrypt, hash, mask, and anonymize sensitive data with safer workflows.",
    icon: <Security fontSize="large" />,
    path: "/privacy-tools",
    color: "#607d8b",
  },
  {
    id: "loader",
    name: "Loader Tools",
    description: "Generate and export loading animations for websites, demos, and products.",
    icon: <Code fontSize="large" />,
    path: "/loader-tools",
    color: "#795548",
  },
  {
    id: "developer",
    name: "Developer Tools",
    description: "Format, minify, validate, and debug common frontend payloads and code snippets.",
    icon: <DeveloperMode fontSize="large" />,
    path: "/developer-tools",
    color: "#00897b",
  },
  {
    id: "misc",
    name: "Miscellaneous Tools",
    description: "Use QR, barcode, converter, and general-purpose utilities for day-to-day work.",
    icon: <QrCode2 fontSize="large" />,
    path: "/misc-tools",
    color: "#e91e63",
  },
];

const featuredTools = [
  {
    id: "qr-code",
    name: "QR Code Generator",
    description: "Create quick shareable codes for links, text, and device handoff.",
    path: "/misc-tools",
    color: "#e91e63",
    icon: <QrCode2 />,
  },
  {
    id: "pdf-merger",
    name: "PDF Merger",
    description: "Combine multiple documents into one clean PDF workflow.",
    path: "/pdf-tools",
    color: "#2196f3",
    icon: <PictureAsPdf />,
  },
  {
    id: "image-compression",
    name: "Image Compressor",
    description: "Shrink images quickly for upload, email, and publishing tasks.",
    path: "/image-tools",
    color: "#f50057",
    icon: <Image />,
  },
  {
    id: "video-converter",
    name: "Video Converter",
    description: "Convert media formats for previews, sharing, or delivery needs.",
    path: "/media-tools",
    color: "#ff5722",
    icon: <VideoLibrary />,
  },
];

const valueItems = [
  {
    id: "fast",
    title: "Faster Entry Point",
    description: "The homepage is intentionally simple so users can move straight into the right tool without banner distractions.",
    icon: <BoltOutlined fontSize="large" />,
    color: "#3f51b5",
  },
  {
    id: "mobile",
    title: "Mobile-Friendly Layout",
    description: "Cards stack cleanly, actions stay readable, and the main sections keep their hierarchy on smaller screens.",
    icon: <DevicesRounded fontSize="large" />,
    color: "#f50057",
  },
  {
    id: "organized",
    title: "Organized Workflows",
    description: "Tools are grouped by purpose so developers, teams, and everyday users can find the right workspace faster.",
    icon: <DashboardCustomizeOutlined fontSize="large" />,
    color: "#00897b",
  },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <Box sx={{ textAlign: "center", mb: 2.5 }}>
      {eyebrow ? (
        <Typography
          variant="overline"
          sx={{
            display: "block",
            color: "primary.main",
            fontWeight: 700,
            letterSpacing: 1.2,
            mb: 0.5,
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1.65rem", md: "2rem" },
          mb: 0.75,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          maxWidth: 760,
          mx: "auto",
          fontSize: { xs: "0.95rem", md: "1rem" },
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}

const HomePage = () => {
  const theme = useTheme();
  const location = useLocation();
  const toolsSectionRef = useRef(null);

  const scrollToToolsSection = (behavior = "smooth") => {
    if (!toolsSectionRef.current) {
      return;
    }

    toolsSectionRef.current.scrollIntoView({
      behavior,
      block: "start",
    });

    if (typeof window !== "undefined") {
      const nextUrl = `${window.location.pathname}#tools`;
      window.history.replaceState(null, "", nextUrl);
    }
  };

  useEffect(() => {
    if (location.hash !== "#tools") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      scrollToToolsSection("smooth");
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.hash]);

  return (
    <Box>
      <Container maxWidth="xl">
        <Box sx={{ py: { xs: 2, md: 3 } }}>
          <Stack spacing={{ xs: 3, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.25, sm: 3, md: 4 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(180deg, #ffffff 0%, rgba(63,81,181,0.04) 100%)",
              }}
            >
              <Grid container spacing={{ xs: 2.5, md: 4 }} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Typography
                    variant="overline"
                    sx={{
                      display: "block",
                      color: "primary.main",
                      fontWeight: 700,
                      letterSpacing: 1.4,
                      mb: 0.75,
                    }}
                  >
                    All-in-One Tools
                  </Typography>
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      lineHeight: 1.12,
                      fontSize: { xs: "2rem", sm: "2.35rem", md: "3rem" },
                      mb: 1.5,
                    }}
                  >
                    Practical tools for daily web, file, content, and developer work.
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      maxWidth: 760,
                      fontSize: { xs: "0.98rem", md: "1.05rem" },
                      lineHeight: 1.7,
                    }}
                  >
                    Browse focused tool suites for text, images, PDFs, media, privacy, data cleanup, web checks, loaders,
                    and developer workflows. The homepage stays intentionally simple so users can jump into the right task fast.
                  </Typography>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label={`${toolCategories.length} tool suites`} color="primary" variant="outlined" />
                      <Chip label="Cleaner homepage" color="primary" variant="outlined" />
                      <Chip label="Mobile-friendly layout" color="primary" variant="outlined" />
                      <Chip label="Fast access" color="primary" variant="outlined" />
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                      <Button variant="contained" size="large" onClick={() => scrollToToolsSection()} endIcon={<ArrowForward />}>
                        Browse Categories
                      </Button>
                      <Button component={Link} to="/developer-tools" variant="outlined" size="large">
                        Open Developer Tools
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Box id="tools" ref={toolsSectionRef} sx={{ scrollMarginTop: { xs: "72px", md: "88px" } }}>
              <SectionHeading
                eyebrow="Tool Directory"
                title="All Tool Categories"
                description="Choose a workspace based on what you need to do. Every category is grouped to reduce clutter and make daily tasks easier to find."
              />

              <Grid container spacing={{ xs: 2, md: 2.5 }}>
                {toolCategories.map((category) => (
                  <Grid item xs={12} sm={6} lg={4} key={category.id}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                        background: "linear-gradient(180deg, #ffffff 0%, rgba(15,23,42,0.01) 100%)",
                        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: theme.shadows[8],
                          borderColor: category.color,
                        },
                      }}
                    >
                      <CardActionArea component={Link} to={category.path} sx={{ height: "100%" }}>
                        <CardContent
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: { xs: "center", sm: "flex-start" },
                            justifyContent: "space-between",
                            textAlign: { xs: "center", sm: "left" },
                            gap: 2,
                            p: { xs: 2.25, md: 2.5 },
                            minHeight: 220,
                          }}
                        >
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: 2.5,
                              backgroundColor: category.color,
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: `0 14px 32px ${category.color}33`,
                            }}
                          >
                            {category.icon}
                          </Box>

                          <Box>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1, fontSize: "1.1rem" }}>
                              {category.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                              {category.description}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <AdSlot slotKey="home-after-hero" pageKey="home" />

            <Divider />

            <Box>
              <SectionHeading
                eyebrow="Popular Starts"
                title="Featured Tools"
                description="These are strong starting points for common website, document, media, and sharing tasks."
              />

              <Grid container spacing={{ xs: 2, md: 2.5 }}>
                {featuredTools.map((tool) => (
                  <Grid item xs={12} sm={6} lg={3} key={tool.id}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      <CardActionArea component={Link} to={tool.path} sx={{ height: "100%" }}>
                        <CardContent
                          sx={{
                            p: { xs: 2.25, md: 2.5 },
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            alignItems: "flex-start",
                            minHeight: 188,
                          }}
                        >
                          <Box
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              backgroundColor: tool.color,
                            }}
                          >
                            {tool.icon}
                          </Box>
                          <Box>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 0.75, fontSize: "1rem" }}>
                              {tool.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                              {tool.description}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider />

            <Box sx={{ pb: { xs: 0, md: 1 } }}>
              <SectionHeading
                eyebrow="Why This Layout"
                title="Built For Daily Work"
                description="The landing page now focuses on direct access, clearer grouping, and a steadier experience across desktop and mobile."
              />

              <Grid container spacing={{ xs: 2, md: 2.5 }}>
                {valueItems.map((item) => (
                  <Grid item xs={12} md={4} key={item.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        height: "100%",
                        p: { xs: 2.25, md: 2.5 },
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <Stack spacing={1.5} alignItems={{ xs: "center", md: "flex-start" }} textAlign={{ xs: "center", md: "left" }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            color: item.color,
                            backgroundColor: `${item.color}14`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {item.description}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
