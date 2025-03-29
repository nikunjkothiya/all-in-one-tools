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
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Image Tools
        </Typography>

        {(error || success) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }} onClose={() => (error ? setError(null) : setSuccess(null))}>
            {error || success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Image Upload and Preview Section */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
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
                  minHeight: previewUrl ? "auto" : "300px",
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
                        height: "auto",
                        display: "block",
                        objectFit: "contain",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: "rgba(0,0,0,0.6)",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": {
                          opacity: 1,
                        },
                      }}
                    >
                      <Stack spacing={2} direction="row">
                        <Button
                          variant="contained"
                          startIcon={<CloudUpload />}
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current.click();
                          }}
                          sx={{
                            color: "white",
                            bgcolor: "primary.main",
                            "&:hover": {
                              bgcolor: "primary.dark",
                            },
                          }}
                        >
                          Change Image
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<Delete />}
                          onClick={handleDeleteImage}
                          sx={{
                            color: "white",
                            bgcolor: "error.main",
                            "&:hover": {
                              bgcolor: "error.dark",
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                ) : (
                  <Stack spacing={2} alignItems="center" sx={{ p: 3 }}>
                    <CloudUpload sx={{ fontSize: 48, color: "grey.500" }} />
                    <Typography variant="h6" color="textSecondary">
                      Drag and drop an image here
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      or click to select a file
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Supports: JPG, PNG, WebP
                    </Typography>
                  </Stack>
                )}
              </Box>

              {previewUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    File: {selectedFile?.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Size: {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Image Operations Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Image Operations
              </Typography>

              <Grid container spacing={2}>
                {/* Dimensions */}
                <Grid item xs={12}>
                  <FormControlLabel control={<Switch checked={imageSettings.maintainAspectRatio} onChange={(e) => handleSettingChange("maintainAspectRatio", e.target.checked)} />} label="Maintain Aspect Ratio" />
                </Grid>

                <Grid item xs={6}>
                  <TextField fullWidth type="number" label="Width" value={imageSettings.width} onChange={(e) => handleSettingChange("width", parseInt(e.target.value))} InputProps={{ inputProps: { min: 1 } }} />
                </Grid>

                <Grid item xs={6}>
                  <TextField fullWidth type="number" label="Height" value={imageSettings.height} onChange={(e) => handleSettingChange("height", parseInt(e.target.value))} InputProps={{ inputProps: { min: 1 } }} />
                </Grid>

                {/* Image Quality */}
                <Grid item xs={12}>
                  <Typography gutterBottom>Quality</Typography>
                  <Slider value={imageSettings.quality} onChange={(e, value) => handleSettingChange("quality", value)} min={1} max={100} valueLabelDisplay="auto" />
                </Grid>

                {/* Rotation */}
                <Grid item xs={12}>
                  <Typography gutterBottom>Rotation</Typography>
                  <Slider value={imageSettings.rotation} onChange={(e, value) => handleSettingChange("rotation", value)} min={0} max={360} valueLabelDisplay="auto" />
                </Grid>

                {/* Image Adjustments */}
                <Grid item xs={12}>
                  <Typography gutterBottom>Brightness</Typography>
                  <Slider value={imageSettings.brightness} onChange={(e, value) => handleSettingChange("brightness", value)} min={0} max={200} valueLabelDisplay="auto" />
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>Contrast</Typography>
                  <Slider value={imageSettings.contrast} onChange={(e, value) => handleSettingChange("contrast", value)} min={0} max={200} valueLabelDisplay="auto" />
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>Saturation</Typography>
                  <Slider value={imageSettings.saturation} onChange={(e, value) => handleSettingChange("saturation", value)} min={0} max={200} valueLabelDisplay="auto" />
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>Blur</Typography>
                  <Slider value={imageSettings.blur} onChange={(e, value) => handleSettingChange("blur", value)} min={0} max={10} step={0.1} valueLabelDisplay="auto" />
                </Grid>

                {/* Format Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Format</InputLabel>
                    <Select value={imageSettings.format} label="Format" onChange={(e) => handleSettingChange("format", e.target.value)}>
                      <MenuItem value="jpeg">JPEG</MenuItem>
                      <MenuItem value="png">PNG</MenuItem>
                      <MenuItem value="webp">WebP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={handleResize} disabled={!selectedFile || loading} startIcon={<AspectRatio />} fullWidth>
                      Process Image
                    </Button>

                    <Button variant="outlined" onClick={handleReset} disabled={!selectedFile || loading} startIcon={<Refresh />}>
                      Reset
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Processed Image Section */}
          {processedUrl && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">Processed Image</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Download Image">
                    <IconButton onClick={handleDownload} color="primary">
                      <Download />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <img
                    src={processedUrl}
                    alt="Processed"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "600px",
                    }}
                  />
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
