import express from "express";
import multer from "multer";
import { PDFDocument } from "pdf-lib";
import { body } from "express-validator";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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
});

// Helper function to get file URL
const getFileUrl = (filename) => {
  return `/uploads/${filename}`;
};

// Helper function to create a test PDF
const createTestPdf = async () => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText("Test PDF", {
    x: 50,
    y: 750,
    size: 12,
  });
  return await pdfDoc.save();
};

// Merge PDFs endpoint
router.post("/merge", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: "Please upload at least 2 PDF files" });
    }

    const mergedPdf = await PDFDocument.create();
    const files = req.files;

    for (const file of files) {
      const pdfBytes = await fs.promises.readFile(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const outputFilename = `${timestamp}-${uniqueId}-merged.pdf`;
    const outputPath = path.join(__dirname, "../../uploads", outputFilename);
    await fs.promises.writeFile(outputPath, mergedPdfBytes);

    // Clean up input files
    await Promise.all(files.map((file) => fs.promises.unlink(file.path)));

    res.json({ url: getFileUrl(outputFilename) });
  } catch (error) {
    console.error("Error merging PDFs:", error);
    res.status(500).json({ error: "Failed to merge PDFs" });
  }
});

// Split PDF endpoint
router.post("/split", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { pages } = req.body;
    const inputPath = req.file.path;
    const pdfBytes = await fs.promises.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();

    // Parse page ranges
    const pageRanges = pages.split(",").map((range) => {
      const [start, end] = range.split("-").map(Number);
      return { start, end: end || start };
    });

    // Create new PDFs for each range
    const results = await Promise.all(
      pageRanges.map(async (range) => {
        const newPdfDoc = await PDFDocument.create();
        const pages = await newPdfDoc.copyPages(
          pdfDoc,
          Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start - 1 + i)
        );
        pages.forEach((page) => newPdfDoc.addPage(page));
        const newPdfBytes = await newPdfDoc.save();
        const timestamp = Date.now();
        const uniqueId = uuidv4();
        const outputFilename = `${timestamp}-${uniqueId}-split-${range.start}-${range.end}.pdf`;
        const outputPath = path.join(__dirname, "../../uploads", outputFilename);
        await fs.promises.writeFile(outputPath, newPdfBytes);
        return {
          range: `${range.start}-${range.end}`,
          url: getFileUrl(outputFilename),
        };
      })
    );

    // Clean up input file
    await fs.promises.unlink(inputPath);

    res.json({ results });
  } catch (error) {
    console.error("Error splitting PDF:", error);
    res.status(500).json({ error: "Failed to split PDF" });
  }
});

// Add text to PDF endpoint
router.post("/add-text", upload.single("file"), [body("text").notEmpty().withMessage("Text is required"), body("page").isInt({ min: 1 }).withMessage("Invalid page number"), body("x").isFloat().withMessage("Invalid x coordinate"), body("y").isFloat().withMessage("Invalid y coordinate"), body("fontSize").optional().isInt({ min: 1, max: 72 })], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    const { text, page, x, y, fontSize = 12 } = req.body;
    const pdf = await PDFDocument.load(req.file.path);
    const pdfPage = pdf.getPage(page - 1);

    pdfPage.drawText(text, {
      x,
      y,
      size: fontSize,
    });

    const pdfBytes = await pdf.save();
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const outputFilename = `${timestamp}-${uniqueId}-added-text.pdf`;
    const outputPath = path.join(__dirname, "../../uploads", outputFilename);
    await fs.promises.writeFile(outputPath, pdfBytes);

    // Clean up input file
    await fs.promises.unlink(req.file.path);

    res.json({ url: getFileUrl(outputFilename) });
  } catch (error) {
    console.error("Error adding text to PDF:", error);
    res.status(500).json({ error: "Failed to add text to PDF" });
  }
});

// Add signature to PDF endpoint
router.post("/add-signature", upload.single("file"), [body("signature").notEmpty().withMessage("Signature text is required"), body("page").isInt({ min: 1 }).withMessage("Invalid page number"), body("x").isFloat().withMessage("Invalid x coordinate"), body("y").isFloat().withMessage("Invalid y coordinate")], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    const { signature, page, x, y } = req.body;
    const pdf = await PDFDocument.load(req.file.path);
    const pdfPage = pdf.getPage(page - 1);

    // Draw signature text with a custom font
    const font = await pdf.embedFont(PDFDocument.StandardFonts.Helvetica);
    pdfPage.drawText(signature, {
      x,
      y,
      size: 12,
      font,
      color: PDFDocument.rgb(0, 0, 0),
    });

    const pdfBytes = await pdf.save();
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const outputFilename = `${timestamp}-${uniqueId}-added-signature.pdf`;
    const outputPath = path.join(__dirname, "../../uploads", outputFilename);
    await fs.promises.writeFile(outputPath, pdfBytes);

    // Clean up input file
    await fs.promises.unlink(req.file.path);

    res.json({ url: getFileUrl(outputFilename) });
  } catch (error) {
    console.error("Error adding signature to PDF:", error);
    res.status(500).json({ error: "Failed to add signature to PDF" });
  }
});

// Edit PDF endpoint
router.post("/edit", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { edits } = req.body;
    const inputPath = req.file.path;
    const pdfBytes = await fs.promises.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const parsedEdits = JSON.parse(edits);

    // Apply edits
    for (const edit of parsedEdits) {
      if (edit.type === "delete") {
        pdfDoc.removePage(edit.pageNumber - 1);
      } else if (edit.type === "duplicate") {
        const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [edit.pageNumber - 1]);
        pdfDoc.insertPage(edit.pageNumber, copiedPage);
      }
    }

    const editedPdfBytes = await pdfDoc.save();
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const outputFilename = `${timestamp}-${uniqueId}-edited.pdf`;
    const outputPath = path.join(__dirname, "../../uploads", outputFilename);
    await fs.promises.writeFile(outputPath, editedPdfBytes);

    // Clean up input file
    await fs.promises.unlink(inputPath);

    res.json({ url: getFileUrl(outputFilename) });
  } catch (error) {
    console.error("Error editing PDF:", error);
    res.status(500).json({ error: "Failed to edit PDF" });
  }
});

// Update protect PDF endpoint to handle more permissions
router.post("/protect", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { password, permissions } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const inputPath = req.file.path;
    const pdfBytes = await fs.promises.readFile(inputPath);

    // Load the original PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Save with encryption
    const protectedPdfBytes = await pdfDoc.save({
      // Set user password for opening the document
      userPassword: password,
      // Set owner password for full access
      ownerPassword: `${password}_owner`,
      // Set permissions
      permissions: {
        printing: permissions?.print ? "highResolution" : "none",
        modifying: false,
        extracting: false,
        annotating: false,
        fillingForms: false,
        documentAssembly: false,
        copying: permissions?.copy || false,
      },
    });

    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const outputFilename = `${timestamp}-${uniqueId}-protected.pdf`;
    const outputPath = path.join(__dirname, "../../uploads", outputFilename);
    await fs.promises.writeFile(outputPath, protectedPdfBytes);

    // Clean up input file
    await fs.promises.unlink(inputPath);

    // Return the full URL including the domain
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const fileUrl = `${baseUrl}${getFileUrl(outputFilename)}`;

    // Set response headers to prevent caching
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
    });

    res.json({
      url: fileUrl,
      filename: outputFilename,
      isProtected: true,
      message: "PDF has been protected with password successfully",
    });
  } catch (error) {
    console.error("Error protecting PDF:", error);
    res.status(500).json({ error: "Failed to protect PDF" });
  }
});

export default router;
