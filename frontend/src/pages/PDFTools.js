import React, { useState, useRef } from "react";
import { Box, Container, Paper, Typography, Tabs, Tab, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, Divider, Stack, Grid, Slider, FormControlLabel, Switch, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Upload, Delete, MergeType, CallSplit, Edit, Download, Add, RemoveCircleOutline, DragIndicator, Save, RotateLeft, RotateRight, Lock } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { pdfToolsApi } from "../services/api";

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
  const [permissions, setPermissions] = useState({
    print: true,
    edit: true,
    copy: true,
  });
  const [editOperations, setEditOperations] = useState([]);

  const [processedPdfUrl, setProcessedPdfUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);

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
        throw new Error("Please select a PDF file to protect");
      }

      if (!password) {
        throw new Error("Please enter a password");
      }

            const formData = new FormData();
      formData.append("file", selectedFiles[0]);
      formData.append("password", password);
      formData.append("permissions", JSON.stringify(permissions));

      const result = await pdfToolsApi.protectPdf(formData);
      if (result.url) {
        setProcessedPdfUrl(result.url);
        setSuccess("PDF protected successfully! Click download to save the file.");
      } else {
        throw new Error("Failed to process PDF");
      }
        } catch (err) {
      setError(err.message || "Failed to protect PDF");
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
    <List>
      {selectedFiles.map((file, index) => (
        <ListItem key={index} sx={{ bgcolor: "background.paper", mb: 1, borderRadius: 1 }}>
          <ListItemText primary={file.name} secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={() => handleDeleteFile(index)}>
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
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
      <Button variant="contained" color="primary" onClick={() => handleDownload(getFilename())} disabled={downloading} startIcon={downloading ? <CircularProgress size={20} /> : <Download />} sx={{ mt: 2 }}>
        {downloading ? "Downloading..." : "Download PDF"}
      </Button>
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
              Add password protection to your PDF
            </Typography>
            {selectedFiles.length > 0 && (
              <>
                {renderFileList()}
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField fullWidth type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <Typography variant="subtitle2" gutterBottom>
                    Permissions
                  </Typography>
                  <FormControlLabel control={<Switch checked={permissions.print} onChange={(e) => setPermissions({ ...permissions, print: e.target.checked })} />} label="Allow Printing" />
                  <FormControlLabel control={<Switch checked={permissions.edit} onChange={(e) => setPermissions({ ...permissions, edit: e.target.checked })} />} label="Allow Editing" />
                  <FormControlLabel control={<Switch checked={permissions.copy} onChange={(e) => setPermissions({ ...permissions, copy: e.target.checked })} />} label="Allow Copying" />
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={handleProtectPDF} startIcon={loading ? <CircularProgress size={20} /> : <Lock />} disabled={!password || loading}>
                      {loading ? "Processing..." : "Protect PDF"}
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

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
                    PDF Tools
                </Typography>

        {(error || success) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }} onClose={() => (error ? setError(null) : setSuccess(null))}>
            {error || success}
                    </Alert>
                )}

        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Split PDF" />
            <Tab label="Merge PDFs" />
            <Tab label="Edit PDF" />
            <Tab label="Protect PDF" />
          </Tabs>
        </Paper>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Upload PDF Files
                                </Typography>

                                <input
                                    type="file"
                hidden
                ref={fileInputRef}
                                    onChange={handleFileSelect}
                accept=".pdf"
                multiple={activeTab === 1} // Allow multiple files only for merge
              />

              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
                onClick={() => fileInputRef.current.click()}
              >
                <Upload sx={{ fontSize: 48, color: "grey.500", mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Click to upload PDF{activeTab === 1 ? "s" : ""}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  or drag and drop
                </Typography>
              </Box>

                                {selectedFiles.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Selected Files:
                                        </Typography>
                  {renderFileList()}
                                    </Box>
                                )}
            </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    PDF Operations
                                </Typography>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                                </Box>
              ) : (
                renderTabContent()
              )}
            </Paper>
                    </Grid>
                </Grid>

        {renderEditDialog()}
            </Box>
        </Container>
    );
}

export default PdfTools;
