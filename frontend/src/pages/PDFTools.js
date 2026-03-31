import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  CallSplit,
  Delete,
  Download,
  Edit,
  Lock,
  MergeType,
  NoteAdd,
  Upload,
  VerifiedUser,
} from "@mui/icons-material";
import { pdfToolsApi } from "../services/api";

const tabItems = [
  { label: "Split", icon: <CallSplit fontSize="small" /> },
  { label: "Merge", icon: <MergeType fontSize="small" /> },
  { label: "Edit Pages", icon: <Edit fontSize="small" /> },
  { label: "Protect", icon: <Lock fontSize="small" /> },
  { label: "Add Text", icon: <NoteAdd fontSize="small" /> },
  { label: "Add Signature", icon: <VerifiedUser fontSize="small" /> },
  { label: "Metadata", icon: <NoteAdd fontSize="small" /> },
];

const parseErrorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.details ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const createMetadataForm = (metadata = {}) => ({
  title: metadata.title || "",
  author: metadata.author || "",
  subject: metadata.subject || "",
  keywords: metadata.keywords || "",
  creator: metadata.creator || "",
  producer: metadata.producer || "",
  language: metadata.language || "",
});

function PdfTools() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processedPdfUrl, setProcessedPdfUrl] = useState("");
  const [processedPdfFilename, setProcessedPdfFilename] = useState("");
  const [splitResults, setSplitResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [splitPages, setSplitPages] = useState("1-2");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [removePassword, setRemovePassword] = useState(false);
  const [editOperations, setEditOperations] = useState([]);
  const [editPageNumber, setEditPageNumber] = useState(1);
  const [editRotation, setEditRotation] = useState(90);
  const [reorderFrom, setReorderFrom] = useState(1);
  const [reorderTo, setReorderTo] = useState(1);
  const [addTextForm, setAddTextForm] = useState({
    text: "",
    page: 1,
    x: 60,
    y: 700,
    fontSize: 16,
  });
  const [signatureForm, setSignatureForm] = useState({
    signature: "",
    page: 1,
    x: 60,
    y: 120,
  });
  const [metadataForm, setMetadataForm] = useState(createMetadataForm());
  const fileInputRef = useRef(null);

  const requiresSingleFile = activeTab !== 1;
  const singleFile = requiresSingleFile ? selectedFiles[0] || null : null;
  const pageCount = pdfInfo?.pageCount || 1;
  const activeLabel = useMemo(() => tabItems[activeTab].label, [activeTab]);

  useEffect(() => {
    if (!singleFile) {
      setPdfInfo(null);
      setMetadataForm(createMetadataForm());
      return;
    }

    if (activeTab === 1) {
      return;
    }

    const inspectPdf = async () => {
      setInspecting(true);
      try {
        const formData = new FormData();
        formData.append("file", singleFile);
        const response = await pdfToolsApi.handleMetadata(formData);
        const metadata = response.metadata || {};

        setPdfInfo(metadata);
        setMetadataForm(createMetadataForm(metadata));
        setEditPageNumber(1);
        setReorderFrom(1);
        setReorderTo(Math.min(2, metadata.pageCount || 1));
        setAddTextForm((previous) => ({ ...previous, page: 1 }));
        setSignatureForm((previous) => ({ ...previous, page: 1 }));
      } catch (requestError) {
        setError(parseErrorMessage(requestError, "Failed to inspect the selected PDF."));
      } finally {
        setInspecting(false);
      }
    };

    inspectPdf();
  }, [singleFile, activeTab]);

  const resetOutputs = () => {
    setProcessedPdfUrl("");
    setProcessedPdfFilename("");
    setSplitResults([]);
  };

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const resetTabState = (tabIndex) => {
    setActiveTab(tabIndex);
    setSelectedFiles([]);
    setEditOperations([]);
    setPdfInfo(null);
    setMetadataForm(createMetadataForm());
    resetOutputs();
    resetMessages();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      setError("Please select only PDF files.");
      return;
    }

    setSelectedFiles((previous) => (requiresSingleFile ? pdfFiles.slice(0, 1) : [...previous, ...pdfFiles]));
    resetOutputs();
    resetMessages();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index));
    resetOutputs();
  };

  const ensureSingleFile = () => {
    if (!singleFile) {
      setError("Please select a PDF file first.");
      return null;
    }

    return singleFile;
  };

  const downloadProcessedPdf = async (url, filename) => {
    try {
      await pdfToolsApi.downloadPdf(url, filename);
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Failed to download the PDF."));
    }
  };

  const handleSplitPdf = async () => {
    const file = ensureSingleFile();
    if (!file) {
      return;
    }

    if (!splitPages.trim()) {
      setError("Please enter page ranges to split.");
      return;
    }

    setLoading(true);
    resetMessages();
    resetOutputs();
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pages", splitPages);
      const response = await pdfToolsApi.splitPDF(formData);
      setSplitResults(response.results || []);
      setSuccess("PDF split successfully.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Failed to split the PDF."));
    } finally {
      setLoading(false);
    }
  };

  const handleMergePdf = async () => {
    if (selectedFiles.length < 2) {
      setError("Please select at least two PDF files to merge.");
      return;
    }

    setLoading(true);
    resetMessages();
    resetOutputs();
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      const response = await pdfToolsApi.mergePDF(formData);
      setProcessedPdfUrl(response.url);
      setProcessedPdfFilename(response.filename);
      setSuccess("PDFs merged successfully.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Failed to merge PDFs."));
    } finally {
      setLoading(false);
    }
  };

  const addEditOperation = (operation) => {
    setEditOperations((previous) => [...previous, operation]);
    resetMessages();
  };

  const handleApplyEditOperations = async () => {
    const file = ensureSingleFile();
    if (!file) {
      return;
    }

    if (!editOperations.length) {
      setError("Add at least one page operation first.");
      return;
    }

    setLoading(true);
    resetMessages();
    resetOutputs();
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("operations", JSON.stringify(editOperations));
      const response = await pdfToolsApi.editPDF(formData);
      setProcessedPdfUrl(response.url);
      setProcessedPdfFilename(response.filename);
      setSuccess("PDF edit operations applied successfully.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Failed to edit the PDF."));
    } finally {
      setLoading(false);
    }
  };

  const handleProtectPdf = async () => {
    const file = ensureSingleFile();
    if (!file) {
      return;
    }

    if (removePassword && !currentPassword.trim()) {
      setError("Please enter the current password to unlock the PDF.");
      return;
    }

    if (!removePassword && !password.trim()) {
      setError("Please enter a password to protect the PDF.");
      return;
    }

    setLoading(true);
    resetMessages();
    resetOutputs();
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", removePassword ? "remove" : "protect");
      if (removePassword) {
        formData.append("currentPassword", currentPassword);
      } else {
        formData.append("password", password);
      }
      const response = await pdfToolsApi.protectPdf(formData);
      setProcessedPdfUrl(response.url);
      setProcessedPdfFilename(response.filename);
      setSuccess(removePassword ? "Password removed successfully." : "PDF protected successfully.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Failed to process PDF protection."));
    } finally {
      setLoading(false);
    }
  };

  const handleAddText = async () => {
    const file = ensureSingleFile();
    if (!file) {
      return;
    }

    if (!addTextForm.text.trim()) {
      setError("Please enter text to place on the PDF.");
      return;
    }

    setLoading(true);
    resetMessages();
    resetOutputs();
    try {
      const formData = new FormData();
      formData.append("file", file);
      Object.entries(addTextForm).forEach(([key, value]) => formData.append(key, value));
      const response = await pdfToolsApi.addText(formData);
      setProcessedPdfUrl(response.url);
      setProcessedPdfFilename(response.filename || "pdf-added-text.pdf");
      setSuccess("Text added to PDF successfully.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Failed to add text to the PDF."));
    } finally {
      setLoading(false);
    }
  };

  const handleAddSignature = async () => {
    const file = ensureSingleFile();
    if (!file) {
      return;
    }

    if (!signatureForm.signature.trim()) {
      setError("Please enter a signature value.");
      return;
    }

    setLoading(true);
    resetMessages();
    resetOutputs();
    try {
      const formData = new FormData();
      formData.append("file", file);
      Object.entries(signatureForm).forEach(([key, value]) => formData.append(key, value));
      const response = await pdfToolsApi.addSignature(formData);
      setProcessedPdfUrl(response.url);
      setProcessedPdfFilename(response.filename || "pdf-added-signature.pdf");
      setSuccess("Signature added successfully.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Failed to add a signature to the PDF."));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMetadata = async () => {
    const file = ensureSingleFile();
    if (!file) {
      return;
    }

    setLoading(true);
    resetMessages();
    resetOutputs();
    try {
      const formData = new FormData();
      formData.append("file", file);
      Object.entries(metadataForm).forEach(([key, value]) => formData.append(key, value));
      const response = await pdfToolsApi.handleMetadata(formData);
      setProcessedPdfUrl(response.url || "");
      setProcessedPdfFilename(response.filename || "pdf-metadata-updated.pdf");
      if (response.metadata) {
        setPdfInfo(response.metadata);
        setMetadataForm(createMetadataForm(response.metadata));
      }
      setSuccess("PDF metadata updated successfully.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Failed to update PDF metadata."));
    } finally {
      setLoading(false);
    }
  };

  const renderFilePicker = () => (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        mb: 2,
        border: "2px dashed",
        borderColor: "primary.light",
        bgcolor: "rgba(63, 81, 181, 0.04)",
      }}
    >
      <Stack alignItems="center" textAlign="center" spacing={1.25}>
        <Upload sx={{ fontSize: 42, color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Upload {requiresSingleFile ? "a PDF" : "PDF files"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {requiresSingleFile
            ? "Choose one PDF to inspect, edit, sign, protect, or update metadata."
            : "Choose multiple PDFs to merge them into a single document."}
        </Typography>
        <Button variant="contained" onClick={() => fileInputRef.current?.click()}>
          Browse PDF Files
        </Button>
        <input ref={fileInputRef} type="file" hidden accept=".pdf,application/pdf" multiple={!requiresSingleFile} onChange={handleFileSelect} />
      </Stack>
    </Paper>
  );

  const renderSelectedFiles = () => (
    <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        Selected Files
      </Typography>
      <List dense>
        {selectedFiles.map((file, index) => (
          <ListItem key={`${file.name}-${index}`} divider={index < selectedFiles.length - 1}>
            <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => removeFile(index)}>
                <Delete fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
        <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
          {requiresSingleFile ? "Replace File" : "Add More Files"}
        </Button>
        <Button variant="outlined" color="error" onClick={() => setSelectedFiles([])}>
          Clear Selection
        </Button>
      </Stack>
      <input ref={fileInputRef} type="file" hidden accept=".pdf,application/pdf" multiple={!requiresSingleFile} onChange={handleFileSelect} />
    </Paper>
  );

  const renderDownloadArea = () => {
    if (!processedPdfUrl && !splitResults.length) {
      return null;
    }

    if (splitResults.length) {
      return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            Split Results
          </Typography>
          <Stack spacing={1}>
            {splitResults.map((item) => (
              <Stack key={item.filename} direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} sx={{ p: 1.25, borderRadius: 2, bgcolor: "grey.50" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Pages {item.range}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.filename}
                  </Typography>
                </Box>
                <Button variant="outlined" startIcon={<Download />} onClick={() => downloadProcessedPdf(item.url, item.filename)}>
                  Download
                </Button>
              </Stack>
            ))}
          </Stack>
        </Paper>
      );
    }

    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mt: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Processed PDF Ready
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {processedPdfFilename || "Download your updated document"}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Download />} onClick={() => downloadProcessedPdf(processedPdfUrl, processedPdfFilename || "processed.pdf")}>
            Download PDF
          </Button>
        </Stack>
      </Paper>
    );
  };

  const renderPdfInfo = () => {
    if (!singleFile || activeTab === 1) {
      return null;
    }

    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: "grey.50" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              PDF Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {singleFile.name}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={inspecting ? "Inspecting..." : `${pageCount} pages`} />
            {pdfInfo?.title ? <Chip size="small" label={`Title: ${pdfInfo.title}`} /> : null}
          </Stack>
        </Stack>
      </Paper>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 0) {
      return (
        <Stack spacing={2}>
          <Typography variant="body1" color="text.secondary">
            Split one document into multiple files using page ranges like `1-3, 4-6, 7-9`.
          </Typography>
          <TextField fullWidth label="Page ranges" value={splitPages} onChange={(event) => setSplitPages(event.target.value)} />
          <Button variant="contained" onClick={handleSplitPdf} disabled={loading || !singleFile}>
            {loading ? "Splitting..." : "Split PDF"}
          </Button>
        </Stack>
      );
    }

    if (activeTab === 1) {
      return (
        <Stack spacing={2}>
          <Typography variant="body1" color="text.secondary">
            Merge multiple PDFs into one file in the order shown above.
          </Typography>
          <Button variant="contained" onClick={handleMergePdf} disabled={loading || selectedFiles.length < 2}>
            {loading ? "Merging..." : "Merge PDFs"}
          </Button>
        </Stack>
      );
    }

    if (activeTab === 2) {
      return (
        <Stack spacing={2}>
          <Typography variant="body1" color="text.secondary">
            Queue page operations and apply them together. The backend currently supports rotation, deletion, and page reordering.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Target page"
                value={editPageNumber}
                onChange={(event) => setEditPageNumber(Number(event.target.value))}
                inputProps={{ min: 1, max: pageCount }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Rotation</InputLabel>
                <Select value={editRotation} label="Rotation" onChange={(event) => setEditRotation(Number(event.target.value))}>
                  <MenuItem value={90}>90°</MenuItem>
                  <MenuItem value={180}>180°</MenuItem>
                  <MenuItem value={270}>270°</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() =>
                    addEditOperation({
                      type: "rotate",
                      pageIndex: Math.max(0, editPageNumber - 1),
                      degrees: editRotation,
                    })
                  }
                  disabled={!singleFile}
                >
                  Add Rotation
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    addEditOperation({
                      type: "delete",
                      pageIndex: Math.max(0, editPageNumber - 1),
                    })
                  }
                  disabled={!singleFile}
                >
                  Delete Page
                </Button>
              </Stack>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Move page from" value={reorderFrom} onChange={(event) => setReorderFrom(Number(event.target.value))} inputProps={{ min: 1, max: pageCount }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Move page to" value={reorderTo} onChange={(event) => setReorderTo(Number(event.target.value))} inputProps={{ min: 1, max: pageCount }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() =>
                  addEditOperation({
                    type: "reorder",
                    fromIndex: Math.max(0, reorderFrom - 1),
                    toIndex: Math.max(0, reorderTo - 1),
                  })
                }
                disabled={!singleFile}
              >
                Add Reorder
              </Button>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Pending Operations
            </Typography>
            {editOperations.length ? (
              <List dense>
                {editOperations.map((operation, index) => (
                  <ListItem key={`${operation.type}-${index}`} divider={index < editOperations.length - 1}>
                    <ListItemText
                      primary={
                        operation.type === "rotate"
                          ? `Rotate page ${operation.pageIndex + 1} by ${operation.degrees}°`
                          : operation.type === "delete"
                            ? `Delete page ${operation.pageIndex + 1}`
                            : `Move page ${operation.fromIndex + 1} to ${operation.toIndex + 1}`
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => setEditOperations((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No operations added yet.
              </Typography>
            )}
          </Paper>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleApplyEditOperations} disabled={loading || !singleFile || !editOperations.length}>
              {loading ? "Applying..." : "Apply Operations"}
            </Button>
            <Button variant="text" onClick={() => setEditOperations([])} disabled={!editOperations.length}>
              Clear Operations
            </Button>
          </Stack>
        </Stack>
      );
    }

    if (activeTab === 3) {
      return (
        <Stack spacing={2}>
          <Typography variant="body1" color="text.secondary">
            Add password protection to a PDF or remove it when you already know the current password.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Mode</InputLabel>
            <Select value={removePassword ? "remove" : "protect"} label="Mode" onChange={(event) => setRemovePassword(event.target.value === "remove")}>
              <MenuItem value="protect">Protect PDF</MenuItem>
              <MenuItem value="remove">Remove Password</MenuItem>
            </Select>
          </FormControl>
          {removePassword ? (
            <TextField fullWidth type="password" label="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          ) : (
            <TextField fullWidth type="password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} />
          )}
          <Button variant="contained" onClick={handleProtectPdf} disabled={loading || !singleFile}>
            {loading ? "Processing..." : removePassword ? "Remove Password" : "Protect PDF"}
          </Button>
        </Stack>
      );
    }

    if (activeTab === 4) {
      return (
        <Stack spacing={2}>
          <Typography variant="body1" color="text.secondary">
            Place plain text on a selected page. Coordinates use the PDF canvas origin from the bottom-left corner.
          </Typography>
          <TextField fullWidth label="Text to add" value={addTextForm.text} onChange={(event) => setAddTextForm((previous) => ({ ...previous, text: event.target.value }))} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="number" label="Page" value={addTextForm.page} onChange={(event) => setAddTextForm((previous) => ({ ...previous, page: Number(event.target.value) }))} inputProps={{ min: 1, max: pageCount }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="number" label="X" value={addTextForm.x} onChange={(event) => setAddTextForm((previous) => ({ ...previous, x: Number(event.target.value) }))} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="number" label="Y" value={addTextForm.y} onChange={(event) => setAddTextForm((previous) => ({ ...previous, y: Number(event.target.value) }))} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="number" label="Font size" value={addTextForm.fontSize} onChange={(event) => setAddTextForm((previous) => ({ ...previous, fontSize: Number(event.target.value) }))} />
            </Grid>
          </Grid>
          <Button variant="contained" onClick={handleAddText} disabled={loading || !singleFile}>
            {loading ? "Adding..." : "Add Text"}
          </Button>
        </Stack>
      );
    }

    if (activeTab === 5) {
      return (
        <Stack spacing={2}>
          <Typography variant="body1" color="text.secondary">
            Add a text-based signature stamp to a selected page.
          </Typography>
          <TextField fullWidth label="Signature text" value={signatureForm.signature} onChange={(event) => setSignatureForm((previous) => ({ ...previous, signature: event.target.value }))} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Page" value={signatureForm.page} onChange={(event) => setSignatureForm((previous) => ({ ...previous, page: Number(event.target.value) }))} inputProps={{ min: 1, max: pageCount }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="X" value={signatureForm.x} onChange={(event) => setSignatureForm((previous) => ({ ...previous, x: Number(event.target.value) }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Y" value={signatureForm.y} onChange={(event) => setSignatureForm((previous) => ({ ...previous, y: Number(event.target.value) }))} />
            </Grid>
          </Grid>
          <Button variant="contained" onClick={handleAddSignature} disabled={loading || !singleFile}>
            {loading ? "Adding..." : "Add Signature"}
          </Button>
        </Stack>
      );
    }

    return (
      <Stack spacing={2}>
        <Typography variant="body1" color="text.secondary">
          Inspect document metadata and update editable fields before downloading a refreshed copy.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Title" value={metadataForm.title} onChange={(event) => setMetadataForm((previous) => ({ ...previous, title: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Author" value={metadataForm.author} onChange={(event) => setMetadataForm((previous) => ({ ...previous, author: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Subject" value={metadataForm.subject} onChange={(event) => setMetadataForm((previous) => ({ ...previous, subject: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Keywords" helperText="Comma-separated keywords" value={metadataForm.keywords} onChange={(event) => setMetadataForm((previous) => ({ ...previous, keywords: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Creator" value={metadataForm.creator} onChange={(event) => setMetadataForm((previous) => ({ ...previous, creator: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Producer" value={metadataForm.producer} onChange={(event) => setMetadataForm((previous) => ({ ...previous, producer: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Language" value={metadataForm.language} onChange={(event) => setMetadataForm((previous) => ({ ...previous, language: event.target.value }))} />
          </Grid>
        </Grid>
        {pdfInfo ? (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: "grey.50" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Current Metadata Snapshot
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={`${pdfInfo.pageCount || 0} pages`} />
              {pdfInfo.creationDate ? <Chip size="small" label={`Created ${new Date(pdfInfo.creationDate).toLocaleString()}`} /> : null}
              {pdfInfo.modificationDate ? <Chip size="small" label={`Modified ${new Date(pdfInfo.modificationDate).toLocaleString()}`} /> : null}
            </Stack>
          </Paper>
        ) : null}
        <Button variant="contained" onClick={handleUpdateMetadata} disabled={loading || !singleFile}>
          {loading ? "Saving..." : "Update Metadata"}
        </Button>
      </Stack>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              PDF Tools
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Split, merge, edit, protect, annotate, sign, and manage metadata from one PDF workspace.
            </Typography>
          </Box>
          <Chip color="primary" variant="outlined" label={activeLabel} />
        </Stack>

        {(error || success) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }} onClose={() => (error ? setError(null) : setSuccess(null))}>
            {error || success}
          </Alert>
        )}

        <Paper sx={{ p: 1, mb: 2, borderRadius: 3 }}>
          <Tabs value={activeTab} onChange={(_, nextValue) => resetTabState(nextValue)} variant="scrollable" scrollButtons="auto">
            {tabItems.map((tab) => (
              <Tab key={tab.label} label={tab.label} icon={tab.icon} iconPosition="start" />
            ))}
          </Tabs>
        </Paper>

        {!selectedFiles.length ? renderFilePicker() : renderSelectedFiles()}
        {renderPdfInfo()}

        <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
          {renderTabContent()}
        </Paper>

        {renderDownloadArea()}
      </Box>
    </Container>
  );
}

export default PdfTools;
