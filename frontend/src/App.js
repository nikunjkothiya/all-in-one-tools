import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography, Button, Container, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, useMediaQuery } from "@mui/material";
import { TextFields, Image, PictureAsPdf, Folder, VideoLibrary, Language, Storage, Security, Code, MoreVert, Home, Info, ContactSupport, Coffee, QrCode2, AdminPanelSettings, DeveloperMode } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

// Import pages
import HomePage from "./pages/HomePage";
import TextTools from "./pages/TextTools";
import ImageTools from "./pages/ImageTools";
import PDFTools from "./pages/PDFTools";
import MediaTools from "./pages/MediaTools";
import FileTools from "./pages/FileTools";
import WebTools from "./pages/WebTools";
import DataTools from "./pages/DataTools";
import PrivacyTools from "./pages/PrivacyTools";
import LoaderTools from "./pages/LoaderTools";
import MiscTools from "./pages/MiscTools";
import DeveloperTools from "./pages/DeveloperTools";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminRoute from "./components/AdminRoute";
import AdSlot from "./components/AdSlot";
import MetaPixelLoader from "./components/MetaPixelLoader";
import Footer from "./components/Footer";

// Define theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

// Tool categories with their routes
const toolCategories = [
  {
    name: "Text Tools",
    icon: <TextFields />,
    path: "/text-tools",
    component: TextTools,
  },
  {
    name: "Image Tools",
    icon: <Image />,
    path: "/image-tools",
    component: ImageTools,
  },
  {
    name: "PDF Tools",
    icon: <PictureAsPdf />,
    path: "/pdf-tools",
    component: PDFTools,
  },
  {
    name: "Media Tools",
    icon: <VideoLibrary />,
    path: "/media-tools",
    component: MediaTools,
  },
  {
    name: "File Tools",
    icon: <Folder />,
    path: "/file-tools",
    component: FileTools,
  },
  {
    name: "Web Tools",
    icon: <Language />,
    path: "/web-tools",
    component: WebTools,
  },
  {
    name: "Data Tools",
    icon: <Storage />,
    path: "/data-tools",
    component: DataTools,
  },
  {
    name: "Privacy Tools",
    icon: <Security />,
    path: "/privacy-tools",
    component: PrivacyTools,
  },
  {
    name: "Loader Tools",
    icon: <Code />,
    path: "/loader-tools",
    component: LoaderTools,
  },
  {
    name: "Developer Tools",
    icon: <DeveloperMode />,
    path: "/developer-tools",
    component: DeveloperTools,
  },
  {
    name: "Miscellaneous Tools",
    icon: <QrCode2 />,
    path: "/misc-tools",
    component: MiscTools,
  },
];

// Logo SVG Component
const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="50" height="50" rx="10" fill="#3f51b5" />
    <path d="M10 15H40M10 25H40M10 35H40" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M16 10L13 40M25 10L28 40M37 10L34 40" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <circle cx="25" cy="25" r="15" stroke="white" strokeWidth="2" fill="none" />
    <path d="M25 10C30 15 30 35 25 40" stroke="white" strokeWidth="2" />
  </svg>
);

const toolPaths = new Set(toolCategories.map((category) => category.path));

const getPageKey = (pathname) => {
  if (!pathname || pathname === "/") {
    return "home";
  }

  return pathname.replace(/^\//, "");
};

const Header = () => {
  const [toolsMenuAnchor, setToolsMenuAnchor] = useState(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const handleToolsMenuOpen = (event) => {
    setToolsMenuAnchor(event.currentTarget);
  };

  const handleToolsMenuClose = () => {
    setToolsMenuAnchor(null);
  };

  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar variant="dense">
          <Box display="flex" alignItems="center">
            <Logo />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                ml: 1,
                fontSize: "1.1rem",
              }}
            >
              <Box component="svg" width="150" height="30" viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg" sx={{ mr: 1 }}>
                <path d="M16.4 30L10.4 9.6H15.2L18.4 22.8L21.6 9.6H26.4L20.4 30H16.4ZM31.6 30V9.6H36.4V30H31.6ZM41.6 30V9.6H46.4V26.4H54.4V30H41.6ZM60.4 30V9.6H65.2V26.4H73.2V30H60.4ZM81.6 30V20.8H88L88.4 24.4H83.6V26.4H90V30H81.6ZM81.6 9.6H90V13.2H83.6V15.2H89.6V18.8H81.6V9.6ZM103.6 30V13.2H98.8V9.6H113.2V13.2H108.4V30H103.6ZM118.4 30V9.6H132.8V13.2H123.2V17.6H130.4V21.2H123.2V26.4H132.8V30H118.4ZM150.9 30V9.6H156.1L161.7 21.2V9.6H166.5V30H161.3L155.7 18.4V30H150.9Z" fill="#3f51b5" />
                <path d="M0 4C0 1.79086 1.79086 0 4 0H176C178.209 0 180 1.79086 180 4V36C180 38.2091 178.209 40 176 40H4C1.79086 40 0 38.2091 0 36V4Z" fill="none" stroke="#3f51b5" strokeWidth="2" />
              </Box>
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
            <Button component={Link} to="/" color={location.pathname === "/" ? "primary" : "inherit"} startIcon={<Home />} size="small" sx={{ px: 1 }}>
              Home
            </Button>

            <Button color={toolPaths.has(location.pathname) ? "primary" : "inherit"} onClick={handleToolsMenuOpen} aria-controls="tools-menu" aria-haspopup="true" size="small" sx={{ px: 1 }}>
              Tools
            </Button>
            <Menu
              id="tools-menu"
              anchorEl={toolsMenuAnchor}
              keepMounted
              open={Boolean(toolsMenuAnchor)}
              onClose={handleToolsMenuClose}
              PaperProps={{
                style: {
                  maxHeight: "300px",
                },
              }}
            >
              {toolCategories.map((category) => (
                <MenuItem key={category.path} component={Link} to={category.path} onClick={handleToolsMenuClose} selected={location.pathname === category.path} dense>
                  <ListItemIcon>{category.icon}</ListItemIcon>
                  <ListItemText primary={category.name} />
                </MenuItem>
              ))}
            </Menu>

            <Button color={location.pathname === "/about" ? "primary" : "inherit"} component={Link} to="/about" startIcon={<Info />} size="small" sx={{ px: 1 }}>
              About
            </Button>
            <Button color={location.pathname === "/contact" ? "primary" : "inherit"} component={Link} to="/contact" startIcon={<ContactSupport />} size="small" sx={{ px: 1 }}>
              Contact
            </Button>
            <Button color="inherit" component={Link} to="/admin" startIcon={<AdminPanelSettings />} size="small" sx={{ px: 1 }}>
              Admin
            </Button>
            <Button color="primary" variant="contained" component="a" href="https://www.buymeacoffee.com/" target="_blank" rel="noopener noreferrer" startIcon={<Coffee />} size="small" sx={{ ml: 0.5 }}>
              Buy me a coffee
            </Button>
          </Box>

          {/* Mobile Navigation */}
          {isMobile && (
            <>
              <IconButton color="inherit" onClick={handleMoreMenuOpen} size="small">
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={moreMenuAnchor}
                open={Boolean(moreMenuAnchor)}
                onClose={handleMoreMenuClose}
                PaperProps={{
                  style: {
                    maxHeight: "400px",
                  },
                }}
              >
                <MenuItem component={Link} to="/" onClick={handleMoreMenuClose} dense>
                  <ListItemIcon>
                    <Home fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Home</ListItemText>
                </MenuItem>

                {toolCategories.map((category) => (
                  <MenuItem key={category.path} component={Link} to={category.path} onClick={handleMoreMenuClose} selected={location.pathname === category.path} dense>
                    <ListItemIcon>{category.icon}</ListItemIcon>
                    <ListItemText>{category.name}</ListItemText>
                  </MenuItem>
                ))}

                <MenuItem component={Link} to="/about" onClick={handleMoreMenuClose} dense>
                  <ListItemIcon>
                    <Info fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>About</ListItemText>
                </MenuItem>
                <MenuItem component={Link} to="/contact" onClick={handleMoreMenuClose} dense>
                  <ListItemIcon>
                    <ContactSupport fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Contact</ListItemText>
                </MenuItem>
                <MenuItem component={Link} to="/admin" onClick={handleMoreMenuClose} dense>
                  <ListItemIcon>
                    <AdminPanelSettings fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Admin</ListItemText>
                </MenuItem>
                <MenuItem component="a" href="https://www.buymeacoffee.com/" target="_blank" rel="noopener noreferrer" onClick={handleMoreMenuClose} dense>
                  <ListItemIcon>
                    <Coffee fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Buy me a coffee</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isToolRoute = toolPaths.has(location.pathname);
  const pageKey = getPageKey(location.pathname);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!isAdminRoute && <MetaPixelLoader />}
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2 },
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 1 }}>
          {!isAdminRoute && location.pathname !== "/" && <AdSlot slotKey="global-top" pageKey={pageKey} />}
          <Routes>
            <Route path="/" element={<HomePage />} />
            {toolCategories.map((category) => (
              <Route key={category.path} path={category.path} element={<category.component />} />
            ))}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          {!isAdminRoute && isToolRoute && <AdSlot slotKey="tool-inline" pageKey={pageKey} sx={{ mt: 3 }} />}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
