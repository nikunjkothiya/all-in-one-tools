import "./polyfills/node18.js";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import config from "./config/env.js";
import { initializeDatabase } from "./config/db.js";
import { ensureUploadsDir, uploadsPath } from "./config/paths.js";
import errorHandler from "./middleware/errorHandler.js";

// Import routes
import routes from "./routes/index.js";

// Create Express app
const app = express();

// Initialize the local database for test and API usage
initializeDatabase();
ensureUploadsDir();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: {
    policy: "cross-origin",
  },
})); // Security headers
app.use(cors({
  origin: config.corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
})); // Enable CORS
app.use(compression()); // Compress responses
app.use(rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000,
  max: config.rateLimitMax,
  message: "Too many requests from this IP, please try again later",
}));
app.use(morgan("dev")); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from uploads directory
app.use(`/${config.uploadDir}`, express.static(uploadsPath));

// Routes
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
