import express from "express";
import { body, validationResult } from "express-validator";
import gifEncoder from "gif-encoder";
import { Buffer } from "buffer";
import sharp from "sharp";

const router = express.Router();

// Helper to generate loader CSS
const generateLoaderCSS = (type, size, speed, color, thickness) => {
  const sizeValue = `${size}px`;
  const defaultSpeed = '1.2s';
  const animationSpeed = `${speed}s`;
  const thicknessVal = `${thickness}px`;
  
  let css = '';
  let html = '';
  
  switch(type) {
    case 'spinner':
      css = `
        .loader {
          border: ${thicknessVal} solid #f3f3f3;
          border-top: ${thicknessVal} solid ${color};
          border-radius: 50%;
          width: ${sizeValue};
          height: ${sizeValue};
          animation: spin ${animationSpeed} linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      html = '<div class="loader"></div>';
      break;
    
    case 'pie':
      css = `
        .loader {
          width: ${sizeValue};
          height: ${sizeValue};
          border-radius: 50%;
          background: conic-gradient(${color} 0%, #f3f3f3 0%);
          animation: pie-fill ${animationSpeed} ease-in-out infinite alternate;
        }
        @keyframes pie-fill {
          0% { background: conic-gradient(${color} 0%, #f3f3f3 0%); }
          100% { background: conic-gradient(${color} 100%, #f3f3f3 0%); }
        }
      `;
      html = '<div class="loader"></div>';
      break;
    
    case 'dots':
      css = `
        .loader {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: ${thicknessVal};
        }
        .loader div {
          width: ${Math.max(5, size/5)}px;
          height: ${Math.max(5, size/5)}px;
          background-color: ${color};
          border-radius: 50%;
          animation: bounce ${animationSpeed} infinite ease-in-out both;
        }
        .loader div:nth-child(1) { animation-delay: -0.32s; }
        .loader div:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `;
      html = '<div class="loader"><div></div><div></div><div></div></div>';
      break;
      
    case 'bars':
      css = `
        .loader {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: ${Math.max(2, thickness/2)}px;
          height: ${sizeValue};
        }
        .loader div {
          width: ${Math.max(3, thickness)}px;
          height: 100%;
          background-color: ${color};
          animation: wave ${animationSpeed} infinite ease-in-out;
        }
        .loader div:nth-child(1) { animation-delay: -0.4s; }
        .loader div:nth-child(2) { animation-delay: -0.3s; }
        .loader div:nth-child(3) { animation-delay: -0.2s; }
        .loader div:nth-child(4) { animation-delay: -0.1s; }
        @keyframes wave {
          0%, 40%, 100% { transform: scaleY(0.4); }
          20% { transform: scaleY(1); }
        }
      `;
      html = '<div class="loader"><div></div><div></div><div></div><div></div><div></div></div>';
      break;
      
    case 'circles':
      css = `
        .loader {
          position: relative;
          width: ${sizeValue};
          height: ${sizeValue};
        }
        .loader div {
          position: absolute;
          border: ${thicknessVal} solid ${color};
          opacity: 1;
          border-radius: 50%;
          animation: ripple ${animationSpeed} cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }
        .loader div:nth-child(2) {
          animation-delay: -0.5s;
        }
        @keyframes ripple {
          0% {
            top: ${size/2}px;
            left: ${size/2}px;
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            top: 0px;
            left: 0px;
            width: ${size}px;
            height: ${size}px;
            opacity: 0;
          }
        }
      `;
      html = '<div class="loader"><div></div><div></div></div>';
      break;
      
    case 'dual-ring':
      css = `
        .loader {
          display: inline-block;
          width: ${sizeValue};
          height: ${sizeValue};
        }
        .loader:after {
          content: " ";
          display: block;
          width: ${Math.max(size - thickness*2, size*0.8)}px;
          height: ${Math.max(size - thickness*2, size*0.8)}px;
          margin: ${thickness}px;
          border-radius: 50%;
          border: ${thicknessVal} solid ${color};
          border-color: ${color} transparent ${color} transparent;
          animation: dual-ring ${animationSpeed} linear infinite;
        }
        @keyframes dual-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      html = '<div class="loader"></div>';
      break;
      
    case 'wave':
      css = `
        .loader {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: ${Math.max(2, thickness/2)}px;
          height: ${sizeValue};
        }
        .loader div {
          background-color: ${color};
          height: 100%;
          width: ${Math.max(4, thickness)}px;
          display: inline-block;
          animation: wave ${animationSpeed} infinite ease-in-out;
        }
        .loader div:nth-child(1) { animation-delay: 0s; }
        .loader div:nth-child(2) { animation-delay: 0.1s; }
        .loader div:nth-child(3) { animation-delay: 0.2s; }
        .loader div:nth-child(4) { animation-delay: 0.3s; }
        .loader div:nth-child(5) { animation-delay: 0.4s; }
        @keyframes wave {
          0%, 40%, 100% { transform: scaleY(0.4); }
          20% { transform: scaleY(1); }
        }
      `;
      html = '<div class="loader"><div></div><div></div><div></div><div></div><div></div></div>';
      break;
      
    case 'pulse':
      css = `
        .loader {
          width: ${sizeValue};
          height: ${sizeValue};
          background-color: ${color};
          border-radius: 50%;
          animation: pulse ${animationSpeed} cubic-bezier(0.2, 0, 0.8, 1) infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(${hexToRgb(color)}, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 ${thickness*2}px rgba(${hexToRgb(color)}, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(${hexToRgb(color)}, 0); }
        }
      `;
      html = '<div class="loader"></div>';
      break;
      
    case 'cube':
      css = `
        .loader {
          width: ${sizeValue};
          height: ${sizeValue};
          position: relative;
          transform: rotateZ(45deg);
          perspective: 1000px;
        }
        .loader-cube {
          float: left;
          width: 50%;
          height: 50%;
          position: relative;
          transform: scale(1.1);
        }
        .loader-cube:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: ${color};
          animation: foldCube ${animationSpeed} infinite linear both;
          transform-origin: 100% 100%;
        }
        .loader-cube:nth-child(2) { transform: scale(1.1) rotateZ(90deg); }
        .loader-cube:nth-child(3) { transform: scale(1.1) rotateZ(270deg); }
        .loader-cube:nth-child(4) { transform: scale(1.1) rotateZ(180deg); }
        .loader-cube:nth-child(2):before { animation-delay: 0.${Math.floor(speed*10)}s; }
        .loader-cube:nth-child(3):before { animation-delay: 0.${Math.floor(speed*20)}s; }
        .loader-cube:nth-child(4):before { animation-delay: 0.${Math.floor(speed*30)}s; }
        @keyframes foldCube {
          0%, 10% { transform: perspective(140px) rotateX(-180deg); opacity: 0; }
          25%, 75% { transform: perspective(140px) rotateX(0deg); opacity: 1; }
          90%, 100% { transform: perspective(140px) rotateY(180deg); opacity: 0; }
        }
      `;
      html = '<div class="loader"><div class="loader-cube"></div><div class="loader-cube"></div><div class="loader-cube"></div><div class="loader-cube"></div></div>';
      break;
      
    case 'square':
      css = `
        .loader {
          width: ${sizeValue};
          height: ${sizeValue};
          background-color: ${color};
          animation: squarePulse ${animationSpeed} infinite ease;
        }
        @keyframes squarePulse {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(45deg) scale(1.2); }
          100% { transform: rotate(90deg) scale(1); }
        }
      `;
      html = '<div class="loader"></div>';
      break;
      
    case 'roller':
      css = `
        .loader {
          display: inline-block;
          position: relative;
          width: ${sizeValue};
          height: ${sizeValue};
        }
        .loader div {
          animation: rollerChild ${animationSpeed} cubic-bezier(0.5, 0, 0.5, 1) infinite;
          transform-origin: ${size/2}px ${size/2}px;
        }
        .loader div:after {
          content: " ";
          display: block;
          position: absolute;
          width: ${Math.max(thickness, size/12)}px;
          height: ${Math.max(thickness, size/12)}px;
          border-radius: 50%;
          background: ${color};
          margin: -${Math.max(thickness, size/24)}px 0 0 -${Math.max(thickness, size/24)}px;
        }
        .loader div:nth-child(1) { animation-delay: -0.036s; }
        .loader div:nth-child(1):after { top: ${size*0.88}px; left: ${size/2}px; }
        .loader div:nth-child(2) { animation-delay: -0.072s; }
        .loader div:nth-child(2):after { top: ${size*0.82}px; left: ${size*0.82}px; }
        .loader div:nth-child(3) { animation-delay: -0.108s; }
        .loader div:nth-child(3):after { top: ${size/2}px; left: ${size*0.88}px; }
        .loader div:nth-child(4) { animation-delay: -0.144s; }
        .loader div:nth-child(4):after { top: ${size*0.18}px; left: ${size*0.82}px; }
        .loader div:nth-child(5) { animation-delay: -0.18s; }
        .loader div:nth-child(5):after { top: ${size*0.12}px; left: ${size/2}px; }
        .loader div:nth-child(6) { animation-delay: -0.216s; }
        .loader div:nth-child(6):after { top: ${size*0.18}px; left: ${size*0.18}px; }
        .loader div:nth-child(7) { animation-delay: -0.252s; }
        .loader div:nth-child(7):after { top: ${size/2}px; left: ${size*0.12}px; }
        .loader div:nth-child(8) { animation-delay: -0.288s; }
        .loader div:nth-child(8):after { top: ${size*0.82}px; left: ${size*0.18}px; }
        @keyframes rollerChild {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      html = '<div class="loader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
      break;
      
    case 'clock':
      css = `
        .loader {
          position: relative;
          width: ${sizeValue};
          height: ${sizeValue};
          border: ${thicknessVal} solid ${color};
          border-radius: 50%;
        }
        .loader:before, .loader:after {
          content: "";
          position: absolute;
          background-color: ${color};
          top: ${size/2}px;
          transform-origin: 0 0;
        }
        .loader:before {
          width: ${size*0.3}px;
          height: ${thickness}px;
          animation: clockHand ${animationSpeed} linear infinite;
        }
        .loader:after {
          width: ${size*0.4}px;
          height: ${thickness}px;
          animation: clockHand ${speed*3}s linear infinite;
        }
        @keyframes clockHand {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      html = '<div class="loader"></div>';
      break;
      
    case 'dot-spin':
      css = `
        .loader {
          position: relative;
          width: ${sizeValue};
          height: ${sizeValue};
        }
        .loader div {
          position: absolute;
          background-color: ${color};
          width: ${Math.max(5, size/6)}px;
          height: ${Math.max(5, size/6)}px;
          border-radius: 50%;
          animation: dotSpin ${animationSpeed} linear infinite;
        }
        .loader div:nth-child(1) { top: 0; left: calc(50% - ${Math.max(5, size/6)/2}px); animation-delay: 0s; }
        .loader div:nth-child(2) { top: calc(25% - ${Math.max(5, size/6)/2}px); left: calc(75% - ${Math.max(5, size/6)/2}px); animation-delay: -${speed/8}s; }
        .loader div:nth-child(3) { top: calc(50% - ${Math.max(5, size/6)/2}px); left: calc(100% - ${Math.max(5, size/6)}px); animation-delay: -${speed/4}s; }
        .loader div:nth-child(4) { top: calc(75% - ${Math.max(5, size/6)/2}px); left: calc(75% - ${Math.max(5, size/6)/2}px); animation-delay: -${speed*3/8}s; }
        .loader div:nth-child(5) { top: calc(100% - ${Math.max(5, size/6)}px); left: calc(50% - ${Math.max(5, size/6)/2}px); animation-delay: -${speed/2}s; }
        .loader div:nth-child(6) { top: calc(75% - ${Math.max(5, size/6)/2}px); left: calc(25% - ${Math.max(5, size/6)/2}px); animation-delay: -${speed*5/8}s; }
        .loader div:nth-child(7) { top: calc(50% - ${Math.max(5, size/6)/2}px); left: 0; animation-delay: -${speed*3/4}s; }
        .loader div:nth-child(8) { top: calc(25% - ${Math.max(5, size/6)/2}px); left: calc(25% - ${Math.max(5, size/6)/2}px); animation-delay: -${speed*7/8}s; }
        @keyframes dotSpin {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `;
      html = '<div class="loader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
      break;
      
    case 'folding-cube':
      css = `
        .loader {
          width: ${sizeValue};
          height: ${sizeValue};
          position: relative;
          transform: rotateZ(45deg);
        }
        .loader-cube {
          float: left;
          width: 50%;
          height: 50%;
          position: relative;
          transform: scale(1.1);
        }
        .loader-cube:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: ${color};
          animation: foldCube ${animationSpeed} infinite linear both;
          transform-origin: 100% 100%;
        }
        .loader-cube:nth-child(2) {
          transform: scale(1.1) rotateZ(90deg);
        }
        .loader-cube:nth-child(4) {
          transform: scale(1.1) rotateZ(180deg);
        }
        .loader-cube:nth-child(3) {
          transform: scale(1.1) rotateZ(270deg);
        }
        .loader-cube:nth-child(2):before {
          animation-delay: 0.${Math.floor(speed*10)}s;
        }
        .loader-cube:nth-child(4):before {
          animation-delay: 0.${Math.floor(speed*20)}s;
        }
        .loader-cube:nth-child(3):before {
          animation-delay: 0.${Math.floor(speed*30)}s;
        }
        @keyframes foldCube {
          0%, 10% {
            transform: perspective(140px) rotateX(-180deg);
            opacity: 0;
          }
          25%, 75% {
            transform: perspective(140px) rotateX(0deg);
            opacity: 1;
          }
          90%, 100% {
            transform: perspective(140px) rotateY(180deg);
            opacity: 0;
          }
        }
      `;
      html = '<div class="loader"><div class="loader-cube"></div><div class="loader-cube"></div><div class="loader-cube"></div><div class="loader-cube"></div></div>';
      break;
      
    case 'squircle':
      css = `
        .loader {
          width: ${sizeValue};
          height: ${sizeValue};
          background-color: ${color};
          border-radius: 30%;
          animation: squircleRotate ${animationSpeed} infinite cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        @keyframes squircleRotate {
          0% { transform: rotate(0deg); border-radius: 30%; }
          50% { transform: rotate(180deg); border-radius: 50%; }
          100% { transform: rotate(360deg); border-radius: 30%; }
        }
      `;
      html = '<div class="loader"></div>';
      break;
      
    default:
      // Default spinner
      css = `
        .loader {
          border: ${thicknessVal} solid #f3f3f3;
          border-top: ${thicknessVal} solid ${color};
          border-radius: 50%;
          width: ${sizeValue};
          height: ${sizeValue};
          animation: spin ${animationSpeed} linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      html = '<div class="loader"></div>';
  }

  return { css, html };
};

// Helper to convert HEX to RGB
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  
  return `${r}, ${g}, ${b}`;
}

// Helper function to generate HTML for different loader types
const generateLoaderHTML = (type) => {
  const templates = {
    spinner: '<div class="loader"></div>',
    dots: '<div class="loader"><div></div><div></div><div></div></div>',
    bars: '<div class="loader"><div></div><div></div><div></div><div></div><div></div></div>',
    circles: '<div class="loader"><div></div><div></div></div>',
    "dual-ring": '<div class="loader"></div>',
    heart: '<div class="loader"></div>',
    hourglass: '<div class="loader"></div>',
  };

  return templates[type] || templates.spinner;
};

// Helper function to generate SVG for different loader types
const generateLoaderSVG = (type, options) => {
  const { colors, speed, size, scale, opacity } = options;
  let svgContent = "";

  switch (type) {
    case "spinner":
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .spinner {
              transform-origin: center;
              animation: spin ${1 / speed}s linear infinite;
              opacity: ${opacity};
            }
          </style>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f3f3" stroke-width="8" />
          <path class="spinner" d="M50 10 A40 40 0 0 1 90 50" fill="none" stroke="${colors[0]}" stroke-width="8" stroke-linecap="round" />
        </svg>
      `;
      break;
    case "pie":
      // Calculate angles for pie segments
      const totalSegments = colors.length;
      const segmentAngle = 360 / totalSegments;

      let segments = "";
      colors.forEach((color, index) => {
        const startAngle = index * segmentAngle;
        const endAngle = (index + 1) * segmentAngle;

        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad = ((endAngle - 90) * Math.PI) / 180;

        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);

        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        segments += `<path d="M50,50 L${x1},${y1} A40,40 0 ${largeArcFlag},1 ${x2},${y2} Z" fill="${color}" />`;
      });

      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
          <style>
            @keyframes rotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .pie {
              transform-origin: center;
              animation: rotate ${1 / speed}s linear infinite;
              opacity: ${opacity};
            }
          </style>
          <g class="pie">
            ${segments}
          </g>
        </svg>
      `;
      break;
    case "dots":
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size / 3}" viewBox="0 0 120 40">
          <style>
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1); }
            }
            .dot1 { animation: bounce ${1 / speed}s infinite ease-in-out both; }
            .dot2 { animation: bounce ${1 / speed}s infinite ease-in-out both; animation-delay: 0.16s; }
            .dot3 { animation: bounce ${1 / speed}s infinite ease-in-out both; animation-delay: 0.32s; }
          </style>
          <g opacity="${opacity}" transform="scale(${scale})">
            <circle class="dot1" cx="20" cy="20" r="10" fill="${colors[0]}" />
            <circle class="dot2" cx="60" cy="20" r="10" fill="${colors[0]}" />
            <circle class="dot3" cx="100" cy="20" r="10" fill="${colors[0]}" />
          </g>
        </svg>
      `;
      break;
    // Add cases for other loader types
    default:
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .spinner {
              transform-origin: center;
              animation: spin ${1 / speed}s linear infinite;
              opacity: ${opacity};
            }
          </style>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f3f3" stroke-width="8" />
          <path class="spinner" d="M50 10 A40 40 0 0 1 90 50" fill="none" stroke="${colors[0]}" stroke-width="8" stroke-linecap="round" />
        </svg>
      `;
  }

  return svgContent;
};

// Generate loader endpoint
router.post("/generate", [body("type").isIn(["spinner", "dots", "bars", "circles", "dual-ring", "heart", "hourglass", "pie"]), body("size").isInt({ min: 16, max: 256 }), body("speed").isFloat({ min: 0.5, max: 3 }), body("color").matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/), body("thickness").isInt({ min: 1, max: 10 }), body("strokeWidth").optional().isInt({ min: 1, max: 20 }), body("radius").optional().isInt({ min: 0, max: 100 }), body("backgroundColor").optional()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type, size, speed, color, thickness, strokeWidth = 4, radius = 50, backgroundColor = "transparent" } = req.body;

    const { css, html } = generateLoaderCSS(type, size, speed, color, thickness);

    res.json({
      css,
      html,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate loader" });
  }
});

// Download loader as SVG endpoint
router.post("/downloadAsSVG", [body("type").isIn(["spinner", "dots", "bars", "circles", "dual-ring", "heart", "hourglass", "pie"]), body("colors").isArray(), body("speed").isFloat({ min: 0.1, max: 2 }), body("size").isInt({ min: 50, max: 500 }), body("scale").optional().isFloat({ min: 0.1, max: 2 }), body("opacity").optional().isFloat({ min: 0.1, max: 1 }), body("backgroundColor").optional()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type, colors, speed, size, scale = 1.0, opacity = 1.0, backgroundColor = "transparent" } = req.body;

    const svgContent = generateLoaderSVG(type, { colors, speed, size, scale, opacity, backgroundColor });

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Content-Disposition", "attachment; filename=loader.svg");
    res.send(svgContent);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate SVG" });
  }
});

// Convert image to GIF endpoint
router.post("/convertToGif", [body("imageData").notEmpty().withMessage("Image data is required"), body("duration").isInt({ min: 100, max: 10000 }).withMessage("Duration must be between 100ms and 10s")], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { imageData, duration, size = 200 } = req.body;
    const canvasSize = parseInt(size);

    // Extract the base64 data
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Create a GIF encoder
    const gif = new gifEncoder(canvasSize, canvasSize);
    const chunks = [];

    gif.on("data", (chunk) => {
      chunks.push(chunk);
    });
    gif.setQuality(10);
    gif.setDelay(duration);
    gif.setRepeat(0);
    gif.writeHeader();

    // Use a single accurate frame from the submitted preview image.
    const frameBuffer = await sharp(buffer)
      .resize(canvasSize, canvasSize, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .ensureAlpha()
      .raw()
      .toBuffer();

    gif.addFrame(frameBuffer);

    gif.finish();

    // Send the GIF
    const gifData = Buffer.concat(chunks);
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Content-Disposition", "attachment; filename=loader.gif");
    res.send(gifData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to convert to GIF" });
  }
});

// Old download endpoint (kept for compatibility)
router.post("/download", [body("type").isIn(["spinner", "dots", "bars", "circles", "dual-ring", "heart", "hourglass", "pie"]), body("size").isInt({ min: 16, max: 256 }), body("speed").isFloat({ min: 0.5, max: 3 }), body("color").matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/), body("thickness").isInt({ min: 1, max: 10 }), body("strokeWidth").optional().isInt({ min: 1, max: 20 }), body("radius").optional().isInt({ min: 0, max: 100 }), body("backgroundColor").optional(), body("format").isIn(["css", "html", "svg"])], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type, size, speed, color, thickness, strokeWidth = 4, radius = 50, backgroundColor = "transparent", format } = req.body;

    let content;

    if (format === "svg") {
      content = generateLoaderSVG(type, {
        colors: [color],
        speed,
        size,
        scale: 1.0,
        opacity: 1.0,
        backgroundColor,
      });
      res.setHeader("Content-Type", "image/svg+xml");
    } else if (format === "css") {
      const { css } = generateLoaderCSS(type, size, speed, color, thickness);
      content = css;
      res.setHeader("Content-Type", "text/css");
    } else {
      const { html } = generateLoaderCSS(type, size, speed, color, thickness);
      content = html;
      res.setHeader("Content-Type", "text/html");
    }

    res.setHeader("Content-Disposition", `attachment; filename=loader.${format}`);
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: "Failed to download loader" });
  }
});

export default router;
