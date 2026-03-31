import React, { useState, useEffect, useRef } from "react";
import { Alert, Box, Container, Grid, Typography, Slider, TextField, Button, IconButton, CircularProgress, Switch, FormControlLabel, Paper, ButtonGroup, Divider, useTheme, useMediaQuery } from "@mui/material";
import { Remove, Add } from "@mui/icons-material";
import { loaderToolsApi } from "../services/api";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import ToolPageHeader from "../components/ToolPageHeader";

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
  // New loader types
  {
    id: "pulse",
    name: "Pulse",
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
    id: "wave",
    name: "Wave",
    defaultOptions: {
      colors: ["#e15b64", "#f47e60", "#f8b26a"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
    },
    customOptions: ["multiColor", "speed", "size"],
  },
  {
    id: "blocks",
    name: "Blocks",
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
    id: "cube",
    name: "Cube",
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
    id: "square",
    name: "Square",
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
    id: "squircle",
    name: "Squircle",
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
    id: "folding-cube",
    name: "Folding",
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
    id: "dot-spin",
    name: "Dot Spin",
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
    id: "clock",
    name: "Clock",
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
    id: "roller",
    name: "Roller",
    defaultOptions: {
      colors: ["#e15b64", "#f47e60", "#f8b26a", "#abbd81"],
      speed: 0.8,
      size: 100,
      scale: 1.0,
      opacity: 0.8,
    },
    customOptions: ["multiColor", "speed", "size"],
  },
];

const loaderExportAnimationStyles = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
  @keyframes stretch { 0%, 40%, 100% { transform: scaleY(0.4); } 20% { transform: scaleY(1); } }
  @keyframes ripple { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
  @keyframes dual-ring { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes grid {
    0%, 100% { transform: translate(1px, 1px); }
    12.5% { transform: translate(30px, 1px); }
    25% { transform: translate(60px, 1px); }
    37.5% { transform: translate(60px, 30px); }
    50% { transform: translate(60px, 60px); }
    62.5% { transform: translate(30px, 60px); }
    75% { transform: translate(1px, 60px); }
    87.5% { transform: translate(1px, 30px); }
  }
  @keyframes hourglass-top { 0% { transform: rotate(0); } 50% { transform: rotate(180deg); } 100% { transform: rotate(180deg); } }
  @keyframes hourglass-bottom { 0% { transform: rotate(0); } 50% { transform: rotate(0); } 100% { transform: rotate(180deg); } }
  @keyframes ellipsis { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
  @keyframes hearts { 0% { transform: scale(0.8) rotate(45deg); opacity: 0.8; } 50% { transform: scale(1.2) rotate(45deg); opacity: 1; } 100% { transform: scale(0.8) rotate(45deg); opacity: 0.8; } }
`;

const LoaderTools = () => {
  const previewRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const [selectedType, setSelectedType] = useState("spinner");
  const [activeTab, setActiveTab] = useState("default");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isTransparent, setIsTransparent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // Options
  const [colors, setColors] = useState(["#e15b64", "#f47e60", "#f8b26a", "#abbd81"]);
  const [speed, setSpeed] = useState(0.8);
  const [size, setSize] = useState(100);
  const [scale, setScale] = useState(1.0);
  const [opacity, setOpacity] = useState(0.8);
  const [thickness, setThickness] = useState(4);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
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
      setColors(loader.defaultOptions.colors ?? ["#e15b64"]);
      setSpeed(loader.defaultOptions.speed ?? 0.8);
      setSize(loader.defaultOptions.size ?? 100);
      setScale(loader.defaultOptions.scale ?? 1.0);
      setOpacity(loader.defaultOptions.opacity ?? 0.8);
      setThickness(loader.defaultOptions.thickness ?? 4);
    }
  }, [selectedType]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Add CSS animations to head for the preview
  useEffect(() => {
    // Define keyframes for animations
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes dual-ring {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(1); opacity: 0; }
      }
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      @keyframes grid {
        0%, 100% { transform: translate(1px, 1px); }
        12.5% { transform: translate(30px, 1px); }
        25% { transform: translate(60px, 1px); }
        37.5% { transform: translate(60px, 30px); }
        50% { transform: translate(60px, 60px); }
        62.5% { transform: translate(30px, 60px); }
        75% { transform: translate(1px, 60px); }
        87.5% { transform: translate(1px, 30px); }
      }
      @keyframes hourglass-top {
        0% { transform: rotate(0); }
        50% { transform: rotate(180deg); }
        100% { transform: rotate(180deg); }
      }
      @keyframes hourglass-bottom {
        0% { transform: rotate(0); }
        50% { transform: rotate(0); }
        100% { transform: rotate(180deg); }
      }
      @keyframes ellipsis {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      @keyframes hearts {
        0% { transform: scale(0.8) rotate(45deg); opacity: 0.8; }
        50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
        100% { transform: scale(0.8) rotate(45deg); opacity: 0.8; }
      }
    `;

    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleTypeChange = (type) => {
    setDownloadError("");
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

  const handleThicknessChange = (newValue) => {
    setThickness(newValue);
  };

  const handleBackgroundColorChange = (event) => {
    setBackgroundColor(event.target.value);
  };

  const handleTransparentChange = (event) => {
    setIsTransparent(event.target.checked);
  };

  const handleDownload = async (format) => {
    if (!previewRef.current) return;

    setLoading(true);
    setActiveTab(format);
    setDownloadError("");
    setShowSuccessMessage(false);
    try {
      const triggerDownload = (href, filename) => {
        const link = document.createElement("a");
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      const capturePreviewAsPngDataUrl = async () => {
        const canvas = await html2canvas(previewRef.current, {
          backgroundColor: isTransparent ? null : backgroundColor,
          scale: 2,
          useCORS: true,
        });

        return canvas.toDataURL("image/png");
      };

      const buildSvgMarkup = () => `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <foreignObject width="100%" height="100%">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:${isTransparent ? "transparent" : backgroundColor};"
            >
              <style>${loaderExportAnimationStyles}</style>
              ${generateLoaderHTML()}
            </div>
          </foreignObject>
        </svg>
      `;

      if (format === "svg") {
        const svgBlob = new Blob([buildSvgMarkup()], { type: "image/svg+xml;charset=utf-8" });
        saveAs(svgBlob, "loader.svg");
      } else if (format === "png") {
        const pngUrl = await capturePreviewAsPngDataUrl();
        triggerDownload(pngUrl, "loader.png");
      } else if (format === "gif") {
        const dataUrl = await capturePreviewAsPngDataUrl();
        const response = await loaderToolsApi.convertToGif({
          imageData: dataUrl,
          duration: Math.max(100, Math.round(1000 / speed)),
          size: Math.max(50, size),
        });

        saveAs(response.data, "loader.gif");
      }

      // Show success message
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }
      setShowSuccessMessage(true);
      successTimeoutRef.current = window.setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Failed to download loader:", error);
      setShowSuccessMessage(false);
      const apiMessage = error.response?.data?.error || error.response?.data?.message;
      setDownloadError(apiMessage || "Failed to export the loader. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderAllLoaderTypes = () => {
    // Filter to only show the specific loaders shown in the image
    const displayedLoaderTypes = ["spinner", "ring", "dual-ring", "ripple", "dots", "grid", "hourglass", "ellipsis", "pie", "bars", "circles", "hearts"];

    // Find the loader types that match our display list
    const displayLoaders = loaderTypes.filter((loader) => displayedLoaderTypes.includes(loader.id));

    return (
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {displayLoaders.map((loader) => {
            const defaultOptions = loader.defaultOptions;
            return (
              <Grid item xs={6} sm={4} md={2} key={loader.id}>
                <Paper
                  sx={{
                    p: 2,
                    height: 100,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    bgcolor: selectedType === loader.id ? "rgba(0, 0, 0, 0.03)" : "background.paper",
                    border: selectedType === loader.id ? `1px solid ${theme.palette.primary.main}` : "1px solid #e0e0e0",
                    borderRadius: 1,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                      bgcolor: "rgba(0, 0, 0, 0.02)",
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
                      mb: 1,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: generateLoaderHTML(loader.id, {
                        colors: defaultOptions.colors || [theme.palette.primary.main],
                        speed: 1,
                        size: 35,
                        scale: 0.8,
                        opacity: 1,
                        thickness: defaultOptions.thickness || 4,
                      }),
                    }}
                  />
                  <Typography variant="body2" align="center" noWrap>
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom fontWeight="500">
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
              height: "40px",
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom fontWeight="500">
          Color Presets
        </Typography>
        <Grid container spacing={0.75}>
          {colorPresets.slice(0, 8).map((preset, index) => (
            <Grid item key={index}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "4px",
                  cursor: "pointer",
                  overflow: "hidden",
                  border: colors[0] === preset[0] ? `2px solid ${theme.palette.primary.main}` : "1px solid #e0e0e0",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 1,
                  },
                }}
                onClick={() => setColors(currentLoader.customOptions.includes("multiColor") ? [...preset] : [preset[0]])}
              >
                <Box sx={{ width: "100%", height: "100%", bgcolor: preset[0] }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const CustomSlider = ({ label, value, onChange, min, max, step, displayValue, disabled = false, helperText = "" }) => {
    // Create increment and decrement functions
    const increment = () => {
      if (disabled) return;
      const newValue = Math.min(Number(value) + (step || 0.1), max);
      onChange(newValue);
    };

    const decrement = () => {
      if (disabled) return;
      const newValue = Math.max(Number(value) - (step || 0.1), min);
      onChange(newValue);
    };

    // Handle direct input
    const handleInputChange = (e) => {
      if (disabled) return;
      let newValue = parseFloat(e.target.value);
      if (isNaN(newValue)) return;

      // Clamp the value between min and max
      newValue = Math.max(min, Math.min(max, newValue));
      onChange(newValue);
    };

    return (
      <Box sx={{ mb: 3, opacity: disabled ? 0.58 : 1, transition: "opacity 0.2s ease" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography variant="body2" fontWeight="500">
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {displayValue || value}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton size="small" onClick={decrement} sx={{ p: 0.5 }} disabled={disabled}>
            <Remove fontSize="small" />
          </IconButton>

          <TextField
            size="small"
            type="number"
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            inputProps={{
              step: step || 0.1,
              min,
              max,
              style: { textAlign: "center" },
            }}
            sx={{ mx: 1, width: "70px" }}
          />

          <IconButton size="small" onClick={increment} sx={{ p: 0.5 }} disabled={disabled}>
            <Add fontSize="small" />
          </IconButton>

          <Slider
            value={value}
            onChange={(_, newValue) => onChange(newValue)}
            min={min}
            max={max}
            step={step || 0.1}
            disabled={disabled}
            sx={{ ml: 2, flex: 1 }}
          />
        </Box>
        {helperText ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
            {helperText}
          </Typography>
        ) : null}
      </Box>
    );
  };

  // Add color presets for quick selection
  const colorPresets = [["#e15b64"], ["#f47e60"], ["#f8b26a"], ["#abbd81"], ["#849b87"], ["#6492ac"], ["#3e54ac"], ["#634b66"], ["#e15b64", "#f47e60", "#f8b26a", "#abbd81"], ["#3e54ac", "#6492ac", "#849b87", "#abbd81"]];

  // Get loader-specific controls
  const renderLoaderControls = () => {
    const customOptions = currentLoader.customOptions || ["color", "speed", "size", "thickness"];
    const supportsSize = customOptions.includes("size");
    const supportsThickness = customOptions.includes("thickness");

    return (
      <Box>
        {renderColorPresets()}

        {customOptions.includes("color") && renderSingleColorInput()}
        {customOptions.includes("multiColor") && renderMultiColorInput()}

        <CustomSlider label="Speed" value={speed} onChange={handleSpeedChange} min={0.1} max={2} step={0.1} displayValue={`${speed}s`} />

        <CustomSlider
          label="Size"
          value={size}
          onChange={handleSizeChange}
          min={30}
          max={150}
          step={5}
          displayValue={`${size}px`}
          disabled={!supportsSize}
          helperText={!supportsSize ? `${currentLoader.name} uses border thickness instead of a size control.` : ""}
        />

        <CustomSlider
          label="Thickness"
          value={thickness}
          onChange={handleThicknessChange}
          min={1}
          max={10}
          step={1}
          displayValue={`${thickness}px`}
          disabled={!supportsThickness}
          helperText={!supportsThickness ? `${currentLoader.name} is driven by size rather than border thickness.` : ""}
        />
      </Box>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        <ToolPageHeader
          title="Loader Generator"
          description="Build and export customizable loading animations with live preview support for PNG, SVG, and GIF output."
          chips={["Live preview", "Export ready", "Mobile friendly controls"]}
        />
      </Box>

      {/* Display all loader types first */}
      {renderAllLoaderTypes()}

      <Box sx={{ mt: 4, mb: 6 }}>
        <Grid container spacing={3}>
          {/* Preview - Left side */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: { xs: 2, md: 0 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                minHeight: 300,
                position: "relative",
                backgroundColor: isTransparent ? "transparent" : backgroundColor,
                backgroundImage: isTransparent ? "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)" : "none",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                border: "1px solid #e0e0e0",
                borderRadius: 2,
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

          {/* Controls - Right side */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, flexDirection: { xs: "column", md: "row" }, gap: 1.5, mb: 3 }}>
                <Typography variant="h6">Customize {currentLoader.name}</Typography>

                <ButtonGroup orientation={isSmallScreen ? "vertical" : "horizontal"}>
                  <Button onClick={() => handleDownload("png")} disabled={loading} variant={activeTab === "png" ? "contained" : "outlined"} sx={{ px: 2 }}>
                    PNG
                  </Button>
                  <Button onClick={() => handleDownload("svg")} disabled={loading} variant={activeTab === "svg" ? "contained" : "outlined"} sx={{ px: 2 }}>
                    SVG
                  </Button>
                  <Button onClick={() => handleDownload("gif")} disabled={loading} variant={activeTab === "gif" ? "contained" : "outlined"} sx={{ px: 2 }}>
                    GIF
                  </Button>
                </ButtonGroup>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {downloadError ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {downloadError}
                </Alert>
              ) : null}

              {/* Loader-specific controls */}
              {renderLoaderControls()}

              {/* Background settings */}
              <Box sx={{ mb: 2, mt: 1 }}>
                <Typography variant="body2" gutterBottom fontWeight="500">
                  Background
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <TextField
                      type="color"
                      value={backgroundColor}
                      onChange={handleBackgroundColorChange}
                      fullWidth
                      size="small"
                      disabled={isTransparent}
                      sx={{
                        "& input": {
                          height: "40px",
                          cursor: isTransparent ? "not-allowed" : "pointer",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControlLabel control={<Switch checked={isTransparent} onChange={handleTransparentChange} />} label="Transparent" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* CSS animations */}
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
