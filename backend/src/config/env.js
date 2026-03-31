import crypto from "crypto";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const readString = (name, fallback = "") => {
  const value = process.env[name];

  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();
  return trimmedValue || fallback;
};

const readInteger = (name, fallback) => {
  const value = process.env[name];
  const parsedValue = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const readOriginList = (name, fallback) => {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const readRequiredInProduction = (name, fallback = "") => {
  const value = readString(name, "");
  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error(`${name} environment variable is required in production`);
  }

  return fallback;
};

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

/**
 * Centralized environment configuration
 * All hardcoded values (ports, URLs, size limits, timeouts) are moved here.
 */
export const config = {
  // Server
  port: readInteger("PORT", 5000),
  nodeEnv,
  baseUrl: trimTrailingSlash(readString("BASE_URL", "")),
  corsOrigin: readOriginList("CORS_ORIGIN", ["http://localhost:3000", "http://127.0.0.1:3000"]),
  
  // Local database
  sqlitePath: readString("SQLITE_PATH", "data/all-tools.sqlite"),
  
  // Storage
  uploadDir: readString("UPLOAD_DIR", "uploads"),
  
  // Size Limits (in bytes)
  maxPdfSize: readInteger("MAX_PDF_SIZE", 50 * 1024 * 1024),
  maxMediaSize: readInteger("MAX_MEDIA_SIZE", 100 * 1024 * 1024),
  maxFileSize: readInteger("MAX_FILE_SIZE", 10 * 1024 * 1024),
  maxImageSize: readInteger("MAX_IMAGE_SIZE", 5 * 1024 * 1024),
  
  // Binaries
  qpdfPath: readString("QPDF_PATH", "/usr/bin/qpdf"),
  
  // Security
  jwtSecret: readRequiredInProduction("JWT_SECRET", crypto.randomBytes(32).toString("hex")),
  jwtExpiresIn: readString("JWT_EXPIRES_IN", "24h"),
  adminSeedEmail: readString("ADMIN_SEED_EMAIL", ""),
  adminSeedPassword: readString("ADMIN_SEED_PASSWORD", ""),
  adminSeedName: readString("ADMIN_SEED_NAME", "Platform Admin"),
  
  // Web Tools
  webTimeout: readInteger("WEB_TIMEOUT", 15000),
  tinyUrlApiBase: trimTrailingSlash(readString("TINYURL_API_BASE", "https://tinyurl.com/api-create.php")),
  
  // Rate Limiting
  rateLimitWindow: readInteger("RATE_LIMIT_WINDOW", 15),
  rateLimitMax: readInteger("RATE_LIMIT_MAX", 100),
};

export default config;
