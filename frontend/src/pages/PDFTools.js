import React, { useState, useRef } from "react";
import { Box, Container, Paper, Typography, Tabs, Tab, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, Divider, Stack, Grid, Slider, FormControlLabel, Switch, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Upload, Delete, MergeType, CallSplit, Edit, Download, Add, RemoveCircleOutline, DragIndicator, Save, RotateLeft, RotateRight, Lock } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { pdfToolsApi } from "../services/api";
import { useTheme } from "@mui/material/styles";

function PdfTools() {
  const [activeTab, setActiveTab] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // PDF Split states
  const [splitPages, setSplitPages] = useState("");
  const [splitPreview, setSplitPreview] = useState(null);

  // PDF Merge states
  const [mergeOrder, setMergeOrder] = useState([]);

  // PDF Edit states
  const [editPages, setEditPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Add new state variables for additional features
  const [rotation, setRotation] = useState(0);
  const [password, setPassword] = useState("");
  const [isRemovePassword, setIsRemovePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [editOperations, setEditOperations] = useState([]);

  const [processedPdfUrl, setProcessedPdfUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const theme = useTheme();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedFiles([]);
    setError(null);
    setSuccess(null);
  };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      setError("Please select only PDF files");
      return;
    }

    setSelectedFiles((prevFiles) => [...prevFiles, ...pdfFiles]);
    setError(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedFiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedFiles(items);
  };

  const handleDownload = async (filename) => {
    try {
      setDownloading(true);
      if (!processedPdfUrl) return;

      await pdfToolsApi.downloadPdf(processedPdfUrl, filename);
    } catch (err) {
      setError("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleSplitPDF = async () => {
    try {
      setLoading(true);
            setError(null);
      setProcessedPdfUrl(null);

      if (!selectedFiles[0]) {
        throw new Error("Please select a PDF file to split");
      }

      const formData = new FormData();
      formData.append("file", selectedFiles[0]);
      formData.append("pages", splitPages);

      const result = await pdfToolsApi.splitPDF(formData);
      if (result.results && result.results.length > 0) {
        // For split PDF, we'll use the first result's URL
        setProcessedPdfUrl(result.results[0].url);
        setSuccess("PDF split successfully! Click download to save the file.");
      } else {
        throw new Error("Failed to process PDF");
      }
    } catch (err) {
      setError(err.message || "Failed to split PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleMergePDF = async () => {
    try {
      setLoading(true);
      setError(null);
      setProcessedPdfUrl(null);

        if (selectedFiles.length < 2) {
        throw new Error("Please select at least 2 PDF files to merge");
        }

            const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const result = await pdfToolsApi.mergePDF(formData);
      if (result.url) {
        setProcessedPdfUrl(result.url);
        setSuccess("PDFs merged successfully! Click download to save the file.");
      } else {
        throw new Error("Failed to process PDF");
      }
        } catch (err) {
      setError(err.message || "Failed to merge PDFs");
        } finally {
            setLoading(false);
        }
    };

  const handleEditPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      setProcessedPdfUrl(null);

      if (!selectedFiles[0]) {
        throw new Error("Please select a PDF file to edit");
      }

      const formData = new FormData();
      formData.append("pdf", selectedFiles[0]);
      formData.append("edits", JSON.stringify(editOperations));

      const result = await pdfToolsApi.editPDF(formData);
      if (result.url) {
        setProcessedPdfUrl(result.url);
        setSuccess("PDF edited successfully! Click download to save the file.");
      } else {
        throw new Error("Failed to process PDF");
      }
    } catch (err) {
      setError(err.message || "Failed to edit PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleProtectPDF = async () => {
    try {
        setLoading(true);
      setError(null);
      setProcessedPdfUrl(null);

      if (!selectedFiles[0]) {
        throw new Error("Please select a PDF file");
      }

      if (!isRemovePassword && !password) {
        throw new Error("Please enter a password");
      }

      if (isRemovePassword && !currentPassword) {
        throw new Error("Please enter the current password");
      }

            const formData = new FormData();
      formData.append("file", selectedFiles[0]);
      
      if (isRemovePassword) {
        formData.append("currentPassword", currentPassword);
        formData.append("action", "remove");
      } else {
      formData.append("password", password);
        formData.append("action", "protect");
      }

      const result = await pdfToolsApi.protectPdf(formData);
      if (result.url) {
        setProcessedPdfUrl(result.url);
        setSuccess(isRemovePassword ? "Password removed successfully!" : "PDF protected successfully!");
      } else {
        throw new Error("Failed to process PDF");
      }
        } catch (err) {
      setError(err.message || "Failed to process PDF");
        } finally {
            setLoading(false);
    }
  };

  const handleAddEditOperation = (type) => {
    setEditOperations([...editOperations, { type, pageNumber: currentPage }]);
  };

  const handleRemoveEditOperation = (index) => {
    setEditOperations(editOperations.filter((_, i) => i !== index));
  };

  const renderFileList = () => (
    <Box sx={{ my: 2 }}>
      {selectedFiles.length > 0 ? (
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
          Selected PDF File{selectedFiles.length > 1 ? 's' : ''}:
        </Typography>
      ) : null}
      
      <Grid container spacing={2}>
        {selectedFiles.map((file, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                position: 'relative',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* PDF Icon/Preview */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  position: 'relative',
                  bgcolor: theme.palette.primary.light + '20',
                  borderRadius: 1,
                  p: 2,
                  height: '100px',
                }}
              >
                <Typography 
                  variant="h1" 
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    fontSize: '3rem',
                    position: 'absolute',
                    opacity: 0.7,
                  }}
                >
                  PDF
                </Typography>
                
                {/* File extension badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  .PDF
                </Box>
              </Box>
              
              {/* File details */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                  title={file.name}
                >
                  {file.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem' }}>
                  {`${(file.size / 1024 / 1024).toFixed(2)} MB • Added ${new Date().toLocaleTimeString()}`}
                </Typography>
              </Box>
              
              {/* Delete button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => handleDeleteFile(index)}
                  sx={{ 
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderDownloadButton = () => {
    if (!processedPdfUrl) return null;

    const getFilename = () => {
      const originalName = selectedFiles[0]?.name || "document";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      switch (activeTab) {
        case 0: // Split
          return `split-${originalName}-${timestamp}.pdf`;
        case 1: // Merge
          return `merged-${timestamp}.pdf`;
        case 2: // Edit
          return `edited-${originalName}-${timestamp}.pdf`;
        case 3: // Protect
          return `protected-${originalName}-${timestamp}.pdf`;
        default:
          return `processed-${originalName}-${timestamp}.pdf`;
      }
    };

    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mt: 3, 
          textAlign: 'center', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.primary.light + '20'})`,
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          PDF Processed Successfully!
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            my: 2,
            height: '120px',
            position: 'relative',
            borderRadius: 1,
            bgcolor: 'rgba(0,0,0,0.04)',
          }}
        >
          <Box 
            sx={{ 
              width: '80px',
              height: '100px',
              bgcolor: 'white',
              boxShadow: 2,
              borderRadius: 1,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid',
              borderColor: theme.palette.divider,
              transform: 'rotate(-3deg)',
            }}
          >
            <Typography 
              variant="h5" 
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                fontSize: '1.5rem',
                opacity: 0.8,
              }}
            >
              PDF
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              width: '80px',
              height: '100px',
              bgcolor: 'white',
              boxShadow: 3,
              borderRadius: 1,
              position: 'absolute',
              zIndex: 2,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Typography 
              variant="h5" 
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                fontSize: '1.5rem',
              }}
            >
              PDF
            </Typography>
            
            {/* Success checkmark */}
            <Box
              sx={{
                position: 'absolute',
                top: -15,
                right: -15,
                bgcolor: theme.palette.success.main,
                color: 'white',
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                boxShadow: 2,
              }}
            >
              ✓
            </Box>
          </Box>
          
          <Box 
            sx={{ 
              width: '80px',
              height: '100px',
              bgcolor: 'white',
              boxShadow: 2,
              borderRadius: 1,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid',
              borderColor: theme.palette.divider,
              transform: 'rotate(3deg)',
            }}
          >
            <Typography 
              variant="h5" 
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                fontSize: '1.5rem',
                opacity: 0.8,
              }}
            >
              PDF
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Your PDF has been processed and is ready to download.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleDownload(getFilename())} 
          disabled={downloading} 
          startIcon={downloading ? <CircularProgress size={20} /> : <Download />} 
          sx={{ 
            px: 4, 
            py: 1.2,
            borderRadius: 8,
            textTransform: 'none',
            boxShadow: 3,
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          {downloading ? "Downloading..." : "Download PDF"}
        </Button>
      </Paper>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Split PDF
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Split PDF by specifying page ranges (e.g., 1-3,5,7-9)
            </Typography>
            <TextField fullWidth label="Page Ranges" value={splitPages} onChange={(e) => setSplitPages(e.target.value)} placeholder="e.g., 1-3,5,7-9" margin="normal" />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleSplitPDF} disabled={!selectedFiles.length || loading} startIcon={loading ? <CircularProgress size={20} /> : <CallSplit />}>
                {loading ? "Processing..." : "Split PDF"}
              </Button>
              {renderDownloadButton()}
            </Stack>
          </Box>
        );

      case 1: // Merge PDF
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Select multiple PDFs for merging
            </Typography>
            {renderFileList()}
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleMergePDF} disabled={selectedFiles.length < 2 || loading} startIcon={loading ? <CircularProgress size={20} /> : <MergeType />}>
                {loading ? "Processing..." : "Merge PDFs"}
              </Button>
              {renderDownloadButton()}
            </Stack>
          </Box>
        );

      case 2: // Edit PDF
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Select a PDF file to edit its pages
            </Typography>
            {selectedFiles.length > 0 && (
              <>
                {renderFileList()}
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography gutterBottom>Rotation</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <IconButton onClick={() => setRotation((r) => r - 90)}>
                        <RotateLeft />
                      </IconButton>
                      <Slider value={rotation} onChange={(e, newValue) => setRotation(newValue)} min={-180} max={180} step={90} marks valueLabelDisplay="auto" />
                      <IconButton onClick={() => setRotation((r) => r + 90)}>
                        <RotateRight />
                      </IconButton>
                    </Stack>
                  </Box>
                  <Button variant="contained" onClick={() => setEditDialogOpen(true)} startIcon={<Edit />}>
                    Edit Pages
                  </Button>
                </Stack>
              </>
            )}
          </Box>
        );

      case 3: // Protect PDF
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              {isRemovePassword ? "Remove password from PDF" : "Add password protection to PDF"}
            </Typography>
            {selectedFiles.length > 0 && (
              <>
                {renderFileList()}
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isRemovePassword}
                        onChange={(e) => {
                          setIsRemovePassword(e.target.checked);
                          setError(null);
                          setSuccess(null);
                        }}
                      />
                    }
                    label="Remove Password"
                  />

                  {isRemovePassword ? (
                    <TextField
                      fullWidth
                      type="password"
                      label="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  )}

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={handleProtectPDF}
                      startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
                      disabled={(!isRemovePassword && !password) || (isRemovePassword && !currentPassword) || loading}
                    >
                      {loading ? "Processing..." : isRemovePassword ? "Remove Password" : "Protect PDF"}
                    </Button>
                    {renderDownloadButton()}
                  </Stack>
                </Stack>
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const renderEditDialog = () => (
    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Edit PDF Pages</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" gutterBottom>
            Configure page operations:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Page Number</InputLabel>
            <Select value={currentPage} onChange={(e) => setCurrentPage(e.target.value)}>
              {Array.from({ length: selectedFiles[0]?.size || 0 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  Page {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => handleAddEditOperation("delete")} startIcon={<Delete />}>
              Delete Page
            </Button>
            <Button variant="outlined" onClick={() => handleAddEditOperation("duplicate")} startIcon={<Add />}>
              Duplicate Page
            </Button>
          </Stack>
          <Divider />
          <Typography variant="subtitle2">Operations:</Typography>
          <List>
            {editOperations.map((op, index) => (
              <ListItem key={index}>
                <ListItemText primary={`${op.type.charAt(0).toUpperCase() + op.type.slice(1)} Page ${op.pageNumber}`} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemoveEditOperation(index)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleEditPDF} variant="contained" disabled={!editOperations.length}>
          Apply Changes
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderFileSelectSection = () => (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        mb: 3,
        border: '2px dashed',
        borderColor: theme.palette.primary.light,
        bgcolor: theme.palette.primary.light + '08',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Upload sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1, opacity: 0.8 }} />
        
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Select PDF File{activeTab === 1 ? 's' : ''}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {activeTab === 0 ? "Choose a PDF file to split into multiple documents" :
           activeTab === 1 ? "Select multiple PDF files to combine into one document" :
           activeTab === 2 ? "Choose a PDF file to edit its pages or content" :
           "Select a PDF file to add or remove password protection"}
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={() => fileInputRef.current.click()} 
          startIcon={<Upload />}
          sx={{ 
            px: 3, 
            py: 1,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Browse Files
        </Button>
        <input type="file" hidden multiple={activeTab === 1} accept=".pdf" ref={fileInputRef} onChange={handleFileSelect} />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.75rem' }}>
          Maximum file size: 50MB per PDF
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mt: 0, mb: 1 }}>
          PDF Tools
        </Typography>

        {(error || success) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 1 }} onClose={() => (error ? setError(null) : setSuccess(null))}>
            {error || success}
          </Alert>
        )}

        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Split PDF" icon={<CallSplit />} iconPosition="start" />
            <Tab label="Merge PDFs" icon={<MergeType />} iconPosition="start" />
            <Tab label="Edit PDF" icon={<Edit />} iconPosition="start" />
            <Tab label="Protect PDF" icon={<Lock />} iconPosition="start" />
          </Tabs>
        </Paper>

        {selectedFiles.length === 0 ? renderFileSelectSection() : 
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            {renderFileList()}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => fileInputRef.current.click()} 
                startIcon={<Upload />}
                sx={{ mx: 1 }}
              >
                Add More File{activeTab === 1 ? 's' : ''}
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => setSelectedFiles([])} 
                startIcon={<Delete />}
                sx={{ mx: 1 }}
              >
                Clear All
              </Button>
            </Box>
          </Paper>
        }

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ mt: 1 }}>{renderTabContent()}</Box>
        </Paper>

        {renderEditDialog()}
      </Box>
    </Container>
  );
}

export default PdfTools;
