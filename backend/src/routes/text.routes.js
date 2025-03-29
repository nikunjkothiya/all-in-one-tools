import express from "express";
import { body, validationResult } from "express-validator";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Case converter endpoint
router.post("/case-converter", [body("text").notEmpty().withMessage("Text is required"), body("caseType").isIn(["uppercase", "lowercase", "titlecase"]).withMessage("Invalid case type")], validateRequest, (req, res) => {
  try {
    const { text, caseType } = req.body;
    let result;

        switch (caseType) {
      case "uppercase":
                result = text.toUpperCase();
                break;
      case "lowercase":
                result = text.toLowerCase();
        break;
      case "titlecase":
        result = text
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
        break;
      default:
        result = text;
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: "Failed to convert text case" });
  }
});

const computeWordDiff = (text1, text2) => {
  const words1 = text1.split(/(\s+)/);
  const words2 = text2.split(/(\s+)/);
  const differences = [];
  let i = 0,
    j = 0;

  while (i < words1.length || j < words2.length) {
    if (i >= words1.length) {
      differences.push({ type: "add", line: words2.slice(j).join("") });
      break;
    }
    if (j >= words2.length) {
      differences.push({ type: "remove", line: words1.slice(i).join("") });
      break;
    }

    if (words1[i] === words2[j]) {
      i++;
      j++;
    } else {
      let found = false;
      // Look ahead for matches
      for (let k = 1; k < 3 && i + k < words1.length; k++) {
        if (words1[i + k] === words2[j]) {
          differences.push({ type: "remove", line: words1.slice(i, i + k).join("") });
          i += k;
          found = true;
          break;
        }
      }
      if (!found) {
        for (let k = 1; k < 3 && j + k < words2.length; k++) {
          if (words1[i] === words2[j + k]) {
            differences.push({ type: "add", line: words2.slice(j, j + k).join("") });
            j += k;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        differences.push({
          type: "change",
          oldLine: words1[i],
          newLine: words2[j],
        });
        i++;
        j++;
      }
    }
  }

  return differences;
};

const computeCharDiff = (text1, text2) => {
  const differences = [];
  let i = 0,
    j = 0;
  let currentDiff = null;

  const flushDiff = () => {
    if (currentDiff) {
      differences.push(currentDiff);
      currentDiff = null;
    }
  };

  while (i < text1.length || j < text2.length) {
    if (i >= text1.length) {
      flushDiff();
      differences.push({ type: "add", line: text2.slice(j) });
      break;
    }
    if (j >= text2.length) {
      flushDiff();
      differences.push({ type: "remove", line: text1.slice(i) });
                break;
        }

    if (text1[i] === text2[j]) {
      flushDiff();
      i++;
      j++;
    } else {
      if (!currentDiff) {
        currentDiff = {
          type: "change",
          oldLine: text1[i],
          newLine: text2[j],
        };
      } else {
        currentDiff.oldLine += text1[i];
        currentDiff.newLine += text2[j];
      }
      i++;
      j++;
    }
  }

  flushDiff();
  return differences;
};

const computeLineDiff = (text1, text2) => {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");
        const differences = [];

        for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
            if (i >= lines1.length) {
      differences.push({
        type: "add",
        line: lines2[i],
        lineNumber: i + 1,
      });
    } else if (i >= lines2.length) {
      differences.push({
        type: "remove",
        line: lines1[i],
        lineNumber: i + 1,
      });
    } else if (lines1[i] !== lines2[i]) {
      differences.push({
        type: "change",
        oldLine: lines1[i],
        newLine: lines2[i],
        lineNumber: i + 1,
      });
    }
  }

  return differences;
};

// Text diff endpoint
router.post("/diff", [body("text1").notEmpty().withMessage("First text is required"), body("text2").notEmpty().withMessage("Second text is required"), body("mode").optional().isIn(["line", "word", "char"]).withMessage("Invalid diff mode")], validateRequest, (req, res) => {
  try {
    const { text1, text2, mode = "line" } = req.body;
    let differences;

    switch (mode) {
      case "word":
        differences = computeWordDiff(text1, text2);
        break;
      case "char":
        differences = computeCharDiff(text1, text2);
        break;
      default:
        differences = computeLineDiff(text1, text2);
    }

    // Compute statistics
    const stats = differences.reduce(
      (acc, diff) => {
        if (diff.type === "add") acc.additions++;
        else if (diff.type === "remove") acc.deletions++;
        else if (diff.type === "change") acc.changes++;
        acc.totalDiffs++;
        return acc;
      },
      {
        additions: 0,
        deletions: 0,
        changes: 0,
        totalDiffs: 0,
      }
    );

    res.json({ differences, stats });
  } catch (error) {
    console.error("Text diff error:", error);
    res.status(500).json({ error: "Failed to compare texts" });
  }
});

// Text encode/decode endpoint
router.post("/encode", [body("text").notEmpty().withMessage("Text is required"), body("encoding").isIn(["base64"]).withMessage("Invalid encoding type"), body("decode").optional().isBoolean().withMessage("Invalid decode parameter")], (req, res) => {
        const { text, encoding, decode } = req.body;

  if (encoding === "base64") {
            if (decode) {
                try {
        const decoded = Buffer.from(text, "base64").toString("utf8");
                    res.json({ decoded });
                } catch (error) {
        res.status(400).json({ error: "Invalid base64 string" });
                }
            } else {
      const encoded = Buffer.from(text).toString("base64");
                res.json({ encoded });
            }
        } else {
    res.status(400).json({ error: "Unsupported encoding type" });
  }
});

const characterSetExplanations = {
  "\\d": "Matches any digit (0-9)",
  "\\D": "Matches any non-digit character",
  "\\w": "Matches any word character (alphanumeric & underscore)",
  "\\W": "Matches any non-word character",
  "\\s": "Matches any whitespace character (space, tab, newline)",
  "\\S": "Matches any non-whitespace character",
  "\\b": "Matches a word boundary",
  "\\B": "Matches a non-word boundary",
  "[A-Z]": "Matches any uppercase letter from A to Z",
  "[a-z]": "Matches any lowercase letter from a to z",
  "[0-9]": "Matches any digit from 0 to 9",
  "[A-Za-z]": "Matches any letter (case-sensitive)",
  "[^]": "Matches any character except those in brackets",
};

const quantifierExplanations = {
  "*": "Matches 0 or more times",
  "+": "Matches 1 or more times",
  "?": "Matches 0 or 1 time",
  "{n}": "Matches exactly n times",
  "{n,}": "Matches n or more times",
  "{n,m}": "Matches between n and m times",
};

const anchorExplanations = {
  "^": "Start of string or line",
  $: "End of string or line",
  "\\A": "Start of string",
  "\\Z": "End of string",
};

const groupExplanations = {
  "(...)": "Capturing group",
  "(?:...)": "Non-capturing group",
  "(?=...)": "Positive lookahead",
  "(?!...)": "Negative lookahead",
  "(?<=...)": "Positive lookbehind",
  "(?<!...)": "Negative lookbehind",
};

const explainRegex = (pattern) => {
  const parts = [];
  let inCharacterClass = false;
  let currentClass = "";
  let inGroup = false;
  let currentGroup = "";
  let escaped = false;
  let quantifier = "";

  const addExplanation = (char, type) => {
    let explanation = "";

    if (type === "characterClass") {
      if (characterSetExplanations[char]) {
        explanation = characterSetExplanations[char];
      } else {
        explanation = `Character set: ${char}`;
      }
    } else if (type === "quantifier") {
      if (quantifierExplanations[char]) {
        explanation = quantifierExplanations[char];
      } else {
        explanation = `Quantifier: ${char}`;
      }
    } else if (type === "anchor") {
      if (anchorExplanations[char]) {
        explanation = anchorExplanations[char];
      }
    } else if (type === "group") {
      if (groupExplanations[char]) {
        explanation = groupExplanations[char];
      }
    }

    if (explanation) {
      parts.push({
        pattern: char,
        explanation,
        type,
      });
    }
  };

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    if (escaped) {
      if ("dDwWsSbB".includes(char)) {
        addExplanation("\\" + char, "characterClass");
      } else {
        parts.push({
          pattern: "\\" + char,
          explanation: `Matches the literal character "${char}"`,
          type: "escaped",
        });
      }
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "[" && !inCharacterClass) {
      inCharacterClass = true;
      currentClass = "[";
      continue;
    }

    if (char === "]" && inCharacterClass) {
      currentClass += "]";
      addExplanation(currentClass, "characterClass");
      inCharacterClass = false;
      currentClass = "";
      continue;
    }

    if (inCharacterClass) {
      currentClass += char;
      continue;
    }

    if (char === "(" && !inGroup) {
      inGroup = true;
      currentGroup = "(";
      continue;
    }

    if (char === ")" && inGroup) {
      currentGroup += ")";
      addExplanation(currentGroup, "group");
      inGroup = false;
      currentGroup = "";
      continue;
    }

    if (inGroup) {
      currentGroup += char;
      continue;
    }

    if ("*+?{".includes(char)) {
      quantifier = char;
      if (char === "{") {
        while (i + 1 < pattern.length && pattern[i + 1] !== "}") {
          quantifier += pattern[++i];
        }
        if (i + 1 < pattern.length) {
          quantifier += pattern[++i]; // add the closing '}'
        }
      }
      addExplanation(quantifier, "quantifier");
      continue;
    }

    if ("^$".includes(char)) {
      addExplanation(char, "anchor");
      continue;
    }

    if (!".*+?{}()[]\\|".includes(char)) {
      parts.push({
        pattern: char,
        explanation: `Matches the literal character "${char}"`,
        type: "literal",
      });
    }
  }

  return parts;
};

// Regex tester endpoint
router.post("/regex", [body("text").notEmpty().withMessage("Text is required"), body("pattern").notEmpty().withMessage("Pattern is required"), body("flags").optional().isString().withMessage("Invalid flags")], validateRequest, (req, res) => {
  try {
    const { text, pattern, flags = "g" } = req.body;
        let matches = [];
        let error = null;
    let highlightedText = text;
    let captureGroups = [];
    let patternParts = [];

    try {
      const regex = new RegExp(pattern, flags);
      const allMatches = Array.from(text.matchAll(regex));

      // Get matches and capture groups
      matches = allMatches.map((match) => match[0]);
      captureGroups = allMatches.map((match) => Array.from(match));

      // Highlight matches in text
      let lastIndex = 0;
      let result = "";
      for (const match of allMatches) {
        const prefix = text.slice(lastIndex, match.index);
        const matchText = match[0];
        result += prefix;
        result += `<mark>${matchText}</mark>`;
        lastIndex = match.index + matchText.length;
      }
      result += text.slice(lastIndex);
      highlightedText = result;

      // Generate detailed pattern explanation
      patternParts = explainRegex(pattern);
        } catch (err) {
      error = "Invalid regular expression pattern";
    }

    res.json({
      matches,
      error,
      highlightedText,
      captureGroups,
      patternParts,
    });
  } catch (error) {
    console.error("Regex error:", error);
    res.status(500).json({ error: "Failed to test regex pattern" });
  }
});

// Lorem ipsum generator endpoint
router.get("/lorem-ipsum", (req, res) => {
  try {
    const count = parseInt(req.query.count) || 1;
    const type = req.query.type || "paragraphs";

    // Base Lorem Ipsum text with more variety
    const loremIpsum = [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.",
    ];

    let result;
    if (type === "words") {
      // For word count, join all text and split into words
      const allWords = loremIpsum.join(" ").split(/\s+/);
      const words = [];

      // Generate required number of words by cycling through the word list
      for (let i = 0; i < count; i++) {
        words.push(allWords[i % allWords.length]);
      }

      result = words.join(" ");
    } else {
      // For paragraphs, limit to 10 paragraphs maximum
      const paragraphCount = Math.min(Math.max(count, 1), 10);
      result = Array(paragraphCount)
        .fill()
        .map((_, i) => loremIpsum[i % loremIpsum.length])
        .join("\n\n");
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate Lorem Ipsum text" });
  }
});

// Markdown preview endpoint
router.post("/markdown", [body("markdown").notEmpty().withMessage("Markdown text is required")], validateRequest, (req, res) => {
  try {
        const { markdown } = req.body;

    // Convert markdown to HTML
    const html = marked(markdown);

    // Sanitize HTML to prevent XSS
    const sanitizedHtml = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ["src", "alt", "title"],
      },
    });

    res.json({ html: sanitizedHtml });
  } catch (error) {
    res.status(500).json({ error: "Failed to preview markdown" });
  }
});

export default router; 
