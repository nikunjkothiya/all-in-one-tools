import express from "express";
import textRoutes from "./text.routes.js";
import imageRoutes from "./image.routes.js";
import pdfRoutes from "./pdf.routes.js";
import fileRoutes from "./file.routes.js";
import mediaRoutes from "./media.routes.js";
import webRoutes from "./web.routes.js";
import dataRoutes from "./data.routes.js";
import privacyRoutes from "./privacy.routes.js";
import loaderRoutes from "./loader.routes.js";
import developerRoutes from "./developer.routes.js";
import adminRoutes from "./admin.routes.js";
import publicRoutes from "./public.routes.js";

const router = express.Router();

// Register routes
router.use("/text", textRoutes);
router.use("/image", imageRoutes);
router.use("/pdf", pdfRoutes);
router.use("/file", fileRoutes);
router.use("/media", mediaRoutes);
router.use("/web", webRoutes);
router.use("/data", dataRoutes);
router.use("/privacy", privacyRoutes);
router.use("/loader", loaderRoutes);
router.use("/developer", developerRoutes);
router.use("/admin", adminRoutes);
router.use("/public", publicRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
