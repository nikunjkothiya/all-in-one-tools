import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Layout from "./components/Layout";
import "./App.css";
import "./styles/theme.css"; // Import our new theme

// Import pages
import Home from "./pages/Home";
import TextTools from "./pages/TextTools";
import ImageTools from "./pages/ImageTools";
import PDFTools from "./pages/PDFTools";
import DeveloperTools from "./pages/DeveloperTools";
import FileTools from "./pages/FileTools";
import MediaTools from "./pages/MediaTools";
import WebTools from "./pages/WebTools";
import DataTools from "./pages/DataTools";
import PrivacyTools from "./pages/PrivacyTools";

// Create theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3d84f7",
    },
    secondary: {
      main: "#1e3fac",
    },
    background: {
      default: "#000000",
      paper: "#1c1c1c",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
    h1: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "0.9rem",
    },
    body2: {
      fontSize: "0.85rem",
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          padding: "0.4rem 0.75rem",
          fontSize: "0.9rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1c1c1c",
          borderRadius: 6,
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1c1c1c",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/text-tools" element={<TextTools />} />
            <Route path="/image-tools" element={<ImageTools />} />
            <Route path="/pdf-tools" element={<PDFTools />} />
            <Route path="/developer-tools" element={<DeveloperTools />} />
            <Route path="/file-tools" element={<FileTools />} />
            <Route path="/media-tools" element={<MediaTools />} />
            <Route path="/web-tools" element={<WebTools />} />
            <Route path="/data-tools" element={<DataTools />} />
            <Route path="/privacy-tools" element={<PrivacyTools />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
