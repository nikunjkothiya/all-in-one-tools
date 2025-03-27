require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

// Get port from environment variable or use default
const PORT = process.env.PORT || 5000;

// Connect to MongoDB if MONGODB_URI is provided
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 