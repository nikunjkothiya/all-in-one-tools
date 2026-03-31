import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  AspectRatio,
  AutoAwesome,
  CloudUpload,
  Delete,
  Download,
  Refresh,
  Tune,
} from "@mui/icons-material";
import { imageProcessingApi, resolveApiUrl } from "../services/api";

const DEFAULT_EDITOR_SETTINGS = {
  width: 800,
  height: 600,
  quality: 82,
  format: "jpeg",
  maintainAspectRatio: true,
  rotation: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  compressionLevel: "medium",
};

const COMPRESSION_MULTIPLIER = {
  low: 1,
  medium: 0.9,
  high: 0.78,
};

const BROWSER_PREVIEWABLE_FORMATS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

const createInitialSettings = (dimensions = DEFAULT_EDITOR_SETTINGS) => ({
  ...DEFAULT_EDITOR_SETTINGS,
  width: dimensions.width,
  height: dimensions.height,
});

const clampValue = (value, min, max, fallback) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsedValue));
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });

const estimateDataUrlBytes = (value) => {
  if (!value || !value.includes(",")) {
    return 0;
  }

  const base64Payload = value.split(",")[1];
  return Math.ceil((base64Payload.length * 3) / 4);
};

const formatBytes = (value) => {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 KB";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const formatNumber = (value, unit = "") => `${value}${unit}`;

const getExtensionFromUrl = (value, fallback = "jpg") => {
  if (!value) {
    return fallback;
  }

  const sanitizedValue = value.split("?")[0].split("#")[0];
  const extension = sanitizedValue.split(".").pop()?.toLowerCase();

  if (!extension || extension === sanitizedValue.toLowerCase()) {
    return fallback;
  }

  return extension === "jpeg" ? "jpg" : extension;
};

const sliderStyle = {
  color: "primary.main",
  px: 0.5,
  "& .MuiSlider-thumb": {
    width: 16,
    height: 16,
    bgcolor: "background.paper",
    border: "2px solid currentColor",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.18)",
    "&:hover, &.Mui-focusVisible": {
      boxShadow: "0 0 0 8px rgba(63, 81, 181, 0.14)",
    },
  },
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-rail": {
    opacity: 0.35,
  },
};

const sliderDefinitions = [
  {
    key: "quality",
    label: "Quality",
    min: 1,
    max: 100,
    step: 1,
    unit: "%",
  },
  {
    key: "rotation",
    label: "Rotation",
    min: 0,
    max: 360,
    step: 1,
    unit: "\u00b0",
  },
  {
    key: "brightness",
    label: "Brightness",
    min: 0,
    max: 200,
    step: 1,
    unit: "%",
  },
  {
    key: "contrast",
    label: "Contrast",
    min: 0,
    max: 200,
    step: 1,
    unit: "%",
  },
  {
    key: "saturation",
    label: "Saturation",
    min: 0,
    max: 200,
    step: 1,
    unit: "%",
  },
  {
    key: "blur",
    label: "Blur",
    min: 0,
    max: 20,
    step: 0.5,
    unit: "px",
  },
];

const utilityTabs = [
  { label: "Resize" },
  { label: "Convert" },
  { label: "Compress" },
  { label: "Watermark" },
  { label: "Clean EXIF" },
];

const ControlSlider = ({ label, min, max, step, value, unit, disabled, onChange }) => (
  <Box>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Chip size="small" label={formatNumber(value, unit)} sx={{ height: 24, fontWeight: 600 }} />
    </Stack>
    <Slider
      value={value}
      onChange={(_, nextValue) => onChange(nextValue)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      valueLabelDisplay="auto"
      sx={sliderStyle}
    />
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="caption" color="text.secondary">
        {formatNumber(min, unit)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {formatNumber(max, unit)}
      </Typography>
    </Stack>
  </Box>
);

const PreviewPane = ({ title, subtitle, imageUrl, isRendering = false, emptyMessage = "Upload an image to start editing" }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.5,
      borderRadius: 3,
      borderColor: "divider",
      height: "100%",
      bgcolor: "background.paper",
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
      {isRendering ? <Chip size="small" color="primary" label="Updating" /> : null}
    </Stack>
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: 240, md: 380 },
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
        backgroundImage:
          "linear-gradient(45deg, rgba(148, 163, 184, 0.15) 25%, transparent 25%), linear-gradient(-45deg, rgba(148, 163, 184, 0.15) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148, 163, 184, 0.15) 75%), linear-gradient(-45deg, transparent 75%, rgba(148, 163, 184, 0.15) 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            maxHeight: "440px",
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      )}
      {isRendering ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.58)",
            backdropFilter: "blur(2px)",
          }}
        >
          <CircularProgress size={30} thickness={4.5} />
        </Box>
      ) : null}
    </Box>
  </Paper>
);

function ImageTools() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [renderInfo, setRenderInfo] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [base64Output, setBase64Output] = useState("");
  const [imageSettings, setImageSettings] = useState(createInitialSettings());
  const [utilityTab, setUtilityTab] = useState(0);
  const [utilityLoading, setUtilityLoading] = useState(false);
  const [utilityResultUrl, setUtilityResultUrl] = useState("");
  const [utilitySettings, setUtilitySettings] = useState({
    width: DEFAULT_EDITOR_SETTINGS.width,
    height: DEFAULT_EDITOR_SETTINGS.height,
    fit: "cover",
    convertFormat: "png",
    compressFormat: "jpeg",
    compressQuality: 80,
    watermarkText: "All-in-One Tools",
    watermarkPosition: "bottom-right",
    watermarkOpacity: 0.5,
  });
  const fileInputRef = useRef(null);
  const previewObjectUrlRef = useRef(null);
  const renderRequestRef = useRef(0);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const clearLoadedImage = () => {
    renderRequestRef.current += 1;

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setOriginalDimensions({ width: 0, height: 0 });
    setRenderInfo(null);
    setRendering(false);
    setImageSettings(createInitialSettings());
    setUtilityResultUrl("");
    setUtilitySettings((previous) => ({
      ...previous,
      width: DEFAULT_EDITOR_SETTINGS.width,
      height: DEFAULT_EDITOR_SETTINGS.height,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadSelectedFile = useCallback(async (file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);

    try {
      const image = await loadImage(nextPreviewUrl);

      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }

      previewObjectUrlRef.current = nextPreviewUrl;
      setSelectedFile(file);
      setPreviewUrl(nextPreviewUrl);
      setProcessedUrl(null);
      setRenderInfo(null);
      setOriginalDimensions({ width: image.width, height: image.height });
      setImageSettings(createInitialSettings({ width: image.width, height: image.height }));
      setUtilitySettings((previous) => ({
        ...previous,
        width: image.width,
        height: image.height,
      }));
      setUtilityResultUrl("");
      setError(null);
      setSuccess(null);
    } catch (loadError) {
      URL.revokeObjectURL(nextPreviewUrl);
      setError("The selected image could not be loaded.");
    }
  }, []);

  const renderImagePreview = useCallback(async (sourceUrl, settings) => {
    const requestId = renderRequestRef.current + 1;
    renderRequestRef.current = requestId;
    setRendering(true);

    try {
      const image = await loadImage(sourceUrl);
      const targetWidth = clampValue(settings.width, 1, 12000, image.width);
      const targetHeight = clampValue(settings.height, 1, 12000, image.height);
      const rotationInRadians = (Number(settings.rotation) * Math.PI) / 180;
      const horizontalFactor = Math.abs(Math.cos(rotationInRadians));
      const verticalFactor = Math.abs(Math.sin(rotationInRadians));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context unavailable");
      }

      const outputWidth = Math.max(1, Math.round(targetWidth * horizontalFactor + targetHeight * verticalFactor));
      const outputHeight = Math.max(1, Math.round(targetWidth * verticalFactor + targetHeight * horizontalFactor));

      canvas.width = outputWidth;
      canvas.height = outputHeight;
      context.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) blur(${settings.blur}px)`;
      context.translate(outputWidth / 2, outputHeight / 2);
      context.rotate(rotationInRadians);
      context.drawImage(image, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);

      const mimeType = settings.format === "png" ? "image/png" : settings.format === "webp" ? "image/webp" : "image/jpeg";
      const effectiveQuality = Math.min(1, Math.max(0.05, (settings.quality / 100) * (COMPRESSION_MULTIPLIER[settings.compressionLevel] ?? 1)));
      const nextProcessedUrl = mimeType === "image/png" ? canvas.toDataURL(mimeType) : canvas.toDataURL(mimeType, effectiveQuality);

      if (requestId !== renderRequestRef.current) {
        return;
      }

      setProcessedUrl(nextProcessedUrl);
      setRenderInfo({
        width: outputWidth,
        height: outputHeight,
        sizeLabel: formatBytes(estimateDataUrlBytes(nextProcessedUrl)),
      });
      setError(null);
    } catch (processingError) {
      if (requestId !== renderRequestRef.current) {
        return;
      }

      setError("Live preview could not be updated. Try another image or reset the editor.");
    } finally {
      if (requestId === renderRequestRef.current) {
        setRendering(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!previewUrl || !selectedFile) {
      setProcessedUrl(null);
      setRenderInfo(null);
      setRendering(false);
      return undefined;
    }

    const debounceTimer = window.setTimeout(() => {
      renderImagePreview(previewUrl, imageSettings);
    }, 140);

    return () => {
      window.clearTimeout(debounceTimer);
    };
  }, [imageSettings, previewUrl, renderImagePreview, selectedFile]);

  useEffect(() => {
    setUtilityResultUrl("");
    setError(null);
    setSuccess(null);
  }, [utilityTab]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      loadSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file) {
      loadSelectedFile(file);
    }
  };

  const handleSettingChange = (setting, value) => {
    setImageSettings((previousSettings) => {
      if (setting === "maintainAspectRatio") {
        if (!value || !originalDimensions.width || !originalDimensions.height) {
          return {
            ...previousSettings,
            maintainAspectRatio: value,
          };
        }

        return {
          ...previousSettings,
          maintainAspectRatio: value,
          height: Math.max(1, Math.round((previousSettings.width * originalDimensions.height) / originalDimensions.width)),
        };
      }

      if (setting === "width") {
        const nextWidth = clampValue(value, 1, 12000, previousSettings.width);

        if (previousSettings.maintainAspectRatio && originalDimensions.width && originalDimensions.height) {
          return {
            ...previousSettings,
            width: nextWidth,
            height: Math.max(1, Math.round((nextWidth * originalDimensions.height) / originalDimensions.width)),
          };
        }

        return {
          ...previousSettings,
          width: nextWidth,
        };
      }

      if (setting === "height") {
        const nextHeight = clampValue(value, 1, 12000, previousSettings.height);

        if (previousSettings.maintainAspectRatio && originalDimensions.width && originalDimensions.height) {
          return {
            ...previousSettings,
            height: nextHeight,
            width: Math.max(1, Math.round((nextHeight * originalDimensions.width) / originalDimensions.height)),
          };
        }

        return {
          ...previousSettings,
          height: nextHeight,
        };
      }

      if (["quality", "rotation", "brightness", "contrast", "saturation", "blur"].includes(setting)) {
        const minimumValue = setting === "quality" ? 1 : 0;
        const fallbackValue = previousSettings[setting];
        const nextValue = clampValue(value, minimumValue, setting === "blur" ? 20 : setting === "rotation" ? 360 : setting === "quality" ? 100 : 200, fallbackValue);

        return {
          ...previousSettings,
          [setting]: nextValue,
        };
      }

      return {
        ...previousSettings,
        [setting]: value,
      };
    });
  };

  const handleReset = () => {
    if (!selectedFile || !originalDimensions.width || !originalDimensions.height) {
      return;
    }

    setImageSettings(createInitialSettings(originalDimensions));
    setError(null);
    setSuccess(null);
  };

  const handleDownload = () => {
    if (!processedUrl) {
      return;
    }

    const link = document.createElement("a");
    const baseFileName = selectedFile?.name?.replace(/\.[^/.]+$/, "") || "edited-image";

    link.href = processedUrl;
    link.download = `${baseFileName}.${imageSettings.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteImage = (event) => {
    event.stopPropagation();
    clearLoadedImage();
    setError(null);
    setSuccess(null);
  };

  const handleBase64Upload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file for Base64 conversion.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBase64Output(reader.result);
      setSuccess("Image converted to Base64.");
    };
    reader.onerror = () => {
      setError("Base64 conversion failed.");
    };
    reader.readAsDataURL(file);
  };

  const handleUtilitySettingChange = (key, value) => {
    setUtilitySettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleUtilityDimensionChange = (key, value) => {
    setUtilitySettings((previous) => ({
      ...previous,
      [key]: clampValue(value, 1, 12000, previous[key] || DEFAULT_EDITOR_SETTINGS[key]),
    }));
  };

  const handleRunUtility = async () => {
    if (!selectedFile) {
      setError("Upload an image before running a utility action.");
      return;
    }

    setUtilityLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      let response;
      let url;
      let successMessage;

      if (utilityTab === 0) {
        formData.append("width", utilitySettings.width);
        formData.append("height", utilitySettings.height);
        formData.append("fit", utilitySettings.fit);
        response = await imageProcessingApi.resizeImage(formData);
        url = response.resized;
        successMessage = "Image resized successfully.";
      } else if (utilityTab === 1) {
        formData.append("format", utilitySettings.convertFormat);
        response = await imageProcessingApi.convertImage(formData);
        url = response.converted;
        successMessage = `Image converted to ${utilitySettings.convertFormat.toUpperCase()}.`;
      } else if (utilityTab === 2) {
        formData.append("format", utilitySettings.compressFormat);
        formData.append("quality", clampValue(utilitySettings.compressQuality, 1, 100, 80));
        response = await imageProcessingApi.compressImage(formData);
        url = response.compressed;
        successMessage = "Compressed image generated successfully.";
      } else if (utilityTab === 3) {
        if (!utilitySettings.watermarkText.trim()) {
          throw new Error("Please enter watermark text.");
        }
        formData.append("text", utilitySettings.watermarkText);
        formData.append("position", utilitySettings.watermarkPosition);
        formData.append("opacity", utilitySettings.watermarkOpacity);
        response = await imageProcessingApi.watermarkImage(formData);
        url = response.watermarked;
        successMessage = "Watermark added successfully.";
      } else {
        response = await imageProcessingApi.removeExif(formData);
        url = response.cleaned;
        successMessage = "Image metadata cleaned successfully.";
      }

      const resolvedResultUrl = resolveApiUrl(url);
      const previewFallbackFormat = utilityTab === 1 ? utilitySettings.convertFormat : utilityTab === 2 ? utilitySettings.compressFormat : "jpg";
      const resultExtension = getExtensionFromUrl(resolvedResultUrl, previewFallbackFormat);
      const previewSupported = BROWSER_PREVIEWABLE_FORMATS.has(resultExtension);

      setUtilityResultUrl(resolvedResultUrl);
      if (!previewSupported) {
        successMessage = `${successMessage} Preview is not available for ${resultExtension.toUpperCase()} in this browser, but the file is ready to download.`;
      }
      setSuccess(successMessage);
    } catch (requestError) {
      setError(requestError?.response?.data?.error || requestError?.message || "Image utility request failed.");
    } finally {
      setUtilityLoading(false);
    }
  };

  const handleDownloadUtilityResult = () => {
    if (!utilityResultUrl) {
      return;
    }

    const link = document.createElement("a");
    const baseFileName = selectedFile?.name?.replace(/\.[^/.]+$/, "") || "image-result";
    const extension = getExtensionFromUrl(utilityResultUrl, utilityTab === 1 ? utilitySettings.convertFormat : "jpg");

    link.href = utilityResultUrl;
    link.download = `${baseFileName}-${utilityTabs[utilityTab].label.toLowerCase().replace(/\s+/g, "-")}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const selectedFileSummary = selectedFile ? `${selectedFile.name} • ${formatBytes(selectedFile.size)}` : "No file selected";
  const originalSummary =
    originalDimensions.width && originalDimensions.height ? `${originalDimensions.width} × ${originalDimensions.height}px` : "Original size";
  const editedSummary = renderInfo ? `${renderInfo.width} × ${renderInfo.height}px • ${renderInfo.sizeLabel}` : "Live preview";
  const utilityFallbackExtension = utilityTab === 1 ? utilitySettings.convertFormat : utilityTab === 2 ? utilitySettings.compressFormat : "jpg";
  const utilityResultExtension = getExtensionFromUrl(utilityResultUrl, utilityFallbackExtension);
  const utilityPreviewSupported = !utilityResultUrl || BROWSER_PREVIEWABLE_FORMATS.has(utilityResultExtension);
  const utilityPreviewSubtitle = utilityResultUrl
    ? utilityPreviewSupported
      ? utilityTabs[utilityTab].label
      : `${utilityTabs[utilityTab].label} generated. Download to review the ${utilityResultExtension.toUpperCase()} file.`
    : "Run a utility to generate a downloadable image";
  const utilityEmptyMessage =
    utilityResultUrl && !utilityPreviewSupported
      ? `Preview is unavailable for ${utilityResultExtension.toUpperCase()} output in this browser. Use Download to open the result.`
      : "Run a utility to generate a downloadable image";

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Image Tools
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload once, edit with live updates, and export polished results without leaving the browser.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip color="primary" variant="outlined" icon={<AutoAwesome />} label="Live preview" />
            <Chip variant="outlined" label={selectedFileSummary} />
          </Stack>
        </Stack>

        {(error || success) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }} onClose={() => (error ? setError(null) : setSuccess(null))}>
            {error || success}
          </Alert>
        )}

        <Grid container spacing={2.5} alignItems="stretch">
          <Grid item xs={12} lg={8}>
            <Paper
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minHeight: "100%",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
                    Editor Workspace
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Adjustments render automatically after each change, so there is no extra submit step.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileSelect} />
                  <Button variant="contained" startIcon={<CloudUpload />} onClick={() => fileInputRef.current?.click()}>
                    {selectedFile ? "Replace Image" : "Upload Image"}
                  </Button>
                  <Button variant="outlined" startIcon={<Refresh />} onClick={handleReset} disabled={!selectedFile}>
                    Reset
                  </Button>
                  <Button variant="outlined" startIcon={<Download />} onClick={handleDownload} disabled={!processedUrl || rendering}>
                    Download
                  </Button>
                </Stack>
              </Stack>

              {!previewUrl ? (
                <Box
                  sx={{
                    border: "2px dashed",
                    borderColor: "grey.300",
                    borderRadius: 3,
                    minHeight: { xs: 320, md: 520 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 3,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUpload sx={{ fontSize: 56, color: "primary.main", mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
                    Drag and drop an image here
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Click anywhere in this area to browse files. JPG, PNG, and WebP are supported.
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap>
                    <Chip label="Auto-updating preview" />
                    <Chip label="Compact editor controls" />
                    <Chip label="Client-side processing" />
                  </Stack>
                </Box>
              ) : (
                <>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.25,
                      borderRadius: 3,
                      borderColor: "divider",
                      bgcolor: "grey.50",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={originalSummary} />
                        <Chip size="small" label={editedSummary} />
                        <Chip size="small" label={`${imageSettings.format.toUpperCase()} export`} />
                      </Stack>
                      <IconButton
                        size="small"
                        color="default"
                        onClick={handleDeleteImage}
                        sx={{
                          bgcolor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <PreviewPane title="Original" subtitle={originalSummary} imageUrl={previewUrl} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <PreviewPane title="Edited" subtitle={editedSummary} imageUrl={processedUrl || previewUrl} isRendering={rendering} />
                    </Grid>
                  </Grid>
                </>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: { xs: 2, md: 2.25 },
                borderRadius: 3,
                position: { lg: "sticky" },
                top: { lg: 88 },
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Editor Controls
                    </Typography>
                    <Chip size="small" color="primary" variant="outlined" icon={<Tune />} label="Live" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Keep this rail compact while your preview updates automatically on the left.
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    bgcolor: "grey.50",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Dimensions
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={imageSettings.maintainAspectRatio}
                          onChange={(event) => handleSettingChange("maintainAspectRatio", event.target.checked)}
                          disabled={!selectedFile}
                        />
                      }
                      label={
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Typography variant="body2">Maintain aspect ratio</Typography>
                          <AspectRatio fontSize="small" />
                        </Stack>
                      }
                      sx={{ m: 0 }}
                    />
                    <Grid container spacing={1.25}>
                      <Grid item xs={6}>
                        <TextField
                          label="Width"
                          type="number"
                          fullWidth
                          size="small"
                          value={imageSettings.width}
                          onChange={(event) => handleSettingChange("width", event.target.value)}
                          disabled={!selectedFile}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Height"
                          type="number"
                          fullWidth
                          size="small"
                          value={imageSettings.height}
                          onChange={(event) => handleSettingChange("height", event.target.value)}
                          disabled={!selectedFile}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                    </Grid>
                    <ControlSlider
                      label="Rotation"
                      min={0}
                      max={360}
                      step={1}
                      value={imageSettings.rotation}
                      unit="\u00b0"
                      disabled={!selectedFile}
                      onChange={(value) => handleSettingChange("rotation", value)}
                    />
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    bgcolor: "grey.50",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Enhancements
                    </Typography>
                    {sliderDefinitions
                      .filter((slider) => ["brightness", "contrast", "saturation", "blur"].includes(slider.key))
                      .map((slider) => (
                        <ControlSlider
                          key={slider.key}
                          label={slider.label}
                          min={slider.min}
                          max={slider.max}
                          step={slider.step}
                          value={imageSettings[slider.key]}
                          unit={slider.unit}
                          disabled={!selectedFile}
                          onChange={(value) => handleSettingChange(slider.key, value)}
                        />
                      ))}
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    bgcolor: "grey.50",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Export
                    </Typography>
                    <ControlSlider
                      label="Quality"
                      min={1}
                      max={100}
                      step={1}
                      value={imageSettings.quality}
                      unit="%"
                      disabled={!selectedFile}
                      onChange={(value) => handleSettingChange("quality", value)}
                    />
                    <Grid container spacing={1.25}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Format</InputLabel>
                          <Select value={imageSettings.format} onChange={(event) => handleSettingChange("format", event.target.value)} label="Format" disabled={!selectedFile}>
                            <MenuItem value="jpeg">JPEG</MenuItem>
                            <MenuItem value="png">PNG</MenuItem>
                            <MenuItem value="webp">WebP</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Compression</InputLabel>
                          <Select
                            value={imageSettings.compressionLevel}
                            onChange={(event) => handleSettingChange("compressionLevel", event.target.value)}
                            label="Compression"
                            disabled={!selectedFile}
                          >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary">
                      Compression presets fine-tune the export quality on top of the main quality slider.
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Image Utilities
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Run backend-powered image actions for conversion, compression, watermarking, and metadata cleanup.
                  </Typography>
                </Box>
                <Chip variant="outlined" label={utilityTabs[utilityTab].label} />
              </Stack>

              <Tabs value={utilityTab} onChange={(_, nextValue) => setUtilityTab(nextValue)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
                {utilityTabs.map((tab) => (
                  <Tab key={tab.label} label={tab.label} />
                ))}
              </Tabs>

              <Grid container spacing={2}>
                <Grid item xs={12} lg={4}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: "100%", bgcolor: "grey.50" }}>
                    <Stack spacing={2}>
                      {utilityTab === 0 ? (
                        <>
                          <Grid container spacing={1.25}>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Width"
                                type="number"
                                value={utilitySettings.width}
                                onChange={(event) => handleUtilityDimensionChange("width", event.target.value)}
                                inputProps={{ min: 1 }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Height"
                                type="number"
                                value={utilitySettings.height}
                                onChange={(event) => handleUtilityDimensionChange("height", event.target.value)}
                                inputProps={{ min: 1 }}
                              />
                            </Grid>
                          </Grid>
                          <FormControl fullWidth size="small">
                            <InputLabel>Fit</InputLabel>
                            <Select value={utilitySettings.fit} label="Fit" onChange={(event) => handleUtilitySettingChange("fit", event.target.value)}>
                              <MenuItem value="cover">Cover</MenuItem>
                              <MenuItem value="contain">Contain</MenuItem>
                              <MenuItem value="fill">Fill</MenuItem>
                              <MenuItem value="inside">Inside</MenuItem>
                              <MenuItem value="outside">Outside</MenuItem>
                            </Select>
                          </FormControl>
                        </>
                      ) : null}

                      {utilityTab === 1 ? (
                        <FormControl fullWidth size="small">
                          <InputLabel>Convert to</InputLabel>
                          <Select value={utilitySettings.convertFormat} label="Convert to" onChange={(event) => handleUtilitySettingChange("convertFormat", event.target.value)}>
                            <MenuItem value="jpeg">JPEG</MenuItem>
                            <MenuItem value="png">PNG</MenuItem>
                            <MenuItem value="webp">WebP</MenuItem>
                            <MenuItem value="avif">AVIF</MenuItem>
                            <MenuItem value="gif">GIF</MenuItem>
                            <MenuItem value="tiff">TIFF</MenuItem>
                          </Select>
                        </FormControl>
                      ) : null}

                      {utilityTab === 2 ? (
                        <>
                          <FormControl fullWidth size="small">
                            <InputLabel>Output format</InputLabel>
                            <Select value={utilitySettings.compressFormat} label="Output format" onChange={(event) => handleUtilitySettingChange("compressFormat", event.target.value)}>
                              <MenuItem value="jpeg">JPEG</MenuItem>
                              <MenuItem value="png">PNG</MenuItem>
                              <MenuItem value="webp">WebP</MenuItem>
                              <MenuItem value="avif">AVIF</MenuItem>
                            </Select>
                          </FormControl>
                          <ControlSlider
                            label="Compression Quality"
                            min={1}
                            max={100}
                            step={1}
                            value={utilitySettings.compressQuality}
                            unit="%"
                            disabled={!selectedFile}
                            onChange={(value) => handleUtilitySettingChange("compressQuality", value)}
                          />
                        </>
                      ) : null}

                      {utilityTab === 3 ? (
                        <>
                          <TextField fullWidth size="small" label="Watermark text" value={utilitySettings.watermarkText} onChange={(event) => handleUtilitySettingChange("watermarkText", event.target.value)} />
                          <Grid container spacing={1.25}>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Position</InputLabel>
                                <Select value={utilitySettings.watermarkPosition} label="Position" onChange={(event) => handleUtilitySettingChange("watermarkPosition", event.target.value)}>
                                  <MenuItem value="top-left">Top Left</MenuItem>
                                  <MenuItem value="top-right">Top Right</MenuItem>
                                  <MenuItem value="bottom-left">Bottom Left</MenuItem>
                                  <MenuItem value="bottom-right">Bottom Right</MenuItem>
                                  <MenuItem value="center">Center</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <ControlSlider
                                label="Opacity"
                                min={0}
                                max={1}
                                step={0.05}
                                value={utilitySettings.watermarkOpacity}
                                unit=""
                                disabled={!selectedFile}
                                onChange={(value) => handleUtilitySettingChange("watermarkOpacity", value)}
                              />
                            </Grid>
                          </Grid>
                        </>
                      ) : null}

                      {utilityTab === 4 ? (
                        <Alert severity="info">This action removes embedded EXIF and related metadata while keeping the visible image content intact.</Alert>
                      ) : null}

                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" onClick={handleRunUtility} disabled={!selectedFile || utilityLoading}>
                          {utilityLoading ? "Running..." : `Run ${utilityTabs[utilityTab].label}`}
                        </Button>
                        <Button variant="outlined" onClick={handleDownloadUtilityResult} disabled={!utilityResultUrl}>
                          Download
                        </Button>
                      </Stack>

                      {utilityResultUrl && !utilityPreviewSupported ? (
                        <Alert severity="info">
                          The result was generated successfully, but {utilityResultExtension.toUpperCase()} files are not previewed reliably in all browsers.
                          Use the download button to inspect the output.
                        </Alert>
                      ) : null}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={8}>
                  <PreviewPane
                    title="Utility Result"
                    subtitle={utilityPreviewSubtitle}
                    imageUrl={utilityResultUrl ? (utilityPreviewSupported ? utilityResultUrl : "") : previewUrl}
                    isRendering={utilityLoading}
                    emptyMessage={utilityEmptyMessage}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Image ↔ Base64 Converter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Convert any image to a Base64 data URI and copy it directly from the same page.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <input style={{ display: "none" }} id="base64-image-upload" type="file" accept="image/*" onChange={handleBase64Upload} />
                  <label htmlFor="base64-image-upload">
                    <Button variant="outlined" component="span" fullWidth startIcon={<CloudUpload />}>
                      Select Image for Base64
                    </Button>
                  </label>
                </Grid>
                <Grid item xs={12} md={7}>
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    label="Base64 Data URI"
                    placeholder="data:image/png;base64,..."
                    variant="outlined"
                    value={base64Output}
                    onChange={(event) => setBase64Output(event.target.value)}
                    InputProps={{ style: { fontFamily: "monospace", fontSize: 12 } }}
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        if (base64Output) {
                          navigator.clipboard.writeText(base64Output);
                          setSuccess("Base64 copied to clipboard.");
                        }
                      }}
                      disabled={!base64Output}
                    >
                      Copy to Clipboard
                    </Button>
                    <Button variant="text" size="small" onClick={() => setBase64Output("")} disabled={!base64Output}>
                      Clear
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default ImageTools;
