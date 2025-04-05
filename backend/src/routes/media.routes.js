import express from "express";
import multer from "multer";
import { body } from "express-validator";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import ffmpeg from "fluent-ffmpeg";
import { io } from "../socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video and audio files are allowed!"));
    }
  },
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to save file and return URL
const saveFile = async (buffer, filename) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const uniqueFilename = `${timestamp}_${filename}`;
  const filepath = path.join(uploadsDir, uniqueFilename);
  await fs.promises.writeFile(filepath, buffer);
  // Return absolute URL path
  return `/uploads/${uniqueFilename}`;
};

// Helper function to parse time string (HH:MM:SS) to seconds
const parseTimeToSeconds = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// Helper function to emit progress
const emitProgress = (processingId, percent) => {
  if (processingId && typeof percent === "number") {
    io.emit("processing-progress", {
      id: processingId,
      progress: percent,
    });
  }
};

// Media convert endpoint
router.post("/convert", upload.single("file"), [body("format").isIn(["mp4", "webm", "mov", "avi", "mkv", "gif", "mp3", "aac", "wav"]).withMessage("Invalid format"), body("resolution").optional().isString(), body("fps").optional().isInt({ min: 15, max: 60 })], async (req, res) => {
  const tempFiles = [];
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No media file provided" });
    }

    const { format, resolution, fps, processingId } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const inputPath = path.join(uploadsDir, `temp_${timestamp}_${req.file.originalname}`);
    const outputPath = path.join(uploadsDir, `converted_${timestamp}.${format}`);

    tempFiles.push(inputPath, outputPath);
    await fs.promises.writeFile(inputPath, req.file.buffer);

    const command = ffmpeg(inputPath).toFormat(format).videoCodec("mpeg2video").audioCodec("aac");

    if (resolution) {
      command.size(resolution);
    }
    if (fps) {
      command.fps(fps);
    }

    await new Promise((resolve, reject) => {
      command
        .on("start", (commandLine) => {
          console.log("Started FFmpeg with command:", commandLine);
          emitProgress(processingId, 0);
        })
        .on("progress", (progress) => {
          const percent = progress.percent || 0;
          console.log("Processing:", percent, "% done");
          emitProgress(processingId, percent);
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(err);
        })
        .on("end", () => {
          console.log("FFmpeg processing finished");
          emitProgress(processingId, 100);
          resolve();
        })
        .save(outputPath);
    });

    const outputBuffer = await fs.promises.readFile(outputPath);
    const url = await saveFile(outputBuffer, `converted_${timestamp}.${format}`);

    // Clean up temporary files
    for (const file of tempFiles) {
      try {
        await fs.promises.unlink(file);
      } catch (err) {
        console.error(`Failed to delete temporary file ${file}:`, err);
      }
    }

    res.json({ converted: url });
  } catch (error) {
    console.error("Media convert error:", error);
    // Clean up temporary files on error
    for (const file of tempFiles) {
      try {
        await fs.promises.unlink(file);
      } catch (err) {
        console.error(`Failed to delete temporary file ${file}:`, err);
      }
    }
    res.status(500).json({
      error: "Failed to convert media",
      details: error.message,
    });
  }
});

// Media compress endpoint
router.post("/compress", upload.single("file"), [body("quality").isInt({ min: 1, max: 100 }), body("bitrate").optional().isString()], async (req, res) => {
  const tempFiles = [];
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No media file provided" });
    }

    const { quality, bitrate = "1000k", processingId } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const inputPath = path.join(uploadsDir, `temp_${timestamp}_${req.file.originalname}`);
    const outputPath = path.join(uploadsDir, `compressed_${timestamp}_${req.file.originalname}`);

    tempFiles.push(inputPath, outputPath);
    await fs.promises.writeFile(inputPath, req.file.buffer);

    // Determine video codec based on input format
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let videoCodec;
    let audioCodec;

    switch (fileExt) {
      case ".webm":
        videoCodec = "libvpx-vp9";
        audioCodec = "libopus";
        break;
      case ".mp4":
      case ".mov":
        videoCodec = "libx264";
        audioCodec = "aac";
        break;
      case ".avi":
        videoCodec = "mpeg4";
        audioCodec = "aac";
        break;
      default:
        videoCodec = "libx264";
        audioCodec = "aac";
    }

    // Calculate CRF value based on quality (1-100 to 0-51 scale, inverted because lower CRF means higher quality)
    const crf = Math.round(51 - (quality / 100) * 51);

    const command = ffmpeg(inputPath)
      .videoCodec(videoCodec)
      .audioCodec(audioCodec)
      .videoBitrate(bitrate)
      .outputOptions([`-crf ${crf}`]);

    // Add format-specific options
    if (videoCodec === "libvpx-vp9") {
      command.outputOptions([
        "-b:v 0", // Use constant quality mode
        `-crf ${crf}`,
        "-deadline good", // Faster encoding
        "-cpu-used 2", // Speed up encoding
      ]);
    } else if (videoCodec === "libx264") {
      command.outputOptions([
        "-preset medium", // Balance between speed and compression
        `-crf ${crf}`,
        "-movflags +faststart", // Enable streaming
      ]);
    }

    await new Promise((resolve, reject) => {
      command
        .on("start", (commandLine) => {
          console.log("Started FFmpeg with command:", commandLine);
          emitProgress(processingId, 0);
        })
        .on("progress", (progress) => {
          const percent = progress.percent || 0;
          console.log("Processing:", percent.toFixed(2), "% done");
          emitProgress(processingId, percent);
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(err);
        })
        .on("end", () => {
          console.log("FFmpeg processing finished");
          emitProgress(processingId, 100);
          resolve();
        })
        .save(outputPath);
    });

    const outputBuffer = await fs.promises.readFile(outputPath);
    const url = await saveFile(outputBuffer, `compressed_${timestamp}_${req.file.originalname}`);

    // Clean up temporary files
    for (const file of tempFiles) {
      try {
        await fs.promises.unlink(file);
      } catch (err) {
        console.error(`Failed to delete temporary file ${file}:`, err);
      }
    }

    res.json({ compressed: url });
  } catch (error) {
    console.error("Media compress error:", error);
    // Clean up temporary files on error
    for (const file of tempFiles) {
      try {
        await fs.promises.unlink(file);
      } catch (err) {
        console.error(`Failed to delete temporary file ${file}:`, err);
      }
    }
    res.status(500).json({
      error: "Failed to compress media",
      details: error.message,
    });
  }
});

// Media trim endpoint
router.post(
  "/trim",
  upload.single("file"),
  [
    body("startTime")
      .matches(/^\d{2}:\d{2}:\d{2}$/)
      .withMessage("Invalid start time format"),
    body("duration")
      .matches(/^\d{2}:\d{2}:\d{2}$/)
      .withMessage("Invalid duration format"),
  ],
  async (req, res) => {
    const tempFiles = [];
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No media file provided" });
      }

      const { startTime, duration, processingId } = req.body;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const inputPath = path.join(uploadsDir, `temp_${timestamp}_${req.file.originalname}`);
      const outputPath = path.join(uploadsDir, `trimmed_${timestamp}_${req.file.originalname}`);

      tempFiles.push(inputPath, outputPath);
      await fs.promises.writeFile(inputPath, req.file.buffer);

      const startSeconds = parseTimeToSeconds(startTime);
      const durationSeconds = parseTimeToSeconds(duration);

      // Get video duration using ffprobe
      const getDuration = () => {
        return new Promise((resolve, reject) => {
          ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) reject(err);
            resolve(metadata.format.duration);
          });
        });
      };

      const totalDuration = await getDuration();
      const trimDuration = durationSeconds;
      const progressMultiplier = (trimDuration / totalDuration) * 100;

      await new Promise((resolve, reject) => {
        let lastProgress = 0;

        ffmpeg(inputPath)
          .setStartTime(startSeconds)
          .setDuration(durationSeconds)
          .on("start", (commandLine) => {
            console.log("Started FFmpeg with command:", commandLine);
            emitProgress(processingId, 0);
          })
          .on("progress", (progress) => {
            // Calculate adjusted progress based on the trim duration
            let adjustedProgress = progress.percent || 0;
            if (adjustedProgress > lastProgress) {
              lastProgress = adjustedProgress;
              // Ensure progress doesn't exceed 100%
              const normalizedProgress = Math.min(adjustedProgress * (100 / progressMultiplier), 100);
              console.log("Processing:", normalizedProgress.toFixed(2), "% done");
              emitProgress(processingId, normalizedProgress);
            }
          })
          .on("error", (err) => {
            console.error("FFmpeg error:", err);
            reject(err);
          })
          .on("end", () => {
            console.log("FFmpeg processing finished");
            emitProgress(processingId, 100);
            resolve();
          })
          .save(outputPath);
      });

      const outputBuffer = await fs.promises.readFile(outputPath);
      const url = await saveFile(outputBuffer, `trimmed_${timestamp}_${req.file.originalname}`);

      // Clean up temporary files
      for (const file of tempFiles) {
        try {
          await fs.promises.unlink(file);
        } catch (err) {
          console.error(`Failed to delete temporary file ${file}:`, err);
        }
      }

      res.json({ trimmed: url });
    } catch (error) {
      console.error("Media trim error:", error);
      // Clean up temporary files on error
      for (const file of tempFiles) {
        try {
          await fs.promises.unlink(file);
        } catch (err) {
          console.error(`Failed to delete temporary file ${file}:`, err);
        }
      }
      res.status(500).json({
        error: "Failed to trim media",
        details: error.message,
      });
    }
  }
);

// Media speed change endpoint
router.post("/speed", upload.single("file"), [body("speed").isFloat({ min: 0.25, max: 4.0 }).withMessage("Speed must be between 0.25 and 4.0")], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No media file provided" });
    }

    const { speed } = req.body;
    const inputPath = path.join(uploadsDir, `temp_${Date.now()}_${req.file.originalname}`);
    const outputPath = path.join(uploadsDir, `speed_${Date.now()}_${req.file.originalname}`);

    await fs.promises.writeFile(inputPath, req.file.buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters(`setpts=${1 / speed}*PTS`)
        .audioFilters(`atempo=${speed}`)
        .save(outputPath)
        .on("end", resolve)
        .on("error", reject);
    });

    const outputBuffer = await fs.promises.readFile(outputPath);
    const url = await saveFile(outputBuffer, `speed_${req.file.originalname}`);

    // Clean up temporary files
    await fs.promises.unlink(inputPath);
    await fs.promises.unlink(outputPath);

    res.json({ speedChanged: url });
  } catch (error) {
    console.error("Media speed change error:", error);
    res.status(500).json({ error: "Failed to change media speed" });
  }
});

export default router;
