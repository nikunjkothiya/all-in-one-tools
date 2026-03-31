import express from "express";
import multer from "multer";
import { body } from "express-validator";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import ffmpeg from "fluent-ffmpeg";
import { io } from "../socket.js";
import config from "../config/env.js";
import { ensureUploadsDir } from "../config/paths.js";
import validateRequest from "../middleware/validateRequest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxMediaSize,
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
const uploadsDir = ensureUploadsDir();

// Helper function to save file and return URL
const saveFile = async (buffer, filename) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const uniqueFilename = `${timestamp}_${filename}`;
  const filepath = path.join(uploadsDir, uniqueFilename);
  await fs.promises.writeFile(filepath, buffer);
  // Return absolute URL path
  return `/${config.uploadDir}/${uniqueFilename}`;
};

// Helper function to parse time string (HH:MM:SS) to seconds
const parseTimeToSeconds = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const AUDIO_OUTPUT_FORMATS = new Set(["mp3", "aac", "wav"]);

const probeMediaStreamInfo = (filePath) =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        reject(error);
        return;
      }

      const streams = metadata.streams || [];
      resolve({
        hasVideo: streams.some((stream) => stream.codec_type === "video"),
        hasAudio: streams.some((stream) => stream.codec_type === "audio"),
      });
    });
  });

const getAudioCodecForFormat = (format) => {
  switch (format) {
    case "mp3":
      return "libmp3lame";
    case "aac":
      return "aac";
    case "wav":
    default:
      return "pcm_s16le";
  }
};

const getVideoCodecConfig = (format) => {
  switch (format) {
    case "webm":
      return { videoCodec: "libvpx-vp9", audioCodec: "libopus" };
    case "avi":
      return { videoCodec: "mpeg4", audioCodec: "aac" };
    case "mov":
    case "mkv":
    case "mp4":
    default:
      return { videoCodec: "libx264", audioCodec: "aac" };
  }
};

const getCompressedAudioTarget = (originalName) => {
  const extension = path.extname(originalName).toLowerCase();

  switch (extension) {
    case ".mp3":
      return { format: "mp3", codec: "libmp3lame", extension: ".mp3", bitrate: "128k" };
    case ".aac":
      return { format: "adts", codec: "aac", extension: ".aac", bitrate: "128k" };
    case ".wav":
      return { format: "wav", codec: "adpcm_ima_wav", extension: ".wav", bitrate: null };
    default:
      return { format: "mp3", codec: "libmp3lame", extension: ".mp3", bitrate: "128k" };
  }
};

const buildAtempoFilter = (speed) => {
  let remainingSpeed = Number(speed);
  const filters = [];

  while (remainingSpeed < 0.5) {
    filters.push("atempo=0.5");
    remainingSpeed /= 0.5;
  }

  while (remainingSpeed > 2) {
    filters.push("atempo=2.0");
    remainingSpeed /= 2;
  }

  filters.push(`atempo=${remainingSpeed.toFixed(3)}`);
  return filters.join(",");
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
router.post("/convert", upload.single("file"), [body("format").isIn(["mp4", "webm", "mov", "avi", "mkv", "gif", "mp3", "aac", "wav"]).withMessage("Invalid format"), body("resolution").optional().isString(), body("fps").optional().isInt({ min: 15, max: 60 })], validateRequest, async (req, res) => {
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
    const { hasVideo, hasAudio } = await probeMediaStreamInfo(inputPath);
    const command = ffmpeg(inputPath).toFormat(format);
    const isAudioOutput = AUDIO_OUTPUT_FORMATS.has(format);

    if (isAudioOutput) {
      if (!hasAudio) {
        await fs.promises.unlink(inputPath).catch(() => {});
        return res.status(400).json({ error: "This file does not contain an audio stream to convert." });
      }

      command.noVideo().audioCodec(getAudioCodecForFormat(format));
    } else if (format === "gif") {
      if (!hasVideo) {
        await fs.promises.unlink(inputPath).catch(() => {});
        return res.status(400).json({ error: "GIF conversion requires a video input file." });
      }

      command.noAudio();
      if (resolution) {
        command.size(resolution);
      }
      if (fps) {
        command.fps(fps);
      }
      command.outputOptions(["-loop 0"]);
    } else {
      if (!hasVideo) {
        await fs.promises.unlink(inputPath).catch(() => {});
        return res.status(400).json({ error: "Audio-only files can only be converted to audio formats." });
      }

      const { videoCodec, audioCodec } = getVideoCodecConfig(format);
      command.videoCodec(videoCodec);
      if (hasAudio) {
        command.audioCodec(audioCodec);
      } else {
        command.noAudio();
      }

      if (resolution) {
        command.size(resolution);
      }
      if (fps) {
        command.fps(fps);
      }
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
router.post("/compress", upload.single("file"), [body("quality").isInt({ min: 1, max: 100 }), body("bitrate").optional().isString()], validateRequest, async (req, res) => {
  const tempFiles = [];
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No media file provided" });
    }

    const { quality, bitrate, processingId } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const inputPath = path.join(uploadsDir, `temp_${timestamp}_${req.file.originalname}`);
    tempFiles.push(inputPath);
    await fs.promises.writeFile(inputPath, req.file.buffer);
    const { hasVideo, hasAudio } = await probeMediaStreamInfo(inputPath);

    let outputFilename;
    let outputPath;
    let command;

    if (!hasVideo && hasAudio) {
      const audioTarget = getCompressedAudioTarget(req.file.originalname);
      outputFilename = `compressed_${timestamp}${audioTarget.extension}`;
      outputPath = path.join(uploadsDir, outputFilename);
      tempFiles.push(outputPath);

      command = ffmpeg(inputPath).toFormat(audioTarget.format).audioCodec(audioTarget.codec);
      if (audioTarget.bitrate) {
        command.audioBitrate(bitrate || audioTarget.bitrate);
      }
      if (audioTarget.format === "wav") {
        command.audioChannels(1).audioFrequency(22050);
      }
    } else {
      outputFilename = `compressed_${timestamp}_${req.file.originalname}`;
      outputPath = path.join(uploadsDir, outputFilename);
      tempFiles.push(outputPath);

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

      const effectiveBitrate = bitrate || "1000k";
      const crf = Math.round(51 - (quality / 100) * 51);

      command = ffmpeg(inputPath)
        .videoCodec(videoCodec)
        .audioCodec(audioCodec)
        .videoBitrate(effectiveBitrate)
        .outputOptions([`-crf ${crf}`]);

      if (videoCodec === "libvpx-vp9") {
        command.outputOptions(["-b:v 0", `-crf ${crf}`, "-deadline good", "-cpu-used 2"]);
      } else if (videoCodec === "libx264") {
        command.outputOptions(["-preset medium", `-crf ${crf}`, "-movflags +faststart"]);
      }
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
    const url = await saveFile(outputBuffer, outputFilename);

    // Clean up temporary files
    for (const file of tempFiles) {
      try {
        await fs.promises.unlink(file);
      } catch (err) {
        console.error(`Failed to delete temporary file ${file}:`, err);
      }
    }

    res.json({ compressed: url, filename: outputFilename });
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
router.post("/trim", upload.single("file"), [body("startTime").notEmpty().withMessage("Start time is required"), body("endTime").notEmpty().withMessage("End time is required"), body("processingId").notEmpty().withMessage("Processing ID is required")], validateRequest, async (req, res) => {
  const tempFiles = [];

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No media file provided" });
    }

    const { startTime, endTime, processingId } = req.body;
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const inputPath = path.join(uploadsDir, `temp_${timestamp}_${req.file.originalname}`);
    const outputPath = path.join(uploadsDir, `trimmed_${timestamp}_${req.file.originalname}`);

    tempFiles.push(inputPath, outputPath);

    await fs.promises.writeFile(inputPath, req.file.buffer);

    // Emit initial progress
    emitProgress(processingId, 0);

    // Calculate duration for progress tracking
    const totalDuration = Math.max(parseTimeToSeconds(endTime) - parseTimeToSeconds(startTime), 1);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(totalDuration)
        .on("progress", (progress) => {
          if (progress.percent) {
            const percent = Math.min(progress.percent, 100);
            emitProgress(processingId, percent);
          } else if (progress.timemark) {
            // Calculate progress based on timemark if percent is not available
            const timeInSeconds = parseTimeToSeconds(progress.timemark);
            const percent = Math.min((timeInSeconds / totalDuration) * 100, 100);
            emitProgress(processingId, percent);
          }
        })
        .on("end", () => {
          console.log("Trimming finished");
          emitProgress(processingId, 100);
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(err);
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
});

// Media speed change endpoint
router.post("/speed", upload.single("file"), [body("speed").isFloat({ min: 0.25, max: 4.0 }).withMessage("Speed must be between 0.25 and 4.0"), body("processingId").notEmpty().withMessage("Processing ID is required")], validateRequest, async (req, res) => {
  const tempFiles = [];

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No media file provided" });
    }

    const { speed, processingId } = req.body;
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const inputPath = path.join(uploadsDir, `temp_${timestamp}_${req.file.originalname}`);
    const outputPath = path.join(uploadsDir, `speed_${timestamp}_${req.file.originalname}`);

    tempFiles.push(inputPath, outputPath);

    await fs.promises.writeFile(inputPath, req.file.buffer);
    const { hasVideo, hasAudio } = await probeMediaStreamInfo(inputPath);
    if (!hasVideo && !hasAudio) {
      await fs.promises.unlink(inputPath).catch(() => {});
      return res.status(400).json({ error: "No playable audio or video stream found in the selected file." });
    }

    // Emit initial progress
    emitProgress(processingId, 0);

    // First, get the duration of the input file for accurate progress tracking
    const duration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration || 0);
      });
    });

    await new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath);
      if (hasVideo) {
        command.videoFilters(`setpts=${(1 / speed).toFixed(5)}*PTS`);
      } else {
        command.noVideo();
      }

      if (hasAudio) {
        command.audioFilters(buildAtempoFilter(speed));
      } else {
        command.noAudio();
      }

      command
        .on("progress", (progress) => {
          if (progress.percent) {
            const percent = Math.min(progress.percent, 100);
            emitProgress(processingId, percent);
          } else if (progress.timemark && duration) {
            // Calculate progress based on timemark if percent is not available
            const timeInSeconds = parseTimeToSeconds(progress.timemark);
            const percent = Math.min((timeInSeconds / duration) * 100, 100);
            emitProgress(processingId, percent);
          }
        })
        .on("end", () => {
          console.log("Speed change processing finished");
          emitProgress(processingId, 100);
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(err);
        })
        .save(outputPath);
    });

    const outputBuffer = await fs.promises.readFile(outputPath);
    const url = await saveFile(outputBuffer, `speed_${timestamp}_${req.file.originalname}`);

    // Clean up temporary files
    for (const file of tempFiles) {
      try {
        await fs.promises.unlink(file);
      } catch (err) {
        console.error(`Failed to delete temporary file ${file}:`, err);
      }
    }

    res.json({ speedChanged: url });
  } catch (error) {
    console.error("Media speed change error:", error);

    // Clean up temporary files on error
    for (const file of tempFiles) {
      try {
        await fs.promises.unlink(file);
      } catch (err) {
        console.error(`Failed to delete temporary file ${file}:`, err);
      }
    }

    res.status(500).json({
      error: "Failed to change media speed",
      details: error.message,
    });
  }
});

export default router;
