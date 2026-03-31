import express from "express";
import multer from "multer";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { body } from "express-validator";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v4 as uuidv4 } from "uuid";
import { encrypt } from "node-qpdf2";
import { exec } from "child_process";
import { promisify } from "util";
import config from "../config/env.js";
import { ensureUploadsDir, uploadsPath } from "../config/paths.js";
import validateRequest from "../middleware/validateRequest.js";
import { buildPublicUrl } from "../utils/requestUrl.js";

// Promisify exec for async/await usage
const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get QPDF path from config
const QPDF_PATH = config.qpdfPath;

// Verify QPDF installation on startup
try {
  if (!fs.existsSync(QPDF_PATH)) {
    console.error(`WARNING: QPDF binary not found at ${QPDF_PATH}`);
    console.error("Please install QPDF and set QPDF_PATH in .env file");
  } else {
    console.log(`QPDF found at: ${QPDF_PATH}`);
  }
} catch (error) {
  console.error("Error checking QPDF installation:", error);
}

const router = express.Router();
ensureUploadsDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    cb(null, `${timestamp}-${uniqueId}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
    fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: config.maxPdfSize,
  },
});

// Helper function to get file URL
const getFileUrl = (filename) => {
    return `/${config.uploadDir}/${filename}`;
};

// Helper function to create output filename
const createOutputFilename = (operation) => {
  const timestamp = Date.now();
  const uniqueId = uuidv4();
  return `${timestamp}-${uniqueId}-${operation}.pdf`;
};

// Error handler for async routes
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(`Error in ${fn.name || "unknown function"}:`, error);
    res.status(500).json({
      error: `Failed to ${fn.name || "process"} PDF`,
      details: error.message,
    });
  });

// Merge PDFs endpoint with enhanced features
router.post(
  "/merge",
  upload.array("files"),
  asyncHandler(async (req, res) => {
        if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: "Please upload at least 2 PDF files" });
    }

    const { customOrder, outputFilename: customOutputName } = req.body;
    const orderArray = customOrder ? JSON.parse(customOrder) : null;

    // Validate and process files in the specified order
    const filesToProcess = orderArray ? orderArray.map((index) => req.files[index]) : req.files;

    // Create a new PDF document
        const mergedPdf = await PDFDocument.create();
    const pdfDetails = [];

    // Merge all PDFs and collect details
    for (const file of filesToProcess) {
      const pdfBytes = await fs.promises.readFile(file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      // Get details of first page for preview
      const firstPage = pdf.getPage(0);
      const { width, height } = firstPage.getSize();

      // Copy all pages
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));

      pdfDetails.push({
        name: file.originalname,
        pageCount: pdf.getPageCount(),
        pageSize: { width, height },
      });
    }

    // Generate output filename
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const outputFilename = customOutputName ? `${timestamp}-${uniqueId}-${customOutputName}.pdf` : `${timestamp}-${uniqueId}-merged-document.pdf`;

    const outputPath = path.join(uploadsPath, outputFilename);

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    await fs.promises.writeFile(outputPath, mergedPdfBytes);

    // Clean up input files
    await Promise.all(req.files.map((file) => fs.promises.unlink(file.path)));

    // Get total page count
    const totalPages = pdfDetails.reduce((sum, pdf) => sum + pdf.pageCount, 0);

    res.json({
      url: getFileUrl(outputFilename),
      filename: outputFilename,
      totalPages,
      fileDetails: pdfDetails,
      message: "PDFs merged successfully",
    });
  })
);

// Split PDF endpoint - using pdf-lib with enhanced features
router.post(
  "/split",
  upload.single("file"),
  asyncHandler(async (req, res) => {
            if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { pages, customNames } = req.body;
    if (!pages) {
      return res.status(400).json({ error: "Please specify page ranges" });
    }

    // Load the PDF first to get total pages
    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    // Parse and validate page ranges
    const pageRanges = pages.split(",").map((range) => {
      const [start, end] = range.trim().split("-").map(Number);
      return {
        start: Math.max(1, start || 1),
        end: Math.min(end || start || totalPages, totalPages),
      };
    });

    // Validate ranges don't overlap
    pageRanges.sort((a, b) => a.start - b.start);
    for (let i = 1; i < pageRanges.length; i++) {
      if (pageRanges[i].start <= pageRanges[i - 1].end) {
        return res.status(400).json({
          error: "Page ranges cannot overlap",
          details: `Range ${pageRanges[i - 1].start}-${pageRanges[i - 1].end} overlaps with ${pageRanges[i].start}-${pageRanges[i].end}`,
        });
      }
    }

    const results = [];
    const customNamesList = customNames ? JSON.parse(customNames) : [];

    for (let i = 0; i < pageRanges.length; i++) {
      const range = pageRanges[i];
      const newPdfDoc = await PDFDocument.create();
      const pageIndices = Array.from({ length: range.end - range.start + 1 }, (_, idx) => range.start - 1 + idx);

      // Copy pages
      const pages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
      pages.forEach((page) => newPdfDoc.addPage(page));

      // Generate output filename
      const timestamp = Date.now();
      const uniqueId = uuidv4();
      const customName = customNamesList[i];
      const originalName = req.file.originalname.replace(".pdf", "");

      const outputFilename = customName ? `${timestamp}-${uniqueId}-${customName}-pages-${range.start}-${range.end}.pdf` : `${timestamp}-${uniqueId}-${originalName}-pages-${range.start}-${range.end}.pdf`;

      const outputPath = path.join(uploadsPath, outputFilename);

      // Save the split PDF
      const newPdfBytes = await newPdfDoc.save();
      await fs.promises.writeFile(outputPath, newPdfBytes);

      // Get page sizes for preview
      const pageSize = pdfDoc.getPage(range.start - 1).getSize();

      results.push({
        range: `${range.start}-${range.end}`,
        url: getFileUrl(outputFilename),
        filename: outputFilename,
        pageCount: range.end - range.start + 1,
        pageSize: {
          width: pageSize.width,
          height: pageSize.height,
        },
      });
    }

    // Clean up input file
    await fs.promises.unlink(req.file.path);

    res.json({
      results,
      totalPages,
      originalName: req.file.originalname,
    });
  })
);

// Add text to PDF endpoint - pdf-lib is more suitable for this
router.post(
  "/add-text",
  upload.single("file"),
  [body("text").notEmpty().withMessage("Text is required"), body("page").isInt({ min: 1 }).withMessage("Invalid page number"), body("x").isFloat().withMessage("Invalid x coordinate"), body("y").isFloat().withMessage("Invalid y coordinate"), body("fontSize").optional().isInt({ min: 1, max: 72 })],
  validateRequest,
  asyncHandler(async (req, res) => {
            if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
            }

            const { text, page, x, y, fontSize = 12 } = req.body;
    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdf = await PDFDocument.load(pdfBytes);

    // Check if page number is valid
    const pageIndex = page - 1;
    if (pageIndex < 0 || pageIndex >= pdf.getPageCount()) {
      return res.status(400).json({ error: `Invalid page number: ${page}. Document has ${pdf.getPageCount()} pages.` });
    }

    const pdfPage = pdf.getPage(pageIndex);

    // Add text with specified parameters
    pdfPage.drawText(text, {
      x: parseFloat(x),
      y: parseFloat(y),
      size: parseInt(fontSize),
      color: rgb(0, 0, 0),
    });

    const modifiedPdfBytes = await pdf.save();
    const outputFilename = createOutputFilename("added-text");
    const outputPath = path.join(uploadsPath, outputFilename);
    await fs.promises.writeFile(outputPath, modifiedPdfBytes);

    // Clean up input file
    await fs.promises.unlink(req.file.path);

    res.json({
      url: getFileUrl(outputFilename),
      filename: outputFilename,
      message: "Text added to PDF successfully",
    });
  })
);

// Add signature to PDF endpoint - pdf-lib is more suitable for this
router.post(
  "/add-signature",
  upload.single("file"),
  [body("signature").notEmpty().withMessage("Signature text is required"), body("page").isInt({ min: 1 }).withMessage("Invalid page number"), body("x").isFloat().withMessage("Invalid x coordinate"), body("y").isFloat().withMessage("Invalid y coordinate")],
  validateRequest,
  asyncHandler(async (req, res) => {
            if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
            }

            const { signature, page, x, y } = req.body;
    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdf = await PDFDocument.load(pdfBytes);

    // Check if page number is valid
    const pageIndex = page - 1;
    if (pageIndex < 0 || pageIndex >= pdf.getPageCount()) {
      return res.status(400).json({ error: `Invalid page number: ${page}. Document has ${pdf.getPageCount()} pages.` });
    }

    const pdfPage = pdf.getPage(pageIndex);

    // Embed a standard font for the signature
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    // Draw the signature with embedded font
    pdfPage.drawText(signature, {
      x: parseFloat(x),
      y: parseFloat(y),
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    const modifiedPdfBytes = await pdf.save();
    const outputFilename = createOutputFilename("added-signature");
    const outputPath = path.join(uploadsPath, outputFilename);
    await fs.promises.writeFile(outputPath, modifiedPdfBytes);

    // Clean up input file
    await fs.promises.unlink(req.file.path);

    res.json({
      url: getFileUrl(outputFilename),
      filename: outputFilename,
      message: "Signature added to PDF successfully",
    });
  })
);

// Edit PDF endpoint with enhanced features
router.post(
  "/edit",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a PDF file" });
    }

    const { operations, outputFilename: customOutputName } = req.body;

    if (!operations) {
      return res.status(400).json({ error: "No edit operations specified" });
    }

    const operationsArray = JSON.parse(operations);

    // Load the PDF document
    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const originalPageCount = pdfDoc.getPageCount();

    // Create a new document for the edited PDF
    const editedPdf = await PDFDocument.create();

    // Track page modifications
    const modifications = [];

    // Process each operation in sequence
    for (const op of operationsArray) {
      switch (op.type) {
        case "rotate":
          const rotatedPage = pdfDoc.getPage(op.pageIndex);
          rotatedPage.setRotation(degrees(op.degrees));
          modifications.push({
            type: "rotate",
            page: op.pageIndex + 1,
            degrees: op.degrees,
          });
          break;

        case "delete":
          // We'll handle deletions by not copying these pages
          modifications.push({
            type: "delete",
            page: op.pageIndex + 1,
          });
          break;

        case "reorder":
          // Handled in final copy phase
          modifications.push({
            type: "reorder",
            from: op.fromIndex + 1,
            to: op.toIndex + 1,
          });
          break;

        default:
          console.warn(`Unknown operation type: ${op.type}`);
      }
    }

    // Get the final page order after all operations
    const finalPageOrder = operationsArray
      .filter((op) => op.type === "reorder")
      .reduce(
        (order, op) => {
          const item = order.splice(op.fromIndex, 1)[0];
          order.splice(op.toIndex, 0, item);
          return order;
        },
        [...Array(originalPageCount).keys()]
      );

    // Filter out deleted pages
    const deletedPages = new Set(operationsArray.filter((op) => op.type === "delete").map((op) => op.pageIndex));

    // Copy pages in the final order, excluding deleted pages
    for (const pageIndex of finalPageOrder) {
      if (!deletedPages.has(pageIndex)) {
        const [copiedPage] = await editedPdf.copyPages(pdfDoc, [pageIndex]);
        editedPdf.addPage(copiedPage);
      }
    }

    // Generate output filename
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const outputFilename = customOutputName ? `${timestamp}-${uniqueId}-${customOutputName}.pdf` : `${timestamp}-${uniqueId}-edited-document.pdf`;

    const outputPath = path.join(uploadsPath, outputFilename);

    // Save the edited PDF
    const editedPdfBytes = await editedPdf.save();
    await fs.promises.writeFile(outputPath, editedPdfBytes);

    // Clean up input file
    await fs.promises.unlink(req.file.path);

    res.json({
      url: getFileUrl(outputFilename),
      filename: outputFilename,
      originalPageCount,
      finalPageCount: editedPdf.getPageCount(),
      modifications,
      message: "PDF edited successfully",
    });
  })
);

router.post(
  "/metadata",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const {
      title,
      author,
      subject,
      keywords,
      creator,
      producer,
      language,
      outputFilename: customOutputName,
    } = req.body;

    const nextMetadata = {
      title: pdfDoc.getTitle() || "",
      author: pdfDoc.getAuthor() || "",
      subject: pdfDoc.getSubject() || "",
      keywords: (pdfDoc.getKeywords() || []).join(", "),
      creator: pdfDoc.getCreator() || "",
      producer: pdfDoc.getProducer() || "",
      language: typeof pdfDoc.getLanguage === "function" ? pdfDoc.getLanguage() || "" : "",
      creationDate: pdfDoc.getCreationDate()?.toISOString?.() || null,
      modificationDate: pdfDoc.getModificationDate()?.toISOString?.() || null,
      pageCount: pdfDoc.getPageCount(),
    };

    const hasUpdates = [title, author, subject, keywords, creator, producer, language].some((value) => typeof value === "string");

    if (!hasUpdates) {
      await fs.promises.unlink(req.file.path);
      return res.json({ metadata: nextMetadata });
    }

    if (typeof title === "string") {
      pdfDoc.setTitle(title);
      nextMetadata.title = title;
    }
    if (typeof author === "string") {
      pdfDoc.setAuthor(author);
      nextMetadata.author = author;
    }
    if (typeof subject === "string") {
      pdfDoc.setSubject(subject);
      nextMetadata.subject = subject;
    }
    if (typeof keywords === "string") {
      const keywordList = keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);
      pdfDoc.setKeywords(keywordList);
      nextMetadata.keywords = keywordList.join(", ");
    }
    if (typeof creator === "string") {
      pdfDoc.setCreator(creator);
      nextMetadata.creator = creator;
    }
    if (typeof producer === "string") {
      pdfDoc.setProducer(producer);
      nextMetadata.producer = producer;
    }
    if (typeof language === "string" && typeof pdfDoc.setLanguage === "function") {
      pdfDoc.setLanguage(language);
      nextMetadata.language = language;
    }

    pdfDoc.setModificationDate(new Date());
    nextMetadata.modificationDate = pdfDoc.getModificationDate()?.toISOString?.() || new Date().toISOString();

    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const outputFilename = customOutputName
      ? `${timestamp}-${uniqueId}-${customOutputName}.pdf`
      : `${timestamp}-${uniqueId}-metadata-updated.pdf`;
    const outputPath = path.join(uploadsPath, outputFilename);

    await fs.promises.writeFile(outputPath, await pdfDoc.save());
    await fs.promises.unlink(req.file.path);

    res.json({
      metadata: nextMetadata,
      url: getFileUrl(outputFilename),
      filename: outputFilename,
      message: "PDF metadata updated successfully",
    });
  })
);

// Protect/Unprotect PDF endpoint
router.post(
  "/protect",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { action, password, currentPassword } = req.body;

    // Check QPDF installation
    if (!fs.existsSync(QPDF_PATH)) {
      return res.status(500).json({
        error: "QPDF not found. Please ensure QPDF is installed correctly.",
        details: "QPDF binary not found at configured path",
        path: QPDF_PATH,
      });
    }

    // Create output filename - preserve original name for password removal
    const timestamp = Date.now();
    const uniqueId = uuidv4();

    // Clean up the original filename
    let cleanFileName = req.file.originalname
      .toLowerCase()
      // Remove any existing timestamps
      .replace(/\d{13}-[\w-]+-/, "")
      // Remove common suffixes we might have added
      .replace(/-protected|-unlocked|-without-password/g, "")
      // Remove .pdf extension
      .replace(".pdf", "");

    const outputFilename = action === "remove" ? `${timestamp}-${uniqueId}-${cleanFileName}-without-password.pdf` : `${timestamp}-${uniqueId}-${cleanFileName}-protected.pdf`;

    const outputPath = path.join(uploadsPath, outputFilename);

    try {
      if (action === "remove") {
        // Remove password from PDF using qpdf command directly
        if (!currentPassword) {
          throw new Error("Current password is required to remove protection");
        }

        // Safer command construction to prevent injection
        const safePassword = currentPassword.replace(/[ "$`\\]/g, '\\$&');
        const qpdfCommand = `"${QPDF_PATH}" --password="${safePassword}" --decrypt "${req.file.path}" "${outputPath}"`;

        try {
          await execAsync(qpdfCommand);
        } catch (cmdError) {
          if (cmdError.message.toLowerCase().includes("password") || cmdError.code === 2) {
            return res.status(400).json({ error: "Incorrect password provided or invalid PDF" });
          }
          throw new Error(`Failed to remove password: ${cmdError.message}`);
        }
      } else {
        // Add password protection
        if (!password) {
          throw new Error("Password is required to protect PDF");
        }

        await encrypt({
          input: req.file.path,
          output: outputPath,
          password: password,
          keyLength: 256,
          binary: QPDF_PATH,
          useAes: true,
        });
      }

      // Verify output file exists
      if (!fs.existsSync(outputPath)) {
        throw new Error("Failed to process PDF");
      }

      // Clean up input file
      await fs.promises.unlink(req.file.path);

      res.json({
        url: buildPublicUrl(req, getFileUrl(outputFilename)),
        filename: outputFilename,
        message: action === "remove" ? "Password removed successfully" : "PDF protected successfully",
      });
        } catch (error) {
      console.error("PDF Processing Error:", error);

      // Clean up any partial output
      if (fs.existsSync(outputPath)) {
        await fs.promises.unlink(outputPath).catch(console.error);
      }

      if (error.message.includes("password")) {
        return res.status(400).json({ error: "Incorrect password provided" });
      }

      res.status(500).json({
        error: "Failed to process PDF",
        details: error.message,
      });
    }
  })
);

export default router; 
