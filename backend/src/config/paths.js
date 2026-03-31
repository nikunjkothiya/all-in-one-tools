import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./env.js";

export const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const resolveBackendPath = (...segments) => path.join(backendRoot, ...segments);

export const uploadsPath = path.isAbsolute(config.uploadDir) ? config.uploadDir : resolveBackendPath(config.uploadDir);

export const ensureDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  return directoryPath;
};

export const ensureUploadsDir = () => ensureDirectory(uploadsPath);
