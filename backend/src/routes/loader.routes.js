import express from "express";
import { body, validationResult } from "express-validator";
import gifEncoder from "gif-encoder";
import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";

const router = express.Router();

// Helper function to generate CSS for different loader types
const generateLoaderCSS = (type, size, speed, color, thickness, strokeWidth, radius, backgroundColor) => {
  const styles = {
    spinner: `
      .loader {
        border: ${strokeWidth}px solid #f3f3f3;
        border-radius: ${radius}%;
        border-top: ${strokeWidth}px solid ${color};
        width: ${size}px;
        height: ${size}px;
        animation: spin ${speed}s linear infinite;
        background-color: ${backgroundColor};
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,
    dots: `
      .loader {
        width: ${size}px;
        height: ${size / 4}px;
        display: flex;
        justify-content: space-between;
        background-color: ${backgroundColor};
      }
      .loader > div {
        width: ${size / 4}px;
        height: ${size / 4}px;
        background-color: ${color};
        border-radius: ${radius}%;
        animation: bounce ${speed}s infinite ease-in-out;
      }
      .loader > div:nth-child(2) { animation-delay: ${speed * 0.16}s; }
      .loader > div:nth-child(3) { animation-delay: ${speed * 0.32}s; }
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `,
    bars: `
      .loader {
        width: ${size}px;
        height: ${size}px;
        display: flex;
        justify-content: space-between;
        background-color: ${backgroundColor};
      }
      .loader > div {
        width: ${strokeWidth * 2}px;
        background-color: ${color};
        animation: stretch ${speed}s infinite ease-in-out;
        border-radius: ${radius / 10}px;
      }
      .loader > div:nth-child(2) { animation-delay: ${speed * 0.1}s; }
      .loader > div:nth-child(3) { animation-delay: ${speed * 0.2}s; }
      .loader > div:nth-child(4) { animation-delay: ${speed * 0.3}s; }
      .loader > div:nth-child(5) { animation-delay: ${speed * 0.4}s; }
      @keyframes stretch {
        0%, 40%, 100% { transform: scaleY(0.4); }
        20% { transform: scaleY(1); }
      }
    `,
    circles: `
      .loader {
        width: ${size}px;
        height: ${size}px;
        position: relative;
        background-color: ${backgroundColor};
      }
      .loader > div {
        position: absolute;
        width: ${size * 0.8}px;
        height: ${size * 0.8}px;
        border: ${strokeWidth}px solid ${color};
        border-radius: ${radius}%;
        animation: ripple ${speed}s cubic-bezier(0, 0.2, 0.8, 1) infinite;
      }
      .loader > div:nth-child(2) { animation-delay: ${speed * -0.5}s; }
      @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(1); opacity: 0; }
      }
    `,
    "dual-ring": `
      .loader {
        display: inline-block;
        width: ${size}px;
        height: ${size}px;
        background-color: ${backgroundColor};
      }
      .loader:after {
        content: " ";
        display: block;
        width: ${size * 0.8}px;
        height: ${size * 0.8}px;
        margin: ${size * 0.1}px;
        border-radius: ${radius}%;
        border: ${strokeWidth}px solid ${color};
        border-color: ${color} transparent ${color} transparent;
        animation: dual-ring ${speed}s linear infinite;
      }
      @keyframes dual-ring {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,
    heart: `
      .loader {
        width: ${size}px;
        height: ${size}px;
        position: relative;
        transform: rotate(45deg);
        background-color: ${color};
        animation: heart ${speed}s infinite;
      }
      .loader:before,
      .loader:after {
        content: "";
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: ${radius}%;
        position: absolute;
      }
      .loader:before { left: -${size / 2}px; }
      .loader:after { top: -${size / 2}px; }
      @keyframes heart {
        0% { transform: rotate(45deg) scale(0.8); }
        5% { transform: rotate(45deg) scale(0.9); }
        10% { transform: rotate(45deg) scale(0.8); }
        15% { transform: rotate(45deg) scale(1); }
        50% { transform: rotate(45deg) scale(0.8); }
        100% { transform: rotate(45deg) scale(0.8); }
      }
    `,
    hourglass: `
      .loader {
        width: ${size}px;
        height: ${size}px;
        position: relative;
        animation: hourglass ${speed}s infinite;
        background-color: ${backgroundColor};
      }
      .loader:before,
      .loader:after {
        content: "";
        position: absolute;
        top: 0;
        left: ${size / 4}px;
        width: ${size / 2}px;
        height: ${size / 2}px;
        border: ${strokeWidth}px solid ${color};
      }
      .loader:before {
        clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
      }
      .loader:after {
        top: 50%;
        clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
      }
      @keyframes hourglass {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(180deg); }
      }
    `,
  };

  return styles[type] || styles.spinner;
};

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

    const css = generateLoaderCSS(type, size, speed, color, thickness, strokeWidth, radius, backgroundColor);
    const html = generateLoaderHTML(type);

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
    const { imageData, duration } = req.body;

    // Extract the base64 data
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Create a temporary file to store the image
    const tempId = uuidv4();
    const tempFile = path.join(process.cwd(), "uploads", `temp_${tempId}.png`);
    const outputFile = path.join(process.cwd(), "uploads", `output_${tempId}.gif`);

    // Write the buffer to the file
    fs.writeFileSync(tempFile, buffer);

    // Create a GIF encoder
    const gif = new gifEncoder(200, 200);
    const outputStream = fs.createWriteStream(outputFile);

    gif.pipe(outputStream);
    gif.setQuality(10);
    gif.setDelay(duration);
    gif.setRepeat(0);
    gif.writeHeader();

    // Add frames to the GIF
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext("2d");

    // Create multiple frames for the animation
    for (let i = 0; i < 10; i++) {
      ctx.clearRect(0, 0, 200, 200);
      ctx.save();
      ctx.translate(100, 100);
      ctx.rotate((i * Math.PI) / 5);
      ctx.translate(-100, -100);

      // Draw the image on the canvas
      const img = new Image();
      img.src = buffer;
      ctx.drawImage(img, 0, 0, 200, 200);

      gif.addFrame(ctx.getImageData(0, 0, 200, 200).data);
      ctx.restore();
    }

    gif.finish();

    // Wait for the GIF to be written
    await new Promise((resolve) => {
      outputStream.on("finish", resolve);
    });

    // Send the GIF
    const gifData = fs.readFileSync(outputFile);
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Content-Disposition", "attachment; filename=loader.gif");
    res.send(gifData);

    // Clean up temporary files
    fs.unlinkSync(tempFile);
    fs.unlinkSync(outputFile);
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
      content = generateLoaderCSS(type, size, speed, color, thickness, strokeWidth, radius, backgroundColor);
      res.setHeader("Content-Type", "text/css");
    } else {
      content = generateLoaderHTML(type);
      res.setHeader("Content-Type", "text/html");
    }

    res.setHeader("Content-Disposition", `attachment; filename=loader.${format}`);
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: "Failed to download loader" });
  }
});

export default router;
