import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    CardActionArea,
    useTheme,
} from '@mui/material';
import {
    TextFields,
    Image,
    PictureAsPdf,
    Code,
    Folder,
    Movie,
    Language,
    DataObject,
    Security,
} from '@mui/icons-material';

const categories = [
    {
        title: 'Text Tools',
        description: 'Case conversion, text diff, regex testing, and more',
        icon: <TextFields sx={{ fontSize: 40 }} />,
        path: '/text-tools',
    },
    {
        title: 'Image Tools',
        description: 'Resize, compress, convert formats, and add watermarks',
        icon: <Image sx={{ fontSize: 40 }} />,
        path: '/image-tools',
    },
    {
        title: 'PDF Tools',
        description: 'Merge, split, add text, and convert to other formats',
        icon: <PictureAsPdf sx={{ fontSize: 40 }} />,
        path: '/pdf-tools',
    },
    {
        title: 'Developer Tools',
        description: 'JSON formatting, base64 encoding, and more',
        icon: <Code sx={{ fontSize: 40 }} />,
        path: '/developer-tools',
    },
    {
        title: 'File Tools',
        description: 'File conversion, checksum generation, and MIME type identification',
        icon: <Folder sx={{ fontSize: 40 }} />,
        path: '/file-tools',
    },
    {
        title: 'Media Tools',
        description: 'Audio cutting, video to GIF, and thumbnail generation',
        icon: <Movie sx={{ fontSize: 40 }} />,
        path: '/media-tools',
    },
    {
        title: 'Web Tools',
        description: 'SEO analysis, link checking, and website screenshots',
        icon: <Language sx={{ fontSize: 40 }} />,
        path: '/web-tools',
    },
    {
        title: 'Data Tools',
        description: 'QR code generation, barcode reading, and data visualization',
        icon: <DataObject sx={{ fontSize: 40 }} />,
        path: '/data-tools',
    },
    {
        title: 'Privacy Tools',
        description: 'Email obfuscation, password generation, and secure file shredding',
        icon: <Security sx={{ fontSize: 40 }} />,
        path: '/privacy-tools',
    },
];

function Home() {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Welcome to All-in-One Tools
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
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                },
                            }}
                        >
                            <CardActionArea
                                onClick={() => navigate(category.path)}
                                sx={{ height: '100%' }}
                            >
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
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
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            align="center"
                                        >
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