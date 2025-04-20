import React, { useState, useRef, useCallback } from "react";
import { Box, Button, Container, Grid, Paper, Typography, Slider, FormControl, InputLabel, Select, MenuItem, TextField, IconButton, Alert, Tooltip, Stack, Switch, FormControlLabel } from "@mui/material";
import { CloudUpload, Download, Refresh, AspectRatio, Delete } from "@mui/icons-material";

function ImageTools() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Image manipulation states
  const [imageSettings, setImageSettings] = useState({
    width: 800,
    height: 600,
    quality: 80,
    format: "jpeg",
    maintainAspectRatio: true,
    rotation: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    compressionLevel: "medium",
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result);
          // Load image to get dimensions
          const img = new Image();
          img.onload = () => {
            setImageSettings((prev) => ({
              ...prev,
              width: img.width,
              height: img.height,
            }));
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
        setError(null);
        setProcessedUrl(null);
      } else {
        setError("Please select a valid image file");
      }
    }
  };

  const handleSettingChange = (setting, value) => {
    if (setting === "width" && imageSettings.maintainAspectRatio && selectedFile) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        setImageSettings((prev) => ({
          ...prev,
          width: value,
          height: Math.round(value / aspectRatio),
        }));
      };
      img.src = previewUrl;
    } else if (setting === "height" && imageSettings.maintainAspectRatio && selectedFile) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        setImageSettings((prev) => ({
          ...prev,
          height: value,
          width: Math.round(value * aspectRatio),
        }));
      };
      img.src = previewUrl;
    } else {
      setImageSettings((prev) => ({
        ...prev,
        [setting]: value,
      }));
    }
  };

  const handleResize = async () => {
    try {
      setLoading(true);
      setError(null);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = imageSettings.width;
        canvas.height = imageSettings.height;

        // Apply transformations
        ctx.filter = `brightness(${imageSettings.brightness}%) contrast(${imageSettings.contrast}%) saturate(${imageSettings.saturation}%) blur(${imageSettings.blur}px)`;

        // Handle rotation
        if (imageSettings.rotation !== 0) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((imageSettings.rotation * Math.PI) / 180);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        ctx.drawImage(img, 0, 0, imageSettings.width, imageSettings.height);

        const processedImage = canvas.toDataURL(`image/${imageSettings.format}`, imageSettings.quality / 100);
        setProcessedUrl(processedImage);
        setSuccess("Image processed successfully!");
        setLoading(false);
      };

      img.src = previewUrl;
    } catch (err) {
      setError("Failed to process image");
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (processedUrl) {
      const link = document.createElement("a");
      link.href = processedUrl;
      link.download = `processed-image.${imageSettings.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        setProcessedUrl(null);
        const img = new Image();
        img.onload = () => {
          setImageSettings({
            width: img.width,
            height: img.height,
            quality: 80,
            format: "jpeg",
            maintainAspectRatio: true,
            rotation: 0,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            compressionLevel: "medium",
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect({ target: { files: [file] } });
    } else {
      setError("Please drop a valid image file");
    }
  };

  const handleDeleteImage = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mt: 0, mb: 1 }}>
          Image Tools
        </Typography>

        {(error || success) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 1 }} onClose={() => (error ? setError(null) : setSuccess(null))}>
            {error || success}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Image Upload and Preview Section */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
                Upload Image
              </Typography>

              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileSelect} />

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  position: "relative",
                  minHeight: previewUrl ? "auto" : "250px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                {previewUrl ? (
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: "100%",
                        maxHeight: "250px",
                        objectFit: "contain",
                      }}
                    />
                    <IconButton
                      size="small"
                      color="primary"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "white",
                        "&:hover": { bgcolor: "grey.200" },
                      }}
                      onClick={handleDeleteImage}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", p: 1 }}>
                    <CloudUpload sx={{ fontSize: 40, color: "grey.500", mb: 1 }} />
                    <Typography>Drag and drop an image here</Typography>
                    <Typography variant="body2" color="textSecondary">
                      or click to select a file
                    </Typography>
                  </Box>
                )}
              </Box>

              {selectedFile && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button variant="contained" color="primary" onClick={handleResize} disabled={loading} size="small">
                    {loading ? "Processing..." : "Process Image"}
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleReset} disabled={loading} startIcon={<Refresh />} size="small">
                    Reset Settings
                  </Button>
                  {processedUrl && (
                    <Button variant="outlined" color="primary" onClick={handleDownload} startIcon={<Download />} size="small">
                      Download
                    </Button>
                  )}
                </Stack>
              )}
            </Paper>
          </Grid>

          {/* Image Settings and Controls Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
                Image Operations
              </Typography>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={imageSettings.maintainAspectRatio} onChange={(e) => handleSettingChange("maintainAspectRatio", e.target.checked)} color="primary" size="small" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ mr: 0.5 }}>
                        Maintain Aspect Ratio
                      </Typography>
                      <AspectRatio fontSize="small" />
                    </Box>
                  }
                />

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField label="Width" type="number" fullWidth value={imageSettings.width} onChange={(e) => handleSettingChange("width", parseInt(e.target.value, 10))} disabled={!selectedFile} inputProps={{ min: 1 }} variant="outlined" size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Height" type="number" fullWidth value={imageSettings.height} onChange={(e) => handleSettingChange("height", parseInt(e.target.value, 10))} disabled={!selectedFile} inputProps={{ min: 1 }} variant="outlined" size="small" />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Quality</span>
                  <span sx={{ fontWeight: "medium" }}>{imageSettings.quality}%</span>
                </Typography>
                <Slider
                  value={imageSettings.quality}
                  onChange={(_, value) => handleSettingChange("quality", value)}
                  min={1}
                  max={100}
                  disabled={!selectedFile}
                  marks={[
                    { value: 1, label: "1%" },
                    { value: 50, label: "50%" },
                    { value: 100, label: "100%" },
                  ]}
                  size="small"
                  sx={{
                    color: "primary.main",
                    "& .MuiSlider-thumb": {
                      height: 20,
                      width: 20,
                      bgcolor: "background.paper",
                      border: "2px solid currentColor",
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0px 0px 0px 8px rgba(25, 118, 210, 0.16)",
                      },
                    },
                    "& .MuiSlider-rail": {
                      opacity: 0.5,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Rotation</span>
                  <span sx={{ fontWeight: "medium" }}>{imageSettings.rotation}°</span>
                </Typography>
                <Slider
                  value={imageSettings.rotation}
                  onChange={(_, value) => handleSettingChange("rotation", value)}
                  min={0}
                  max={360}
                  disabled={!selectedFile}
                  marks={[
                    { value: 0, label: "0°" },
                    { value: 90, label: "90°" },
                    { value: 180, label: "180°" },
                    { value: 270, label: "270°" },
                    { value: 360, label: "360°" },
                  ]}
                  size="small"
                  sx={{
                    color: "primary.main",
                    "& .MuiSlider-thumb": {
                      height: 20,
                      width: 20,
                      bgcolor: "background.paper",
                      border: "2px solid currentColor",
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0px 0px 0px 8px rgba(25, 118, 210, 0.16)",
                      },
                    },
                    "& .MuiSlider-rail": {
                      opacity: 0.5,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Brightness</span>
                  <span sx={{ fontWeight: "medium" }}>{imageSettings.brightness}%</span>
                </Typography>
                <Slider
                  value={imageSettings.brightness}
                  onChange={(_, value) => handleSettingChange("brightness", value)}
                  min={0}
                  max={200}
                  disabled={!selectedFile}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 100, label: "100%" },
                    { value: 200, label: "200%" },
                  ]}
                  size="small"
                  sx={{
                    color: "primary.main",
                    "& .MuiSlider-thumb": {
                      height: 20,
                      width: 20,
                      bgcolor: "background.paper",
                      border: "2px solid currentColor",
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0px 0px 0px 8px rgba(25, 118, 210, 0.16)",
                      },
                    },
                    "& .MuiSlider-rail": {
                      opacity: 0.5,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Contrast</span>
                  <span sx={{ fontWeight: "medium" }}>{imageSettings.contrast}%</span>
                </Typography>
                <Slider
                  value={imageSettings.contrast}
                  onChange={(_, value) => handleSettingChange("contrast", value)}
                  min={0}
                  max={200}
                  disabled={!selectedFile}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 100, label: "100%" },
                    { value: 200, label: "200%" },
                  ]}
                  size="small"
                  sx={{
                    color: "primary.main",
                    "& .MuiSlider-thumb": {
                      height: 20,
                      width: 20,
                      bgcolor: "background.paper",
                      border: "2px solid currentColor",
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0px 0px 0px 8px rgba(25, 118, 210, 0.16)",
                      },
                    },
                    "& .MuiSlider-rail": {
                      opacity: 0.5,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Saturation</span>
                  <span sx={{ fontWeight: "medium" }}>{imageSettings.saturation}%</span>
                </Typography>
                <Slider
                  value={imageSettings.saturation}
                  onChange={(_, value) => handleSettingChange("saturation", value)}
                  min={0}
                  max={200}
                  disabled={!selectedFile}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 100, label: "100%" },
                    { value: 200, label: "200%" },
                  ]}
                  size="small"
                  sx={{
                    color: "primary.main",
                    "& .MuiSlider-thumb": {
                      height: 20,
                      width: 20,
                      bgcolor: "background.paper",
                      border: "2px solid currentColor",
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0px 0px 0px 8px rgba(25, 118, 210, 0.16)",
                      },
                    },
                    "& .MuiSlider-rail": {
                      opacity: 0.5,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Blur</span>
                  <span sx={{ fontWeight: "medium" }}>{imageSettings.blur}px</span>
                </Typography>
                <Slider
                  value={imageSettings.blur}
                  onChange={(_, value) => handleSettingChange("blur", value)}
                  min={0}
                  max={20}
                  disabled={!selectedFile}
                  marks={[
                    { value: 0, label: "0px" },
                    { value: 10, label: "10px" },
                    { value: 20, label: "20px" },
                  ]}
                  size="small"
                  sx={{
                    color: "primary.main",
                    "& .MuiSlider-thumb": {
                      height: 20,
                      width: 20,
                      bgcolor: "background.paper",
                      border: "2px solid currentColor",
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0px 0px 0px 8px rgba(25, 118, 210, 0.16)",
                      },
                    },
                    "& .MuiSlider-rail": {
                      opacity: 0.5,
                    },
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="dense" size="small">
                    <InputLabel>Format</InputLabel>
                    <Select value={imageSettings.format} onChange={(e) => handleSettingChange("format", e.target.value)} label="Format" disabled={!selectedFile}>
                      <MenuItem value="jpeg">JPEG</MenuItem>
                      <MenuItem value="png">PNG</MenuItem>
                      <MenuItem value="webp">WebP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="dense" size="small">
                    <InputLabel>Compression</InputLabel>
                    <Select value={imageSettings.compressionLevel} onChange={(e) => handleSettingChange("compressionLevel", e.target.value)} label="Compression" disabled={!selectedFile}>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Result Preview Section */}
          {processedUrl && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
                  Processed Image
                </Typography>
                <Box sx={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
                  <img
                    src={processedUrl}
                    alt="Processed"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
                  <Button variant="contained" color="primary" onClick={handleDownload} startIcon={<Download />} sx={{ mt: 1 }}>
                    Download
                  </Button>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}

export default ImageTools;
