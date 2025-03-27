const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/text', require('./routes/text.routes'));
app.use('/api/image', require('./routes/image.routes'));
app.use('/api/pdf', require('./routes/pdf.routes'));
app.use('/api/developer', require('./routes/developer.routes'));
app.use('/api/file', require('./routes/file.routes'));
app.use('/api/media', require('./routes/media.routes'));
app.use('/api/web', require('./routes/web.routes'));
app.use('/api/data', require('./routes/data.routes'));
app.use('/api/privacy', require('./routes/privacy.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found on this server',
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
