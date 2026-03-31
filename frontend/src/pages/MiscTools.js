import React, { useState } from "react";
import { Box, Typography, Grid, Tabs, Tab, TextField, Button, FormControl, InputLabel, Select, MenuItem, Paper, IconButton, Container } from "@mui/material";
import { QrCode2, RotateLeft, ContentCopy, Download, GridOn, ColorLens } from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import JsBarcode from "jsbarcode";
import ToolPageHeader from "../components/ToolPageHeader";

const unitConverterOptions = [
  { value: "length", label: "Length", units: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"] },
  { value: "weight", label: "Weight", units: ["mg", "g", "kg", "oz", "lb", "ton"] },
  { value: "temperature", label: "Temperature", units: ["°C", "°F", "K"] },
  { value: "area", label: "Area", units: ["mm²", "cm²", "m²", "km²", "in²", "ft²", "yd²", "acre", "ha"] },
  { value: "volume", label: "Volume", units: ["mL", "L", "m³", "gal", "fl oz", "cup", "pt", "qt"] },
  { value: "speed", label: "Speed", units: ["m/s", "km/h", "mph", "kn"] },
  { value: "time", label: "Time", units: ["ms", "s", "min", "h", "day", "week", "month", "year"] },
  { value: "data", label: "Data", units: ["bit", "B", "KB", "MB", "GB", "TB"] },
];

const unitConversionFactors = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.34,
  mg: 0.000001,
  g: 0.001,
  kg: 1,
  oz: 0.0283495,
  lb: 0.453592,
  ton: 1000,
  "°C": "celsius",
  "°F": "fahrenheit",
  K: "kelvin",
  "mm²": 0.000001,
  "cm²": 0.0001,
  "m²": 1,
  "km²": 1000000,
  "in²": 0.00064516,
  "ft²": 0.092903,
  "yd²": 0.836127,
  acre: 4046.86,
  ha: 10000,
  mL: 0.001,
  L: 1,
  "m³": 1000,
  "fl oz": 0.0295735,
  cup: 0.236588,
  pt: 0.473176,
  qt: 0.946353,
  gal: 3.78541,
  "m/s": 1,
  "km/h": 0.277778,
  mph: 0.44704,
  kn: 0.514444,
  ms: 0.001,
  s: 1,
  min: 60,
  h: 3600,
  day: 86400,
  week: 604800,
  month: 2592000,
  year: 31536000,
  bit: 0.125,
  B: 1,
  KB: 1024,
  MB: 1048576,
  GB: 1073741824,
  TB: 1099511627776,
};

const convertTemperatureValue = (value, from, to) => {
  let kelvin;
  if (from === "°C") {
    kelvin = parseFloat(value) + 273.15;
  } else if (from === "°F") {
    kelvin = ((parseFloat(value) - 32) * 5) / 9 + 273.15;
  } else {
    kelvin = parseFloat(value);
  }

  if (to === "°C") {
    return kelvin - 273.15;
  }
  if (to === "°F") {
    return ((kelvin - 273.15) * 9) / 5 + 32;
  }

  return kelvin;
};

// --- Color Picker ---
const ColorPicker = () => {
  const [hex, setHex] = React.useState("#3f51b5");
  const [copied, setCopied] = React.useState("");

  const hexToRgb = (h) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = ({ r, g, b }) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        default: h = ((r - g) / d + 4) / 6;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const getComplementary = (h) => `hsl(${(rgbToHsl(hexToRgb(h)).h + 180) % 360}, 70%, 50%)`;

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Color Picker & Converter</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <TextField fullWidth type="color" value={hex} onChange={(e) => setHex(e.target.value)} label="Pick a Color" InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
            <TextField fullWidth label="HEX" value={hex} onChange={(e) => setHex(e.target.value)} margin="normal" InputProps={{ endAdornment: <IconButton onClick={() => copyToClipboard(hex, 'hex')} size="small"><ContentCopy fontSize="small" /></IconButton> }} helperText={copied === 'hex' ? 'Copied!' : ''} />
            <TextField fullWidth label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} margin="normal" InputProps={{ readOnly: true, endAdornment: <IconButton onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')} size="small"><ContentCopy fontSize="small" /></IconButton> }} helperText={copied === 'rgb' ? 'Copied!' : ''} />
            <TextField fullWidth label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} margin="normal" InputProps={{ readOnly: true, endAdornment: <IconButton onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')} size="small"><ContentCopy fontSize="small" /></IconButton> }} helperText={copied === 'hsl' ? 'Copied!' : ''} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>Preview</Typography>
            <Box sx={{ width: '100%', height: 120, bgcolor: hex, borderRadius: 2, mb: 2, border: '1px solid #ddd' }} />
            <Typography variant="subtitle1" gutterBottom>Complementary</Typography>
            <Box sx={{ width: '100%', height: 80, bgcolor: getComplementary(hex), borderRadius: 2, border: '1px solid #ddd' }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// --- Generators (UUID, Random Password, Random String) ---
const Generators = () => {
  const [uuid, setUuid] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pwLength, setPwLength] = React.useState(16);
  const [randomStr, setRandomStr] = React.useState("");
  const [strLength, setStrLength] = React.useState(32);
  const [copied, setCopied] = React.useState("");

  const generateUUID = () => setUuid(crypto.randomUUID());

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let pw = '';
    const arr = new Uint32Array(pwLength);
    crypto.getRandomValues(arr);
    for (let i = 0; i < pwLength; i++) pw += chars[arr[i] % chars.length];
    setPassword(pw);
  };

  const generateRandomString = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let s = '';
    const arr = new Uint32Array(strLength);
    crypto.getRandomValues(arr);
    for (let i = 0; i < strLength; i++) s += chars[arr[i] % chars.length];
    setRandomStr(s);
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Generators</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>UUID v4</Typography>
            <Button variant="contained" onClick={generateUUID} fullWidth sx={{ mb: 2 }}>Generate UUID</Button>
            {uuid && <TextField fullWidth value={uuid} InputProps={{ readOnly: true, endAdornment: <IconButton onClick={() => copy(uuid, 'uuid')} size="small"><ContentCopy fontSize="small" /></IconButton> }} helperText={copied === 'uuid' ? 'Copied!' : ''} />}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Random Password</Typography>
            <TextField fullWidth type="number" label="Length" value={pwLength} onChange={(e) => setPwLength(Math.max(4, Math.min(128, Number(e.target.value))))} sx={{ mb: 2 }} inputProps={{ min: 4, max: 128 }} />
            <Button variant="contained" onClick={generatePassword} fullWidth sx={{ mb: 2 }}>Generate Password</Button>
            {password && <TextField fullWidth value={password} InputProps={{ readOnly: true, endAdornment: <IconButton onClick={() => copy(password, 'pw')} size="small"><ContentCopy fontSize="small" /></IconButton> }} helperText={copied === 'pw' ? 'Copied!' : ''} />}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Random String</Typography>
            <TextField fullWidth type="number" label="Length" value={strLength} onChange={(e) => setStrLength(Math.max(1, Math.min(256, Number(e.target.value))))} sx={{ mb: 2 }} inputProps={{ min: 1, max: 256 }} />
            <Button variant="contained" onClick={generateRandomString} fullWidth sx={{ mb: 2 }}>Generate String</Button>
            {randomStr && <TextField fullWidth value={randomStr} InputProps={{ readOnly: true, endAdornment: <IconButton onClick={() => copy(randomStr, 'str')} size="small"><ContentCopy fontSize="small" /></IconButton> }} helperText={copied === 'str' ? 'Copied!' : ''} />}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const QrCodeGenerator = () => {
  const [qrValue, setQrValue] = useState("https://example.com");
  const [qrSize, setQrSize] = useState(200);
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#ffffff");

  const resetQrCode = () => {
    setQrValue("https://example.com");
    setQrSize(200);
    setQrColor("#000000");
    setQrBgColor("#ffffff");
  };

  const downloadQrCode = () => {
    const svg = document.getElementById("qr-code");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "qrcode.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        QR Code Generator
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Customize Your QR Code
            </Typography>
            <TextField fullWidth label="Content" variant="outlined" value={qrValue} onChange={(e) => setQrValue(e.target.value)} margin="normal" />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Size (px)" type="number" variant="outlined" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} inputProps={{ min: 100, max: 500 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="QR Color" type="color" variant="outlined" value={qrColor} onChange={(e) => setQrColor(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Background" type="color" variant="outlined" value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button variant="outlined" startIcon={<RotateLeft />} onClick={resetQrCode}>
                Reset
              </Button>
              <Button variant="contained" startIcon={<Download />} onClick={downloadQrCode}>
                Download
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Box sx={{ border: "1px solid #e0e0e0", p: 3, borderRadius: 1, mb: 2, width: "100%", overflow: "auto", display: "flex", justifyContent: "center" }}>
              <QRCodeSVG id="qr-code" value={qrValue || "https://example.com"} size={qrSize} fgColor={qrColor} bgColor={qrBgColor} level="H" includeMargin style={{ maxWidth: "100%", height: "auto" }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
              Scan this QR code to access the content
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const BarcodeGenerator = () => {
  const [barcodeValue, setBarcodeValue] = useState("123456789012");
  const [barcodeType, setBarcodeType] = useState("CODE128");
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [barcodeColor, setBarcodeColor] = useState("#000000");
  const [barcodeBgColor, setBarcodeBgColor] = useState("#ffffff");

  React.useEffect(() => {
    try {
      JsBarcode("#barcode-svg", barcodeValue || "123456789012", {
        format: barcodeType,
        lineColor: barcodeColor,
        background: barcodeBgColor,
        width: barcodeWidth,
        height: barcodeHeight,
        displayValue: true,
        fontSize: 16,
        margin: 10,
      });
    } catch (e) {
      console.error("Barcode generation error:", e);
    }
  }, [barcodeValue, barcodeType, barcodeWidth, barcodeHeight, barcodeColor, barcodeBgColor]);

  const resetBarcode = () => {
    setBarcodeValue("123456789012");
    setBarcodeType("CODE128");
    setBarcodeWidth(2);
    setBarcodeHeight(100);
    setBarcodeColor("#000000");
    setBarcodeBgColor("#ffffff");
  };

  const downloadBarcode = () => {
    const svg = document.getElementById("barcode-svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "barcode.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Barcode Generator
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Customize Your Barcode
            </Typography>
            <TextField fullWidth label="Content" variant="outlined" value={barcodeValue} onChange={(e) => setBarcodeValue(e.target.value)} margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Barcode Type</InputLabel>
              <Select value={barcodeType} onChange={(e) => setBarcodeType(e.target.value)} label="Barcode Type">
                <MenuItem value="CODE128">CODE128</MenuItem>
                <MenuItem value="EAN13">EAN-13</MenuItem>
                <MenuItem value="UPC">UPC</MenuItem>
                <MenuItem value="EAN8">EAN-8</MenuItem>
                <MenuItem value="CODE39">CODE39</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Width" type="number" variant="outlined" value={barcodeWidth} onChange={(e) => setBarcodeWidth(Number(e.target.value))} inputProps={{ min: 1, max: 5, step: 0.5 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Height (px)" type="number" variant="outlined" value={barcodeHeight} onChange={(e) => setBarcodeHeight(Number(e.target.value))} inputProps={{ min: 50, max: 200 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Bar Color" type="color" variant="outlined" value={barcodeColor} onChange={(e) => setBarcodeColor(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Background" type="color" variant="outlined" value={barcodeBgColor} onChange={(e) => setBarcodeBgColor(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button variant="outlined" startIcon={<RotateLeft />} onClick={resetBarcode}>
                Reset
              </Button>
              <Button variant="contained" startIcon={<Download />} onClick={downloadBarcode}>
                Download
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Box sx={{ border: "1px solid #e0e0e0", p: 3, borderRadius: 1, mb: 2, width: "100%", textAlign: "center", overflow: "auto" }}>
              <svg id="barcode-svg" style={{ maxWidth: "100%", height: "auto" }}></svg>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
              Scan this barcode to access the content
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const UnitConverter = () => {
  const [selectedConverter, setSelectedConverter] = useState("length");
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [result, setResult] = useState("");

  React.useEffect(() => {
    if (unitConverterOptions.length > 0) {
      setFromUnit(unitConverterOptions[0].units[0]);
      setToUnit(unitConverterOptions[0].units[1]);
    }
  }, []);

  React.useEffect(() => {
    const currentConverter = unitConverterOptions.find((option) => option.value === selectedConverter);
    if (currentConverter) {
      setFromUnit(currentConverter.units[0]);
      setToUnit(currentConverter.units[1]);
    }
  }, [selectedConverter]);

  const handleConvertChange = (event) => {
    setSelectedConverter(event.target.value);
  };

  React.useEffect(() => {
    if (!fromValue || !fromUnit || !toUnit) return;

    const value = parseFloat(fromValue);
    if (isNaN(value)) {
      setResult("Invalid number");
      return;
    }

    let convertedValue;

    if (selectedConverter === "temperature") {
      convertedValue = convertTemperatureValue(value, fromUnit, toUnit);
    } else {
      const fromFactor = unitConversionFactors[fromUnit];
      const toFactor = unitConversionFactors[toUnit];
      convertedValue = (value * fromFactor) / toFactor;
    }

    setResult(convertedValue.toLocaleString(undefined, { maximumFractionDigits: 6 }));
  }, [fromValue, fromUnit, toUnit, selectedConverter]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Unit Converter
      </Typography>
      <Paper sx={{ p: 3 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Conversion Type</InputLabel>
          <Select value={selectedConverter} onChange={handleConvertChange} label="Conversion Type">
            {unitConverterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={5}>
            <TextField fullWidth label="From" variant="outlined" value={fromValue} onChange={(e) => setFromValue(e.target.value)} type="number" />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Unit</InputLabel>
              <Select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} label="Unit">
                {unitConverterOptions
                  .find((option) => option.value === selectedConverter)
                  ?.units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <GridOn />
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField fullWidth label="Result" variant="outlined" value={result} InputProps={{ readOnly: true }} />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Unit</InputLabel>
              <Select value={toUnit} onChange={(e) => setToUnit(e.target.value)} label="Unit">
                {unitConverterOptions
                  .find((option) => option.value === selectedConverter)
                  ?.units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

const MiscTools = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        <ToolPageHeader
          title="Miscellaneous Tools"
          description="Keep high-frequency utility tools in one place, including QR codes, barcodes, unit conversion, color utilities, and secure generators."
          chips={["QR", "Barcode", "Unit converter", "Color tools", "Generators"]}
        />

        <Paper sx={{ mb: 4, borderRadius: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" aria-label="misc tools tabs">
            <Tab label="QR Code Generator" icon={<QrCode2 />} iconPosition="start" />
            <Tab label="Barcode Generator" icon={<GridOn />} iconPosition="start" />
            <Tab label="Unit Converter" icon={<RotateLeft />} iconPosition="start" />
            <Tab label="Color Picker" icon={<ColorLens />} iconPosition="start" />
            <Tab label="Generators" icon={<GridOn />} iconPosition="start" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && <QrCodeGenerator />}
          {activeTab === 1 && <BarcodeGenerator />}
          {activeTab === 2 && <UnitConverter />}
          {activeTab === 3 && <ColorPicker />}
          {activeTab === 4 && <Generators />}
        </Box>
      </Box>
    </Container>
  );
};

export default MiscTools;
