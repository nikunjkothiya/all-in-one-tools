const { validationResult } = require('express-validator');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: Object.values(err.errors).map((e) => e.message),
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID format',
            details: err.message,
        });
    }

    // Handle file upload errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            error: 'File Upload Error',
            details: err.message,
        });
    }

    // Default error
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
};

module.exports = errorHandler; 