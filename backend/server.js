const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Simple middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// MongoDB connection
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourism_db';

mongoose.connect(mongoUrl, {})
.then(() => {
    console.log("Database Connected!!");
})
.catch((error) => {
    console.log("❌ Database connection failed:", error.message);
    console.log("⚠️  Server will continue running without database");
});

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("Database Connected!!");
});

// Simple health check
app.get('/health', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message || 'Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all addresses

const server = app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying port ${PORT + 1}`);
        server.listen(PORT + 1, HOST);
    }
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    server.close(() => {
        console.log('Server closed');
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});