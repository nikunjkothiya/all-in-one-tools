import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Container, Paper, Button, Divider, useTheme } from "@mui/material";
import { TextFields, Image, PictureAsPdf, Folder, VideoLibrary, Language, Storage, Security, Code, ArrowForward, QrCode2 } from "@mui/icons-material";

// Import only the slider components
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/HeroSlider.css"; // Import custom slider styles

// Tool categories data
const toolCategories = [
  {
    id: "text",
    name: "Text Tools",
    description: "Transform, convert, and manipulate text with ease",
    icon: <TextFields fontSize="large" />,
    path: "/text-tools",
    color: "#3f51b5",
  },
  {
    id: "image",
    name: "Image Tools",
    description: "Optimize, convert, and edit your images",
    icon: <Image fontSize="large" />,
    path: "/image-tools",
    color: "#f50057",
  },
  {
    id: "pdf",
    name: "PDF Tools",
    description: "Create, edit, and convert PDF documents",
    icon: <PictureAsPdf fontSize="large" />,
    path: "/pdf-tools",
    color: "#2196f3",
  },
  {
    id: "media",
    name: "Media Tools",
    description: "Process and convert video and audio files",
    icon: <VideoLibrary fontSize="large" />,
    path: "/media-tools",
    color: "#ff5722",
  },
  {
    id: "file",
    name: "File Tools",
    description: "Work with files of any type easily",
    icon: <Folder fontSize="large" />,
    path: "/file-tools",
    color: "#4caf50",
  },
  {
    id: "web",
    name: "Web Tools",
    description: "Utilities for web developers and designers",
    icon: <Language fontSize="large" />,
    path: "/web-tools",
    color: "#9c27b0",
  },
  {
    id: "data",
    name: "Data Tools",
    description: "Process and convert data in various formats",
    icon: <Storage fontSize="large" />,
    path: "/data-tools",
    color: "#ff9800",
  },
  {
    id: "privacy",
    name: "Privacy Tools",
    description: "Secure your data and maintain privacy",
    icon: <Security fontSize="large" />,
    path: "/privacy-tools",
    color: "#607d8b",
  },
  {
    id: "loader",
    name: "Loader Tools",
    description: "Create customizable loading animations",
    icon: <Code fontSize="large" />,
    path: "/loader-tools",
    color: "#795548",
  },
  {
    id: "misc",
    name: "Miscellaneous Tools",
    description: "QR codes, barcodes, unit converters and more",
    icon: <QrCode2 fontSize="large" />,
    path: "/misc-tools",
    color: "#e91e63",
  },
];

// Featured tools - customize as needed
const featuredTools = [
  {
    id: "qr-code",
    name: "QR Code Generator",
    path: "/misc-tools",
    color: "#e91e63",
  },
  {
    id: "pdf-merger",
    name: "PDF Merger",
    path: "/pdf-tools",
    color: "#2196f3",
  },
  {
    id: "image-compression",
    name: "Image Compressor",
    path: "/image-tools",
    color: "#f50057",
  },
  {
    id: "video-converter",
    name: "Video Converter",
    path: "/media-tools",
    color: "#ff5722",
  },
];

const HomePage = () => {
  const theme = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [currentTypedText, setCurrentTypedText] = useState("");

  // Effect for rotating text in the active slide
  useEffect(() => {
    if (currentSlide > 0) {
      // We'll implement a typewriter effect instead of just rotating text
      const currentItem = sliderItems[currentSlide];
      const currentTypeString = currentItem.typed[textIndex];

      let charIndex = 0;
      let typingInterval;
      let currentTypedText = "";

      // Start typing effect for the current word
      const startTyping = () => {
        typingInterval = setInterval(() => {
          if (charIndex < currentTypeString.length) {
            // Add one character at a time
            currentTypedText += currentTypeString[charIndex];
            setCurrentTypedText(currentTypedText);
            charIndex++;
          } else {
            // Finished typing the current word
            clearInterval(typingInterval);

            // Pause at the end of the word before erasing
            setTimeout(() => {
              startErasing();
            }, 1200);
          }
        }, 100); // Speed of typing
      };

      // Start erasing effect for the current word
      const startErasing = () => {
        typingInterval = setInterval(() => {
          if (currentTypedText.length > 0) {
            // Remove one character at a time
            currentTypedText = currentTypedText.slice(0, -1);
            setCurrentTypedText(currentTypedText);
          } else {
            // Finished erasing, move to next word
            clearInterval(typingInterval);
            setTextIndex((prevIndex) => (prevIndex >= currentItem.typed.length - 1 ? 0 : prevIndex + 1));
          }
        }, 50); // Speed of erasing (faster than typing)
      };

      startTyping();

      return () => {
        if (typingInterval) clearInterval(typingInterval);
      };
    }
  }, [currentSlide, textIndex]);

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
    pauseOnHover: true,
    arrows: true,
    beforeChange: (oldIndex, newIndex) => {
      setCurrentSlide(newIndex);
      setTextIndex(0); // Reset text index on slide change
    },
    customPaging: (i) => (
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: i === currentSlide ? "white" : "rgba(255,255,255,0.5)",
          display: "inline-block",
          transition: "all 0.3s ease",
        }}
      />
    ),
  };

  // Categories for the animation
  const sliderItems = [
    {
      title: "All-in-One Tools for Web Professionals",
      description: "Free and powerful online tools to make your work faster and easier. No installation required, all tools run directly in your browser.",
      typed: ["developers", "designers", "content creators", "marketers", "everyone"],
      link: "#tools",
      linkText: "Explore Tools",
    },
    {
      title: "Text Tools for Content",
      description: "Transform, convert, and manipulate text with powerful formatting, conversion, and analysis tools.",
      typed: ["formatting", "converting", "analyzing", "translating", "generating"],
      link: "/text-tools",
      linkText: "Explore Text Tools",
      color: toolCategories[0].color,
    },
    {
      title: "Image Tools for Visual",
      description: "Optimize, resize, convert, and transform your images without leaving your browser.",
      typed: ["optimization", "editing", "conversion", "transformation", "resizing"],
      link: "/image-tools",
      linkText: "Explore Image Tools",
      color: toolCategories[1].color,
    },
    {
      title: "Media Tools for",
      description: "Process and convert video and audio files easily with our browser-based tools.",
      typed: ["conversion", "compression", "trimming", "editing", "transformation"],
      link: "/media-tools",
      linkText: "Explore Media Tools",
      color: toolCategories[3].color,
    },
    {
      title: "PDF Tools for",
      description: "Create, edit, and convert PDF documents with our comprehensive set of browser tools.",
      typed: ["merging", "splitting", "converting", "compressing", "editing"],
      link: "/pdf-tools",
      linkText: "Explore PDF Tools",
      color: toolCategories[2].color,
    },
    {
      title: "Data Tools for",
      description: "Process, convert, and visualize data in various formats with powerful tools.",
      typed: ["analysis", "visualization", "conversion", "extraction", "processing"],
      link: "/data-tools",
      linkText: "Explore Data Tools",
      color: toolCategories[6].color,
    },
    {
      title: "Privacy Tools for",
      description: "Secure your data and protect your privacy with specialized tools.",
      typed: ["encryption", "anonymization", "password management", "secure sharing", "protection"],
      link: "/privacy-tools",
      linkText: "Explore Privacy Tools",
      color: toolCategories[7].color,
    },
    {
      title: "Loader Tools for",
      description: "Create beautiful, customizable loading animations for your web projects.",
      typed: ["websites", "applications", "animations", "indicators", "user experience"],
      link: "/loader-tools",
      linkText: "Explore Loader Tools",
      color: toolCategories[8].color,
    },
    {
      title: "Miscellaneous Tools for",
      description: "Explore our collection of useful utilities, including QR code generators, converters, and more.",
      typed: ["QR codes", "barcodes", "converters", "calculators", "everyday tasks"],
      link: "/misc-tools",
      linkText: "Explore Misc Tools",
      color: toolCategories[9].color,
    },
  ];

  return (
    <Box>
      {/* Hero section - with animated slider */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          mb: 3,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: "white",
          height: { xs: "380px", md: "400px" },
        }}
      >
        <Container maxWidth="xl" sx={{ height: "100%" }}>
          <Slider {...sliderSettings} className="hero-slider">
            {sliderItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  py: { xs: 3, md: 5 },
                  px: { xs: 2, md: 4 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: { xs: "340px", md: "360px" },
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: "1.75rem", md: "2.5rem" },
                    minHeight: { xs: "3.5rem", md: "5rem" },
                  }}
                >
                  {item.title}
                  {index > 0 && (
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        height: "3rem",
                        mt: 1,
                        position: "relative",
                      }}
                      className="animated-text"
                    >
                      {currentTypedText}
                    </Box>
                  )}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    maxWidth: "800px",
                    mb: 3,
                    fontWeight: 400,
                    opacity: 0.9,
                    fontSize: { xs: "1rem", md: "1.15rem" },
                  }}
                >
                  {item.description}
                </Typography>
                <Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="medium"
                    component={Link}
                    to={item.link}
                    sx={{
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "0.9rem",
                      backgroundColor: "white",
                      color: "#ff7b00",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.9)",
                      },
                    }}
                    endIcon={<ArrowForward />}
                  >
                    {item.linkText}
                  </Button>
                </Box>
              </Box>
            ))}
          </Slider>
        </Container>
        {/* Background pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            opacity: 0.1,
            background: "url('https://www.transparenttextures.com/patterns/cubes.png')",
          }}
        />
      </Paper>

      {/* Tool categories grid - new layout */}
      <Container maxWidth="xl">
        <Box id="tools" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 0.5, fontWeight: 600, fontSize: "1.25rem", textAlign: "center" }}>
            All Tool Categories
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: "0.9rem", textAlign: "center" }}>
            Browse our complete collection of web tools
          </Typography>

          <Grid container spacing={2}>
            {toolCategories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: theme.shadows[8],
                    },
                    borderLeft: `4px solid ${category.color}`,
                  }}
                >
                  <CardActionArea component={Link} to={category.path} sx={{ height: "100%", p: { xs: 1, sm: 1.5 } }}>
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        height: "100%",
                        py: 1,
                        px: 1,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          color: "white",
                          mb: 2,
                          background: category.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {category.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 0.5, fontSize: "1rem" }}>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
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

        {/* Featured tools section */}
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 0.5, fontWeight: 600, fontSize: "1.25rem", textAlign: "center" }}>
            Featured Tools
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: "0.9rem", textAlign: "center" }}>
            Most popular tools used by our community
          </Typography>

          <Grid container spacing={2}>
            {featuredTools.map((tool) => (
              <Grid item xs={6} sm={3} key={tool.id}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: theme.shadows[8],
                    },
                    borderTop: `3px solid ${tool.color}`,
                  }}
                >
                  <CardActionArea component={Link} to={tool.path} sx={{ height: "100%", p: 1.5 }}>
                    <CardContent sx={{ p: 1, textAlign: "center" }}>
                      <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 0.5, fontSize: "0.95rem" }}>
                        {tool.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                        Click to explore this tool
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Why use our tools section */}
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 0.5, fontWeight: 600, fontSize: "1.25rem", textAlign: "center" }}>
            Why Use Our Tools?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: "0.9rem", textAlign: "center" }}>
            Designed with simplicity and efficiency in mind
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", px: 1 }}>
                <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 0.5, fontSize: "1rem" }}>
                  100% Free
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                  All tools are completely free to use without any restrictions or hidden fees.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", px: 1 }}>
                <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 0.5, fontSize: "1rem" }}>
                  Privacy First
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                  Your files never leave your browser. We process everything locally for maximum privacy.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", px: 1 }}>
                <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 0.5, fontSize: "1rem" }}>
                  No Installation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                  Access all tools instantly in your browser with no downloads or plugins required.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
