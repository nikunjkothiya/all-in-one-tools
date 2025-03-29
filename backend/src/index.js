import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import textRoutes from "./routes/text.routes.js";
import imageRoutes from "./routes/image.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import developerRoutes from "./routes/developer.routes.js";
import fileRoutes from "./routes/file.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import webRoutes from "./routes/web.routes.js";
import dataRoutes from "./routes/data.routes.js";
import privacyRoutes from "./routes/privacy.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
// connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files from uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount routes
app.use("/api/text", textRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/developer", developerRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/web", webRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/privacy", privacyRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found on this server",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
