const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app' // Replace with your actual frontend domain
    : '*', // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`Warning: MongoDB connection failed: ${error.message}`);
    console.log('Running in mock mode - data will not persist');
    return false; // Continue execution even if DB fails
  }
};

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/carrymarks', require('./routes/carryMarkRoutes'));
app.use('/api/reports', require('./routes/pdfRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Academic Student Tracker API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then((dbConnected) => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!dbConnected) {
      console.log('⚠️  Server running without database connection - functionality will be limited');
    }
  });
});