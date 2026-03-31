import "./polyfills/node18.js";
import fs from "fs";
import app from "./app.js";
import config from "./config/env.js";
import { ensureUploadsDir, uploadsPath } from "./config/paths.js";
import { initializeSocket } from "./socket.js";

ensureUploadsDir();
const { server } = initializeSocket(app);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

const CLEANUP_INTERVAL = 60 * 60 * 1000;
const MAX_AGE = 2 * 60 * 60 * 1000;

const cleanupUploads = async () => {
  try {
    const files = await fs.promises.readdir(uploadsPath);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(uploadsPath, file);
      const stats = await fs.promises.stat(filePath);

      if (now - stats.mtimeMs > MAX_AGE) {
        await fs.promises.unlink(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error("Error during file cleanup:", error);
  }
};

const cleanupTimer = setInterval(() => {
  void cleanupUploads();
}, CLEANUP_INTERVAL);

cleanupTimer.unref?.();
