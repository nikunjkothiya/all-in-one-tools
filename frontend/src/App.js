import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';

// Import pages
import Home from './pages/Home';
import TextTools from './pages/TextTools';
import ImageTools from './pages/ImageTools';
import PDFTools from './pages/PDFTools';
import DeveloperTools from './pages/DeveloperTools';
import FileTools from './pages/FileTools';
import MediaTools from './pages/MediaTools';
import WebTools from './pages/WebTools';
import DataTools from './pages/DataTools';
import PrivacyTools from './pages/PrivacyTools';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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
