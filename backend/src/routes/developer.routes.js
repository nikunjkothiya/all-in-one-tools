import express from 'express';
import { body, validationResult } from 'express-validator';
import prettier from 'prettier';
import htmlMinifier from 'html-minifier';
import { minify as jsMinify } from 'terser';
import CleanCSS from 'clean-css';
import * as esprima from 'esprima';

const router = express.Router();

// Format code endpoint
router.post(
  '/format',
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('format').isIn(['json', 'html', 'css', 'js']).withMessage('Invalid format')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { code, format } = req.body;
      let formatted = '';
      
      switch (format) {
        case 'json':
          try {
            // Parse and stringify JSON with formatting
            const parsedJson = JSON.parse(code);
            formatted = JSON.stringify(parsedJson, null, 2);
          } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON' });
          }
          break;
        
        case 'html':
          // Use prettier to format HTML
          formatted = await prettier.format(code, { parser: 'html' });
          break;
        
        case 'css':
          // Use prettier to format CSS
          formatted = await prettier.format(code, { parser: 'css' });
          break;
        
        case 'js':
          // Use prettier to format JavaScript
          formatted = await prettier.format(code, { parser: 'babel' });
          break;
        
        default:
          return res.status(400).json({ error: 'Unsupported format' });
      }
      
      res.json({ formatted });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Failed to format code' });
    }
  }
);

// Minify code endpoint
router.post(
  '/minify',
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('format').isIn(['json', 'html', 'css', 'js']).withMessage('Invalid format')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { code, format } = req.body;
      let minified = '';
      
      switch (format) {
        case 'json':
          try {
            // Parse and stringify JSON without formatting
            const parsedJson = JSON.parse(code);
            minified = JSON.stringify(parsedJson);
          } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON' });
          }
          break;
        
        case 'html':
          // Use html-minifier to minify HTML
          minified = htmlMinifier.minify(code, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true
          });
          break;
        
        case 'css':
          // Use clean-css to minify CSS
          const cleanCSSInstance = new CleanCSS();
          const cssResult = cleanCSSInstance.minify(code);
          minified = cssResult.styles;
          break;
        
        case 'js':
          // Use terser to minify JavaScript
          const result = await jsMinify(code);
          minified = result.code;
          break;
        
        default:
          return res.status(400).json({ error: 'Unsupported format' });
      }
      
      res.json({ minified });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Failed to minify code' });
    }
  }
);

// Validate code endpoint
router.post(
  '/validate',
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('format').isIn(['json', 'html', 'css', 'js']).withMessage('Invalid format')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { code, format } = req.body;
      let valid = false;
      let message = '';
      
      switch (format) {
        case 'json':
          try {
            JSON.parse(code);
            valid = true;
          } catch (error) {
            message = error.message;
          }
          break;
        
        case 'html':
          // Simple HTML validation (more comprehensive validation would require a full HTML parser)
          valid = code.includes('<') && code.includes('>');
          if (!valid) {
            message = 'HTML must contain tags';
          }
          break;
        
        case 'css':
          // Basic CSS validation would require a CSS parser like csstree
          valid = true;
          break;
        
        case 'js':
          try {
            // Use Esprima to validate JavaScript
            esprima.parseScript(code);
            valid = true;
          } catch (error) {
            message = error.message;
          }
          break;
        
        default:
          return res.status(400).json({ error: 'Unsupported format' });
      }
      
      res.json({ valid, message });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Failed to validate code' });
    }
  }
);

export default router; 