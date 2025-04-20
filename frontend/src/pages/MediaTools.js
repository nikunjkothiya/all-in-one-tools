import React, { useState, useRef, useEffect } from "react";
import { Box, Container, Typography, Grid, Card, CardContent, Button, Alert, Slider, FormControl, InputLabel, Select, MenuItem, TextField, Stack, Tabs, Tab, Paper, LinearProgress, CircularProgress } from "@mui/material";
import { VideoSettings, Transform, ContentCut, Speed, Compress } from "@mui/icons-material";
import { mediaToolsApi } from "../services/api";
import { socket } from "../services/socket";

// TabPanel component for tab content
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`media-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const MediaTools = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [processingId, setProcessingId] = useState(null);
  const fileInputRef = useRef(null);

  // Advanced settings state
  const [settings, setSettings] = useState({
    format: "mp4",
    quality: 80,
    fps: 30,
    bitrate: "1000k",
    audioCodec: "aac",
    videoCodec: "mpeg2video",
    resolution: "1280x720",
    startTime: "00:00:00",
    endTime: "00:00:10",
    speed: 1.0,
  });

  // Socket.IO event handling
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleProgress = (data) => {
      if (data.id === processingId) {
        setProgress(data.progress);
      }
    };

    socket.on("processing-progress", handleProgress);

    return () => {
      socket.off("processing-progress", handleProgress);
    };
  }, [processingId]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setError(null);
        setSuccess(null);
      } else {
        setError("Please select a valid video or audio file");
      }
    }
  };

  const handleSettingChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleDownload = (url, filename) => {
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const fullUrl = baseUrl + url;

    // Open video in new tab
    window.open(fullUrl, "_blank");

    // Also provide download option
    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError("Please select a media file first");
      return;
    }

    setLoading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("format", settings.format);
      formData.append("resolution", settings.resolution);
      formData.append("fps", settings.fps);
      formData.append("videoCodec", settings.videoCodec);
      formData.append("audioCodec", settings.audioCodec);

      // Generate a unique processing ID
      const newProcessingId = Date.now().toString();
      setProcessingId(newProcessingId);
      formData.append("processingId", newProcessingId);

      const response = await mediaToolsApi.convertMedia(formData);
      setSuccess(`Media converted to ${settings.format.toUpperCase()} successfully!`);

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      handleDownload(response.data.converted, `converted_${timestamp}.${settings.format}`);
    } catch (err) {
      setError(err.message || "Failed to convert media");
    } finally {
      setLoading(false);
      setProgress(0);
      setProcessingId(null);
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      setError("Please select a media file first");
      return;
    }

    setLoading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("quality", settings.quality);
      formData.append("bitrate", settings.bitrate);
      formData.append("videoCodec", settings.videoCodec);
      formData.append("audioCodec", settings.audioCodec);

      const newProcessingId = Date.now().toString();
      setProcessingId(newProcessingId);
      formData.append("processingId", newProcessingId);

      const response = await mediaToolsApi.compressMedia(formData);
      setSuccess("Media compressed successfully!");

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      handleDownload(response.data.compressed, `compressed_${timestamp}_${selectedFile.name}`);
    } catch (err) {
      setError(err.message || "Failed to compress media");
    } finally {
      setLoading(false);
      setProgress(0);
      setProcessingId(null);
    }
  };

  const handleTrim = async () => {
    if (!selectedFile) {
      setError("Please select a media file first");
      return;
    }

    setLoading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("startTime", settings.startTime);
      formData.append("endTime", settings.endTime);

      // Generate a unique processing ID for progress tracking
      const newProcessingId = Date.now().toString();
      setProcessingId(newProcessingId);
      formData.append("processingId", newProcessingId);

      const response = await mediaToolsApi.trimMedia(formData);
      setSuccess("Media trimmed successfully!");

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      handleDownload(response.data.trimmed, `trimmed_${timestamp}_${selectedFile.name}`);
    } catch (err) {
      setError(err.message || "Failed to trim media");
    } finally {
      setLoading(false);
      setProgress(0);
      setProcessingId(null);
    }
  };

  const handleSpeedChange = async () => {
    if (!selectedFile) {
      setError("Please select a media file first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("speed", settings.speed);

      const response = await mediaToolsApi.changeSpeed(formData);
      setSuccess("Media speed adjusted successfully!");

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      handleDownload(response.data.speedChanged, `speed_${timestamp}_${selectedFile.name}`);
    } catch (err) {
      setError(err.message || "Failed to adjust media speed");
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    if (!loading) return null;

    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <LinearProgress variant="determinate" value={progress} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {progress.toFixed(1)}% Complete
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mt: 0, mb: 1 }}>
          Media Tools
        </Typography>

        {(error || success) && (
          <Alert
            severity={error ? "error" : "success"}
            sx={{ mb: 1 }}
            onClose={() => {
              error ? setError(null) : setSuccess(null);
            }}
          >
            {error || success}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload Media File
                </Typography>
                <input accept="video/*,audio/*" style={{ display: "none" }} id="media-upload" type="file" onChange={handleFileSelect} ref={fileInputRef} />
                <label htmlFor="media-upload">
                  <Button variant="contained" component="span" startIcon={<VideoSettings />} fullWidth>
                    Select Media File
                  </Button>
                </label>

                {preview && (
                  <Box sx={{ mt: 2 }}>
                    <video src={preview} controls style={{ width: "100%", maxHeight: "300px" }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ width: "100%", bgcolor: "background.paper" }}>
              <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
                <Tab icon={<Transform />} label="Convert" />
                <Tab icon={<Compress />} label="Compress" />
                <Tab icon={<ContentCut />} label="Trim" />
                <Tab icon={<Speed />} label="Speed" />
              </Tabs>

              {/* Convert Tab */}
              <TabPanel value={activeTab} index={0}>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Output Format</InputLabel>
                    <Select value={settings.format} label="Output Format" onChange={(e) => handleSettingChange("format", e.target.value)}>
                      <MenuItem value="mp4">MP4</MenuItem>
                      <MenuItem value="webm">WebM</MenuItem>
                      <MenuItem value="mov">MOV</MenuItem>
                      <MenuItem value="avi">AVI</MenuItem>
                      <MenuItem value="mkv">MKV</MenuItem>
                      <MenuItem value="gif">GIF</MenuItem>
                      <MenuItem value="mp3">MP3 (Audio)</MenuItem>
                      <MenuItem value="aac">AAC (Audio)</MenuItem>
                      <MenuItem value="wav">WAV (Audio)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Resolution</InputLabel>
                    <Select value={settings.resolution} label="Resolution" onChange={(e) => handleSettingChange("resolution", e.target.value)}>
                      <MenuItem value="3840x2160">4K (3840x2160)</MenuItem>
                      <MenuItem value="2560x1440">2K (2560x1440)</MenuItem>
                      <MenuItem value="1920x1080">Full HD (1920x1080)</MenuItem>
                      <MenuItem value="1280x720">HD (1280x720)</MenuItem>
                      <MenuItem value="854x480">SD (854x480)</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography gutterBottom>FPS</Typography>
                    <Slider
                      value={settings.fps}
                      onChange={(e, value) => handleSettingChange("fps", value)}
                      min={15}
                      max={60}
                      step={1}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 24, label: "24" },
                        { value: 30, label: "30" },
                        { value: 60, label: "60" },
                      ]}
                    />
                  </Box>

                  <Button variant="contained" onClick={handleConvert} disabled={!selectedFile || loading} startIcon={<Transform />} fullWidth>
                    Convert
                  </Button>
                </Stack>
                {renderProgressBar()}
              </TabPanel>

              {/* Compress Tab */}
              <TabPanel value={activeTab} index={1}>
                <Stack spacing={2}>
                  <Box>
                    <Typography gutterBottom>Quality ({settings.quality}%)</Typography>
                    <Slider value={settings.quality} onChange={(e, value) => handleSettingChange("quality", value)} min={1} max={100} valueLabelDisplay="auto" />
                  </Box>

                  <Button variant="contained" onClick={handleCompress} disabled={!selectedFile || loading} startIcon={<Compress />} fullWidth>
                    Compress
                  </Button>
                </Stack>
                {renderProgressBar()}
              </TabPanel>

              {/* Trim Tab */}
              <TabPanel value={activeTab} index={2}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <TextField fullWidth label="Start Time" value={settings.startTime} onChange={(e) => handleSettingChange("startTime", e.target.value)} placeholder="HH:MM:SS" />
                    <TextField fullWidth label="End Time" value={settings.endTime} onChange={(e) => handleSettingChange("endTime", e.target.value)} placeholder="HH:MM:SS" />
                  </Stack>

                  <Button variant="contained" onClick={handleTrim} disabled={!selectedFile || loading} startIcon={<ContentCut />} fullWidth>
                    Trim
                  </Button>
                </Stack>
                {renderProgressBar()}
              </TabPanel>

              {/* Speed Tab */}
              <TabPanel value={activeTab} index={3}>
                <Stack spacing={2}>
                  <Box>
                    <Typography gutterBottom>Playback Speed ({settings.speed}x)</Typography>
                    <Slider
                      value={settings.speed}
                      onChange={(e, value) => handleSettingChange("speed", value)}
                      min={0.25}
                      max={2}
                      step={0.25}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 0.5, label: "0.5x" },
                        { value: 1, label: "1x" },
                        { value: 1.5, label: "1.5x" },
                        { value: 2, label: "2x" },
                      ]}
                    />
                  </Box>

                  <Button variant="contained" onClick={handleSpeedChange} disabled={!selectedFile || loading} startIcon={<Speed />} fullWidth>
                    Change Speed
                  </Button>
                </Stack>
                {renderProgressBar()}
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default MediaTools;
