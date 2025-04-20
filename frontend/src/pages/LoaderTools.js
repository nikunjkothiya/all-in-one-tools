import React, { useState, useEffect, useRef } from "react";
import { Box, Container, Grid, Card, CardContent, Typography, Slider, TextField, Button, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, IconButton, Tooltip, CircularProgress, Switch, FormControlLabel, Paper, Stack, ButtonGroup, Divider, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Download, FileDownload, ColorLens, Save, Edit, Image, Settings, ExpandMore, Remove, Add } from "@mui/icons-material";
import { loaderToolsApi } from "../services/api";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

// Loader types with their specific options
const loaderTypes = [
  {
    id: "spinner",
    name: "Spinner",
    defaultOptions: {
      colors: ["#e15b64"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
      thickness: 4,
    },
    customOptions: ["color", "speed", "thickness"],
  },
  {
    id: "ring",
    name: "Ring",
    defaultOptions: {
      colors: ["#e15b64"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
      thickness: 4,
    },
    customOptions: ["color", "speed", "thickness"],
  },
  {
    id: "dual-ring",
    name: "Dual Ring",
    defaultOptions: {
      colors: ["#e15b64"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
      thickness: 4,
    },
    customOptions: ["color", "speed", "thickness"],
  },
  {
    id: "ripple",
    name: "Ripple",
    defaultOptions: {
      colors: ["#e15b64"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
      thickness: 4,
    },
    customOptions: ["color", "speed", "thickness"],
  },
  {
    id: "dots",
    name: "Dots",
    defaultOptions: {
      colors: ["#e15b64"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
    },
    customOptions: ["color", "speed", "size"],
  },
  {
    id: "grid",
    name: "Grid",
    defaultOptions: {
      colors: ["#e15b64"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
    },
    customOptions: ["color", "speed", "size"],
  },
  {
    id: "hourglass",
    name: "Hourglass",
    defaultOptions: {
      colors: ["#e15b64"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
    },
    customOptions: ["color", "speed", "size"],
  },
  {
    id: "ellipsis",
    name: "Ellipsis",
    defaultOptions: {
      colors: ["#e15b64"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
    },
    customOptions: ["color", "speed", "size"],
  },
  {
    id: "pie",
    name: "Pie",
    defaultOptions: {
      colors: ["#e15b64", "#f47e60", "#f8b26a", "#abbd81"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
    },
    customOptions: ["multiColor", "speed", "size"],
  },
  {
    id: "bars",
    name: "Bars",
    defaultOptions: {
      colors: ["#e15b64", "#f47e60", "#f8b26a", "#abbd81"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
    },
    customOptions: ["multiColor", "speed", "size"],
  },
  {
    id: "circles",
    name: "Circles",
    defaultOptions: {
      colors: ["#e15b64"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
    },
    customOptions: ["color", "speed", "thickness"],
  },
  {
    id: "hearts",
    name: "Hearts",
    defaultOptions: {
      colors: ["#e15b64"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
    },
    customOptions: ["color", "speed", "size"],
  },
];

// Sample preset loaders
const presetLoaders = [
  { id: "spinner1", type: "spinner", color: "#4deeea", size: 50, speed: 1, thickness: 3 },
  { id: "pie1", type: "pie", colors: ["#e15b64", "#f47e60", "#f8b26a", "#abbd81"], size: 50, speed: 1 },
  { id: "dots1", type: "dots", color: "#ffe700", size: 50, speed: 1, thickness: 3 },
  { id: "bars1", type: "bars", colors: ["#f000ff", "#f47e60", "#f8b26a", "#abbd81"], size: 50, speed: 1 },
  { id: "circles1", type: "circles", color: "#001eff", size: 50, speed: 1, thickness: 3 },
  { id: "dual-ring1", type: "dual-ring", color: "#ff0000", size: 50, speed: 1 },
];

const LoaderTools = () => {
  const previewRef = useRef(null);
  const [selectedType, setSelectedType] = useState("spinner");
  const [activeTab, setActiveTab] = useState("default");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isTransparent, setIsTransparent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Options
  const [colors, setColors] = useState(["#e15b64", "#f47e60", "#f8b26a", "#abbd81"]);
  const [speed, setSpeed] = useState(0.8);
  const [size, setSize] = useState(100);
  const [scale, setScale] = useState(1.0);
  const [opacity, setOpacity] = useState(0.8);
  const [thickness, setThickness] = useState(4);

  // Find the current loader type
  const currentLoader = loaderTypes.find((type) => type.id === selectedType) || loaderTypes[0];

  // Generate HTML for the preview
  const generateLoaderHTML = (type = selectedType, options = { colors, speed, size, scale, opacity, thickness }) => {
    let loaderHTML = "";
    const thickness = options.thickness || 4;

    switch (type) {
      case "spinner":
        loaderHTML = `
          <div style="width: ${options.size}px; height: ${options.size}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="width: 100%; height: 100%; border: ${thickness}px solid #f3f3f3; border-radius: 50%; border-top: ${thickness}px solid ${options.colors[0]}; animation: spin ${1 / options.speed}s linear infinite;"></div>
          </div>
        `;
        break;
      case "ring":
        loaderHTML = `
          <div style="display: inline-block; width: ${options.size}px; height: ${options.size}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="display: block; width: ${options.size * 0.8}px; height: ${options.size * 0.8}px; margin: ${options.size * 0.1}px; border-radius: 50%; border: ${thickness}px solid ${options.colors[0]}; animation: spin ${1 / options.speed}s linear infinite;"></div>
          </div>
        `;
        break;
      case "dual-ring":
        loaderHTML = `
          <div style="display: inline-block; width: ${options.size}px; height: ${options.size}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="display: block; width: ${options.size * 0.8}px; height: ${options.size * 0.8}px; margin: ${options.size * 0.1}px; border-radius: 50%; border: ${thickness}px solid ${options.colors[0]}; border-color: ${options.colors[0]} transparent ${options.colors[0]} transparent; animation: dual-ring ${1 / options.speed}s linear infinite;"></div>
          </div>
        `;
        break;
      case "ripple":
        loaderHTML = `
          <div style="position: relative; width: ${options.size}px; height: ${options.size}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="position: absolute; width: ${options.size * 0.8}px; height: ${options.size * 0.8}px; border: ${thickness}px solid ${options.colors[0]}; border-radius: 50%; animation: ripple ${1 / options.speed}s cubic-bezier(0, 0.2, 0.8, 1) infinite;"></div>
            <div style="position: absolute; width: ${options.size * 0.8}px; height: ${options.size * 0.8}px; border: ${thickness}px solid ${options.colors[0]}; border-radius: 50%; animation: ripple ${1 / options.speed}s cubic-bezier(0, 0.2, 0.8, 1) infinite; animation-delay: ${-0.5 / options.speed}s;"></div>
          </div>
        `;
        break;
      case "dots":
        loaderHTML = `
          <div style="display: flex; gap: 8px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="width: ${options.size / 5}px; height: ${options.size / 5}px; background-color: ${options.colors[0]}; border-radius: 50%; animation: bounce ${1 / options.speed}s infinite ease-in-out both;"></div>
            <div style="width: ${options.size / 5}px; height: ${options.size / 5}px; background-color: ${options.colors[0]}; border-radius: 50%; animation: bounce ${1 / options.speed}s infinite ease-in-out both; animation-delay: 0.16s;"></div>
            <div style="width: ${options.size / 5}px; height: ${options.size / 5}px; background-color: ${options.colors[0]}; border-radius: 50%; animation: bounce ${1 / options.speed}s infinite ease-in-out both; animation-delay: 0.32s;"></div>
          </div>
        `;
        break;
      case "grid":
        loaderHTML = `
          <div style="display: inline-block; position: relative; width: ${options.size}px; height: ${options.size}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="position: absolute; width: 16px; height: 16px; margin: 2px; background-color: ${options.colors[0]}; border-radius: 50%; animation: grid ${1 / options.speed}s linear infinite;"></div>
            <div style="position: absolute; width: 16px; height: 16px; margin: 2px; background-color: ${options.colors[0]}; border-radius: 50%; animation: grid ${1 / options.speed}s linear infinite; animation-delay: -0.5s;"></div>
            <div style="position: absolute; width: 16px; height: 16px; margin: 2px; background-color: ${options.colors[0]}; border-radius: 50%; animation: grid ${1 / options.speed}s linear infinite; animation-delay: -1s;"></div>
            <div style="position: absolute; width: 16px; height: 16px; margin: 2px; background-color: ${options.colors[0]}; border-radius: 50%; animation: grid ${1 / options.speed}s linear infinite; animation-delay: -1.5s;"></div>
            <div style="position: absolute; width: 16px; height: 16px; margin: 2px; background-color: ${options.colors[0]}; border-radius: 50%; animation: grid ${1 / options.speed}s linear infinite; animation-delay: -2s;"></div>
            <div style="position: absolute; width: 16px; height: 16px; margin: 2px; background-color: ${options.colors[0]}; border-radius: 50%; animation: grid ${1 / options.speed}s linear infinite; animation-delay: -2.5s;"></div>
            <div style="position: absolute; width: 16px; height: 16px; margin: 2px; background-color: ${options.colors[0]}; border-radius: 50%; animation: grid ${1 / options.speed}s linear infinite; animation-delay: -3s;"></div>
            <div style="position: absolute; width: 16px; height: 16px; margin: 2px; background-color: ${options.colors[0]}; border-radius: 50%; animation: grid ${1 / options.speed}s linear infinite; animation-delay: -3.5s;"></div>
            <div style="position: absolute; width: 16px; height: 16px; margin: 2px; background-color: ${options.colors[0]}; border-radius: 50%; animation: grid ${1 / options.speed}s linear infinite; animation-delay: -4s;"></div>
          </div>
        `;
        break;
      case "hourglass":
        loaderHTML = `
          <div style="display: inline-block; position: relative; width: ${options.size * 0.5}px; height: ${options.size * 0.5}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="position: absolute; top: ${options.size * 0.25}px; left: ${options.size * 0.25}px; width: 0; height: 0; 
                        border-left: ${options.size * 0.25}px solid transparent;
                        border-right: ${options.size * 0.25}px solid transparent;
                        border-top: ${options.size * 0.25}px solid ${options.colors[0]};
                        animation: hourglass-top ${1 / options.speed}s linear infinite;
                        transform-origin: center bottom;"></div>
            <div style="position: absolute; top: ${options.size * 0.25}px; left: ${options.size * 0.25}px; width: 0; height: 0; 
                        border-left: ${options.size * 0.25}px solid transparent;
                        border-right: ${options.size * 0.25}px solid transparent;
                        border-bottom: ${options.size * 0.25}px solid ${options.colors[0]};
                        animation: hourglass-bottom ${1 / options.speed}s linear infinite;
                        transform-origin: center top;"></div>
          </div>
        `;
        break;
      case "ellipsis":
        loaderHTML = `
          <div style="display: inline-block; position: relative; width: ${options.size * 0.8}px; height: ${options.size * 0.2}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="position: absolute; top: 0; width: ${options.size * 0.2}px; height: ${options.size * 0.2}px; border-radius: 50%; background: ${options.colors[0]}; animation: ellipsis ${1.4 / options.speed}s infinite ease-in-out both;"></div>
            <div style="position: absolute; top: 0; left: ${options.size * 0.2}px; width: ${options.size * 0.2}px; height: ${options.size * 0.2}px; border-radius: 50%; background: ${options.colors[0]}; animation: ellipsis ${1.4 / options.speed}s infinite ease-in-out both; animation-delay: 0.16s;"></div>
            <div style="position: absolute; top: 0; left: ${options.size * 0.4}px; width: ${options.size * 0.2}px; height: ${options.size * 0.2}px; border-radius: 50%; background: ${options.colors[0]}; animation: ellipsis ${1.4 / options.speed}s infinite ease-in-out both; animation-delay: 0.32s;"></div>
          </div>
        `;
        break;
      case "pie":
        // Calculate angles for pie segments
        const totalSegments = options.colors.length;
        const segmentAngle = 360 / totalSegments;

        let segments = "";
        options.colors.forEach((color, index) => {
          const startAngle = index * segmentAngle;
          segments += `
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              clip-path: polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(((startAngle + segmentAngle) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((startAngle + segmentAngle) * Math.PI) / 180)}%, 50% 50%);
              background-color: ${color};
              transform-origin: center;
              transform: rotate(${startAngle}deg);
            "></div>
          `;
        });

        loaderHTML = `
          <div style="position: relative; width: ${options.size}px; height: ${options.size}px; opacity: ${options.opacity}; transform: scale(${options.scale}); animation: rotate ${1 / options.speed}s linear infinite;">
            ${segments}
          </div>
        `;
        break;
      case "bars":
        // Create bars
        let barsHTML = "";
        const barCount = options.colors.length;
        for (let i = 0; i < barCount; i++) {
          const color = options.colors[i % options.colors.length];
          barsHTML += `
            <div style="width: ${options.size / (barCount * 2)}px; height: 100%; background-color: ${color}; animation: stretch ${1 / options.speed}s infinite ease-in-out; animation-delay: ${0.1 * i}s;"></div>
          `;
        }

        loaderHTML = `
          <div style="display: flex; justify-content: space-between; width: ${options.size}px; height: ${options.size / 2}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            ${barsHTML}
          </div>
        `;
        break;
      case "circles":
        loaderHTML = `
          <div style="position: relative; width: ${options.size}px; height: ${options.size}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="position: absolute; width: ${options.size * 0.8}px; height: ${options.size * 0.8}px; border: ${thickness}px solid ${options.colors[0]}; border-radius: 50%; animation: ripple ${1 / options.speed}s cubic-bezier(0, 0.2, 0.8, 1) infinite;"></div>
            <div style="position: absolute; width: ${options.size * 0.8}px; height: ${options.size * 0.8}px; border: ${thickness}px solid ${options.colors[0]}; border-radius: 50%; animation: ripple ${1 / options.speed}s cubic-bezier(0, 0.2, 0.8, 1) infinite; animation-delay: ${-0.5 / options.speed}s;"></div>
          </div>
        `;
        break;
      case "hearts":
        loaderHTML = `
          <div style="position: relative; width: ${options.size}px; height: ${options.size}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="position: absolute; left: ${options.size * 0.3}px; top: ${options.size * 0.3}px; transform: rotate(45deg); width: ${options.size * 0.4}px; height: ${options.size * 0.4}px; background-color: ${options.colors[0]}; animation: hearts ${1 / options.speed}s ease-in-out infinite;">
              <div style="position: absolute; top: -50%; left: 0; width: 100%; height: 100%; border-radius: 50%; background-color: ${options.colors[0]};"></div>
              <div style="position: absolute; top: 0; left: -50%; width: 100%; height: 100%; border-radius: 50%; background-color: ${options.colors[0]};"></div>
            </div>
          </div>
        `;
        break;
      default:
        loaderHTML = `
          <div style="width: ${options.size}px; height: ${options.size}px; opacity: ${options.opacity}; transform: scale(${options.scale});">
            <div style="width: 100%; height: 100%; border: ${thickness}px solid #f3f3f3; border-radius: 50%; border-top: ${thickness}px solid ${options.colors[0]}; animation: spin ${1 / options.speed}s linear infinite;"></div>
          </div>
        `;
    }

    return loaderHTML;
  };

  useEffect(() => {
    // Set default options when loader type changes
    const loader = loaderTypes.find((l) => l.id === selectedType);
    if (loader) {
      setColors(loader.defaultOptions.colors);
      setSpeed(loader.defaultOptions.speed);
      setSize(loader.defaultOptions.size);
      setScale(loader.defaultOptions.scale);
      setOpacity(loader.defaultOptions.opacity);
      setThickness(loader.defaultOptions.thickness);
    }
  }, [selectedType]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const handleColorChange = (index, event) => {
    const newColors = [...colors];
    newColors[index] = event.target.value;
    setColors(newColors);
  };

  const handleSingleColorChange = (event) => {
    setColors([event.target.value]);
  };

  const handleSpeedChange = (newValue) => {
    setSpeed(newValue);
  };

  const handleSizeChange = (newValue) => {
    setSize(newValue);
  };

  const handleScaleChange = (newValue) => {
    setScale(newValue);
  };

  const handleOpacityChange = (newValue) => {
    setOpacity(newValue);
  };

  const handleThicknessChange = (newValue) => {
    setThickness(newValue);
  };

  const handleBackgroundColorChange = (event) => {
    setBackgroundColor(event.target.value);
  };

  const handleTransparentChange = (event) => {
    setIsTransparent(event.target.checked);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePresetClick = (preset) => {
    setSelectedType(preset.type);

    if (preset.colors) {
      setColors(preset.colors);
    } else if (preset.color) {
      setColors([preset.color]);
    }

    if (preset.size) setSize(preset.size);
    if (preset.speed) setSpeed(preset.speed);
    if (preset.scale) setScale(preset.scale);
    if (preset.opacity) setOpacity(preset.opacity);
    if (preset.thickness) setThickness(preset.thickness);
  };

  const handleDownload = async (format) => {
    if (!previewRef.current) return;

    setLoading(true);
    try {
      if (format === "svg") {
        // For SVG, use the backend endpoint
        const response = await loaderToolsApi.downloadAsSVG({
          type: selectedType,
          colors,
          speed,
          size,
          scale,
          opacity,
          thickness,
          backgroundColor: isTransparent ? "transparent" : backgroundColor,
        });

        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = "loader.svg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === "png") {
        // For PNG, use toDataURL
        try {
          const svgContent = generateLoaderHTML();
          const data = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
              <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml">
                  <style>
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
                    @keyframes stretch { 0%, 40%, 100% { transform: scaleY(0.4); } 20% { transform: scaleY(1); } }
                    @keyframes ripple { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
                    @keyframes dual-ring { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes grid { 0%, 100% { transform: translate(1px, 1px) }
                                      12.5% { transform: translate(${size * 0.3}px, 1px) }
                                      25% { transform: translate(${size * 0.6}px, 1px) }
                                      37.5% { transform: translate(${size * 0.6}px, ${size * 0.3}px) }
                                      50% { transform: translate(${size * 0.6}px, ${size * 0.6}px) }
                                      62.5% { transform: translate(${size * 0.3}px, ${size * 0.6}px) }
                                      75% { transform: translate(1px, ${size * 0.6}px) }
                                      87.5% { transform: translate(1px, ${size * 0.3}px) } }
                    @keyframes hourglass-top { 0% { transform: rotate(0); } 
                                              50% { transform: rotate(180deg); } 
                                              100% { transform: rotate(180deg); } }
                    @keyframes hourglass-bottom { 0% { transform: rotate(0); } 
                                                 50% { transform: rotate(0); } 
                                                 100% { transform: rotate(180deg); } }
                    @keyframes ellipsis { 0%, 80%, 100% { transform: scale(0) } 40% { transform: scale(1) } }
                    @keyframes hearts { 0% { transform: scale(0.8) rotate(45deg); opacity: 0.8; }
                                       50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
                                       100% { transform: scale(0.8) rotate(45deg); opacity: 0.8; } }
                  </style>
                  ${svgContent}
                </div>
              </foreignObject>
            </svg>
          `;

          const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(blob);

          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = "loader.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          };
          img.src = url;
        } catch (error) {
          console.error("Error creating PNG:", error);
        }
      } else if (format === "gif") {
        // For GIF, use the backend endpoint
        try {
          // Create a simple animation
          const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
              <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              </style>
              <g style="animation: spin ${1 / speed}s linear infinite;">
                <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.4}" fill="${colors[0]}" />
              </g>
            </svg>
          `;

          const blob = new Blob([svgString], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);

          const img = new Image();
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const dataUrl = canvas.toDataURL("image/png");

            try {
              const response = await loaderToolsApi.convertToGif({
                imageData: dataUrl,
                duration: 1000 / speed,
              });

              const gifUrl = URL.createObjectURL(response.data);
              const link = document.createElement("a");
              link.href = gifUrl;
              link.download = "loader.gif";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(gifUrl);
            } catch (error) {
              console.error("Error converting to GIF:", error);
            }
          };
          img.src = url;
        } catch (error) {
          console.error("Error creating GIF:", error);
        }
      }

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Failed to download loader:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderAllLoaderTypes = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={1}>
          {loaderTypes.map((loader) => {
            const defaultOptions = loader.defaultOptions;
            return (
              <Grid item xs={3} sm={3} md={2} key={loader.id}>
                <Paper
                  sx={{
                    p: 1.5,
                    height: 80,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    bgcolor: selectedType === loader.id ? "primary.light" : "background.paper",
                    color: selectedType === loader.id ? "primary.contrastText" : "text.primary",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 3,
                      bgcolor: selectedType === loader.id ? "primary.main" : "background.paper",
                    },
                  }}
                  onClick={() => handleTypeChange(loader.id)}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: generateLoaderHTML(loader.id, {
                        colors: defaultOptions.colors,
                        speed: 1,
                        size: 30,
                        scale: 0.8,
                        opacity: 1,
                        thickness: defaultOptions.thickness || 4,
                      }),
                    }}
                  />
                  <Typography variant="caption" align="center" noWrap>
                    {loader.name}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderSingleColorInput = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Color
        </Typography>
        <TextField
          type="color"
          value={colors[0]}
          onChange={handleSingleColorChange}
          fullWidth
          size="small"
          sx={{
            "& input": {
              height: "35px",
              cursor: "pointer",
            },
          }}
        />
      </Box>
    );
  };

  const renderMultiColorInput = () => {
    // Fixed number of colors for multi-color loaders
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Colors
        </Typography>
        <Grid container spacing={1}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={3} key={index}>
              <TextField
                type="color"
                value={colors[index] || "#cccccc"}
                onChange={(e) => handleColorChange(index, e)}
                fullWidth
                size="small"
                sx={{
                  "& input": {
                    height: "30px",
                    cursor: "pointer",
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderColorPresets = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Color Presets
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {colorPresets.slice(0, currentLoader.customOptions.includes("multiColor") ? 10 : 8).map((preset, index) => (
            <Box
              key={index}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "4px",
                cursor: "pointer",
                overflow: "hidden",
                border: "1px solid #ddd",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
              onClick={() => setColors(currentLoader.customOptions.includes("multiColor") ? [...preset] : [preset[0]])}
            >
              {preset.length === 1 ? (
                <Box sx={{ width: "100%", height: "100%", bgcolor: preset[0] }} />
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", width: "100%", height: "100%" }}>
                  {preset.map((color, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: preset.length <= 2 ? "100%" : "50%",
                        height: preset.length <= 2 ? `${100 / preset.length}%` : "50%",
                        bgcolor: color,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const CustomSlider = ({ label, value, onChange, min, max, step, displayValue }) => {
    // Create increment and decrement functions
    const increment = () => {
      const newValue = Math.min(Number(value) + (step || 0.1), max);
      onChange(newValue);
    };

    const decrement = () => {
      const newValue = Math.max(Number(value) - (step || 0.1), min);
      onChange(newValue);
    };

    // Handle direct input
    const handleInputChange = (e) => {
      let newValue = parseFloat(e.target.value);
      if (isNaN(newValue)) return;
      
      // Clamp the value between min and max
      newValue = Math.max(min, Math.min(max, newValue));
      onChange(newValue);
    };

    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography variant="body2">{label}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="small" 
            onClick={decrement}
            sx={{ p: 0.5 }}
          >
            <Remove fontSize="small" />
          </IconButton>
          
          <TextField
            size="small"
            type="number"
            value={value}
            onChange={handleInputChange}
            inputProps={{ 
              min, 
              max, 
              step: step || 0.1,
              style: { textAlign: 'center', paddingTop: 2, paddingBottom: 2 }
            }}
            sx={{ 
              mx: 1,
              width: '60px',
              '& input': { px: 1 }
            }}
          />
          
          <IconButton 
            size="small" 
            onClick={increment}
            sx={{ p: 0.5 }}
          >
            <Add fontSize="small" />
          </IconButton>
          
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, minWidth: '60px' }}>
            {displayValue || `${value}${label === 'Size' ? 'px' : ''}`}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Add color presets for quick selection
  const colorPresets = [["#e15b64"], ["#f47e60"], ["#f8b26a"], ["#abbd81"], ["#849b87"], ["#6492ac"], ["#3e54ac"], ["#634b66"], ["#e15b64", "#f47e60", "#f8b26a", "#abbd81"], ["#3e54ac", "#6492ac", "#849b87", "#abbd81"]];

  // Get loader-specific controls
  const renderLoaderControls = () => {
    const { customOptions } = currentLoader;

    return (
      <Box>
        {renderColorPresets()}

        {customOptions.includes("color") && renderSingleColorInput()}
        {customOptions.includes("multiColor") && renderMultiColorInput()}

        {customOptions.includes("speed") && <CustomSlider label="Speed" value={speed} onChange={handleSpeedChange} min={0.1} max={2} step={0.1} />}

        {customOptions.includes("size") && <CustomSlider label="Size" value={size} onChange={handleSizeChange} min={30} max={150} step={5} displayValue={`${size}px`} />}

        {customOptions.includes("thickness") && <CustomSlider label="Thickness" value={thickness} onChange={handleThicknessChange} min={1} max={10} step={1} displayValue={`${thickness}px`} />}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Loader Generator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create beautiful, customizable loading animations
        </Typography>
      </Box>

      {/* Display all loader types first */}
      {renderAllLoaderTypes()}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Main Editor */}
        <Grid container item spacing={2}>
          {/* Preview - 40% width */}
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 2,
                mb: { xs: 2, md: 0 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                minHeight: 180,
                position: "relative",
                backgroundColor: isTransparent ? "transparent" : backgroundColor,
                backgroundImage: isTransparent ? "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)" : "none",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              }}
            >
              <Box ref={previewRef} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }} dangerouslySetInnerHTML={{ __html: generateLoaderHTML() }} />

              {loading && (
                <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)" }}>
                  <CircularProgress />
                </Box>
              )}

              {showSuccessMessage && <Box sx={{ position: "absolute", top: 16, right: 16, bgcolor: "success.main", color: "white", p: 1, borderRadius: 1, fontSize: "0.8rem" }}>Download successful!</Box>}
            </Paper>
          </Grid>

          {/* Controls - 60% width */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1">Customize {currentLoader.name}</Typography>

                <ButtonGroup size="small" variant="outlined">
                  <Button onClick={() => handleDownload("png")} disabled={loading} size="small">
                    PNG
                  </Button>
                  <Button onClick={() => handleDownload("svg")} disabled={loading} size="small">
                    SVG
                  </Button>
                  <Button onClick={() => handleDownload("gif")} disabled={loading} size="small">
                    GIF
                  </Button>
                </ButtonGroup>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Loader-specific controls */}
              {renderLoaderControls()}

              {/* Advanced options in accordion */}
              <Accordion sx={{ mt: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2">Advanced Options</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <CustomSlider label="Scale" value={scale} onChange={handleScaleChange} min={0.1} max={2} step={0.1} />
                  <CustomSlider label="Opacity" value={opacity} onChange={handleOpacityChange} min={0.1} max={1} step={0.1} />
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ mt: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2">Background</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={8}>
                      <TextField
                        label="Background Color"
                        type="color"
                        value={backgroundColor}
                        onChange={handleBackgroundColorChange}
                        fullWidth
                        size="small"
                        disabled={isTransparent}
                        sx={{
                          "& input": {
                            height: "35px",
                            cursor: isTransparent ? "not-allowed" : "pointer",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <FormControlLabel control={<Switch checked={isTransparent} onChange={handleTransparentChange} />} label="Transparent" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        </Grid>
      </Grid>

      <style jsx="true">{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        @keyframes stretch {
          0%,
          40%,
          100% {
            transform: scaleY(0.4);
          }
          20% {
            transform: scaleY(1);
          }
        }
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        @keyframes dual-ring {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes grid {
          0%,
          100% {
            transform: translate(1px, 1px);
          }
          12.5% {
            transform: translate(30px, 1px);
          }
          25% {
            transform: translate(60px, 1px);
          }
          37.5% {
            transform: translate(60px, 30px);
          }
          50% {
            transform: translate(60px, 60px);
          }
          62.5% {
            transform: translate(30px, 60px);
          }
          75% {
            transform: translate(1px, 60px);
          }
          87.5% {
            transform: translate(1px, 30px);
          }
        }
        @keyframes hourglass-top {
          0% {
            transform: rotate(0);
          }
          50% {
            transform: rotate(180deg);
          }
          100% {
            transform: rotate(180deg);
          }
        }
        @keyframes hourglass-bottom {
          0% {
            transform: rotate(0);
          }
          50% {
            transform: rotate(0);
          }
          100% {
            transform: rotate(180deg);
          }
        }
        @keyframes ellipsis {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        @keyframes hearts {
          0% {
            transform: scale(0.8) rotate(45deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2) rotate(45deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.8) rotate(45deg);
            opacity: 0.8;
          }
        }
      `}</style>
    </Container>
  );
};

export default LoaderTools;
