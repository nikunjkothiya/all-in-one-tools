import React, { useState, useRef } from "react";
import { Box, Container, Typography, Grid, Card, CardContent, Button, Alert, Slider, FormControl, InputLabel, Select, MenuItem, TextField, Stack, Divider, IconButton, Tooltip } from "@mui/material";
import { VideoSettings, AudioTrack, Transform, Timer, Download, ContentCut, Speed, Compress, HighQuality } from "@mui/icons-material";
import { mediaToolsApi } from "../services/api";

const MediaTools = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Advanced settings state
  const [settings, setSettings] = useState({
    format: "mp4",
    quality: 80,
    fps: 30,
    bitrate: "1000k",
    audioCodec: "aac",
    videoCodec: "h264",
    resolution: "1280x720",
    startTime: "00:00:00",
    duration: "00:00:00",
    speed: 1.0,
  });

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

    const handleCompress = async () => {
        if (!selectedFile) {
      setError("Please select a media file first");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("quality", settings.quality);
      formData.append("bitrate", settings.bitrate);
      formData.append("videoCodec", settings.videoCodec);
      formData.append("audioCodec", settings.audioCodec);

            const response = await mediaToolsApi.compressMedia(formData);
      setSuccess("Media compressed successfully!");
      // Handle download
        } catch (err) {
      setError(err.message || "Failed to compress media");
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = async () => {
        if (!selectedFile) {
      setError("Please select a media file first");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("format", settings.format);
      formData.append("resolution", settings.resolution);
      formData.append("fps", settings.fps);
      formData.append("videoCodec", settings.videoCodec);
      formData.append("audioCodec", settings.audioCodec);

            const response = await mediaToolsApi.convertMedia(formData);
      setSuccess(`Media converted to ${settings.format.toUpperCase()} successfully!`);
      // Handle download
    } catch (err) {
      setError(err.message || "Failed to convert media");
    } finally {
      setLoading(false);
    }
  };

  const handleTrim = async () => {
    if (!selectedFile) {
      setError("Please select a media file first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("startTime", settings.startTime);
      formData.append("duration", settings.duration);

      const response = await mediaToolsApi.trimMedia(formData);
      setSuccess("Media trimmed successfully!");
      // Handle download
    } catch (err) {
      setError(err.message || "Failed to trim media");
    } finally {
      setLoading(false);
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
      // Handle download
        } catch (err) {
      setError(err.message || "Failed to adjust media speed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
                    Media Tools
                </Typography>

                {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
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

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Media Operations
                                </Typography>

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
                    <Typography gutterBottom>Quality ({settings.quality}%)</Typography>
                    <Slider value={settings.quality} onChange={(e, value) => handleSettingChange("quality", value)} min={1} max={100} valueLabelDisplay="auto" />
                  </Box>

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

                  <Stack direction="row" spacing={2}>
                    <TextField label="Start Time" value={settings.startTime} onChange={(e) => handleSettingChange("startTime", e.target.value)} placeholder="HH:MM:SS" size="small" />
                    <TextField label="Duration" value={settings.duration} onChange={(e) => handleSettingChange("duration", e.target.value)} placeholder="HH:MM:SS" size="small" />
                  </Stack>

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

                  <Divider />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button variant="contained" onClick={handleConvert} disabled={!selectedFile || loading} startIcon={<Transform />}>
                      Convert
                    </Button>
                    <Button variant="contained" onClick={handleCompress} disabled={!selectedFile || loading} startIcon={<Compress />}>
                      Compress
                    </Button>
                    <Button variant="contained" onClick={handleTrim} disabled={!selectedFile || loading} startIcon={<ContentCut />}>
                      Trim
                                    </Button>
                    <Button variant="contained" onClick={handleSpeedChange} disabled={!selectedFile || loading} startIcon={<Speed />}>
                      Change Speed
                                    </Button>
                  </Stack>
                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default MediaTools; 
