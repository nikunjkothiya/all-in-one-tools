import express from "express";
import multer from "multer";
import { PDFDocument } from "pdf-lib";
import { body } from "express-validator";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to save PDF and return URL
const savePdf = async (buffer) => {
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
  const filepath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filepath, buffer);
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
router.post("/merge", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: "At least two PDF files are required" });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      try {
        const pdf = await PDFDocument.load(file.buffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      } catch (error) {
        console.error("Error processing PDF:", error);
        return res.status(400).json({ error: "Invalid PDF file provided" });
      }
    }

    const pdfBytes = await mergedPdf.save();
    const url = await savePdf(Buffer.from(pdfBytes));
    res.json({ merged: url });
  } catch (error) {
    console.error("PDF merge error:", error);
    res.status(500).json({ error: "Failed to merge PDFs" });
  }
});

// Split PDF endpoint
router.post("/split", upload.single("file"), [body("pages").isString().withMessage("Pages string is required")], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    const pages = req.body.pages.split(",").map((num) => parseInt(num.trim()));
    if (pages.some((num) => isNaN(num) || num < 1)) {
      return res.status(400).json({ error: "Invalid page numbers" });
    }

    let pdf;
    try {
      pdf = await PDFDocument.load(req.file.buffer);
    } catch (error) {
      console.error("Error loading PDF:", error);
      return res.status(400).json({ error: "Invalid PDF file provided" });
    }

    const splitPdf = await PDFDocument.create();

    for (const pageNum of pages) {
      if (pageNum <= pdf.getPageCount()) {
        const [copiedPage] = await splitPdf.copyPages(pdf, [pageNum - 1]);
        splitPdf.addPage(copiedPage);
      }
    }

    const pdfBytes = await splitPdf.save();
    const url = await savePdf(Buffer.from(pdfBytes));
    res.json({ split: url });
  } catch (error) {
    console.error("PDF split error:", error);
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
    const pdf = await PDFDocument.load(req.file.buffer);
    const pdfPage = pdf.getPage(page - 1);

    pdfPage.drawText(text, {
      x,
      y,
      size: fontSize,
    });

    const pdfBytes = await pdf.save();
    const url = await savePdf(Buffer.from(pdfBytes));
    res.json({ addedText: url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add signature to PDF endpoint
router.post("/add-signature", upload.single("file"), [body("signature").notEmpty().withMessage("Signature text is required"), body("page").isInt({ min: 1 }).withMessage("Invalid page number"), body("x").isFloat().withMessage("Invalid x coordinate"), body("y").isFloat().withMessage("Invalid y coordinate")], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    const { signature, page, x, y } = req.body;
    const pdf = await PDFDocument.load(req.file.buffer);
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
    const url = await savePdf(Buffer.from(pdfBytes));
    res.json({ addedSignature: url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add rotation to edit PDF endpoint
router.post("/edit", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    const edits = JSON.parse(req.body.edits || "[]");
    const rotation = parseInt(req.body.rotation || "0");

    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const newPdfDoc = await PDFDocument.create();

    // Apply edits (reorder, delete, or duplicate pages)
    if (edits.length > 0) {
      for (const edit of edits) {
        const pageIndex = edit.pageNumber - 1;

        if (edit.action === "delete") {
          continue; // Skip this page
        }

        if (edit.action === "duplicate") {
          const [page] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
          newPdfDoc.addPage(page);
          newPdfDoc.addPage(page); // Add twice for duplication
        } else {
          const [page] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
          newPdfDoc.addPage(page);
        }
      }
    } else {
      // If no edits, copy all pages
      const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => {
        newPdfDoc.addPage(page);
        if (rotation !== 0) {
          page.setRotation(degrees(rotation));
        }
      });
    }

    const pdfBytes = await newPdfDoc.save();
    const outputPath = path.join(uploadsDir, `edited-${Date.now()}.pdf`);
    await fs.promises.writeFile(outputPath, pdfBytes);

    res.download(outputPath, "edited.pdf", async (err) => {
      if (err) {
        console.error("Error downloading file:", err);
      }
      // Cleanup
      await fs.promises.unlink(req.file.path).catch(console.error);
      await fs.promises.unlink(outputPath).catch(console.error);
    });
  } catch (error) {
    console.error("Error editing PDF:", error);
    res.status(500).json({ error: "Failed to edit PDF" });
  }
});

// Helper function to convert degrees to radians
const degrees = (deg) => (deg * Math.PI) / 180;

// Update protect PDF endpoint to handle more permissions
router.post("/protect", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    const { password } = req.body;
    const permissions = JSON.parse(req.body.permissions || "{}");

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(req.file.buffer);

    // Create a new document and copy all pages
    const encryptedPdfDoc = await PDFDocument.create();
    const pages = await encryptedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page) => encryptedPdfDoc.addPage(page));

    // Set up permissions using the correct pdf-lib format
    const userPermissions = {
      printing: permissions.print ? "highResolution" : "none",
      modifying: permissions.edit,
      extracting: permissions.copy,
      annotating: permissions.edit,
      fillingForms: permissions.edit,
      contentAccessibility: true,
      documentAssembly: permissions.edit,
    };

    // Save with encryption
    const pdfBytes = await encryptedPdfDoc.save({
      useUserPassword: true,
      userPassword: password,
      ownerPassword: password + "_owner", // Create a different owner password
      permissions: userPermissions,
    });

    // Save the encrypted PDF
    const url = await savePdf(Buffer.from(pdfBytes));
    res.json({ protected: url });
  } catch (error) {
    console.error("Error protecting PDF:", error);
    res.status(500).json({ error: "Failed to protect PDF" });
  }
});

export default router;
