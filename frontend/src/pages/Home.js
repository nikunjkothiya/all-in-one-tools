import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Grid, Card, CardContent, Typography, CardActionArea, useTheme } from "@mui/material";
import { TextFields, Image, PictureAsPdf, Code, Folder, Movie, Language, DataObject, Security } from "@mui/icons-material";

const categories = [
    {
    title: "Text Tools",
    description: "Text case conversion, markdown preview, text comparison, and formatting tools",
        icon: <TextFields sx={{ fontSize: 40 }} />,
    path: "/text-tools",
    },
    {
    title: "Image Tools",
    description: "Resize, compress, rotate, and apply filters to images",
        icon: <Image sx={{ fontSize: 40 }} />,
    path: "/image-tools",
    },
    {
    title: "PDF Tools",
    description: "Split, merge, protect PDFs with passwords, and edit PDF files",
        icon: <PictureAsPdf sx={{ fontSize: 40 }} />,
    path: "/pdf-tools",
    },
    {
    title: "Developer Tools",
    description: "JSON formatting, data validation, and format conversion tools",
        icon: <Code sx={{ fontSize: 40 }} />,
    path: "/developer-tools",
    },
    {
    title: "File Tools",
    description: "Convert files to PDF/DOCX and compress files",
        icon: <Folder sx={{ fontSize: 40 }} />,
    path: "/file-tools",
    },
    {
    title: "Media Tools",
    description: "Convert, compress, trim videos, and adjust playback speed",
        icon: <Movie sx={{ fontSize: 40 }} />,
    path: "/media-tools",
    },
    {
    title: "Web Tools",
    description: "Website screenshots, SEO analysis, and broken link checking",
        icon: <Language sx={{ fontSize: 40 }} />,
    path: "/web-tools",
    },
    {
    title: "Data Tools",
    description: "Convert and validate data between JSON, XML, CSV, and YAML formats",
        icon: <DataObject sx={{ fontSize: 40 }} />,
    path: "/data-tools",
    },
    {
    title: "Privacy Tools",
    description: "Hash generation, encryption/decryption, and secure data handling",
        icon: <Security sx={{ fontSize: 40 }} />,
    path: "/privacy-tools",
    },
];

function Home() {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to All Web Tools
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    A comprehensive collection of utility tools for various tasks
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {categories.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category.title}>
                        <Card
                            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                                },
                            }}
                        >
              <CardActionArea onClick={() => navigate(category.path)} sx={{ height: "100%" }}>
                                <CardContent>
                                    <Box
                                        sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                                            mb: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                color: theme.palette.primary.main,
                                                mb: 1,
                                            }}
                                        >
                                            {category.icon}
                                        </Box>
                                        <Typography variant="h5" component="h2" gutterBottom>
                                            {category.title}
                                        </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                                            {category.description}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default Home; 
