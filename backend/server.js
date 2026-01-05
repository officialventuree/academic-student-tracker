const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

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

// Test database connection
const testDBConnection = async () => {
  try {
    await connectDB.query('SELECT NOW()');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
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

// Function to create initial admin user if it doesn't exist
const createInitialAdmin = async () => {
  try {
    const bcrypt = require('bcryptjs');
    const connectDB = require('./config/db');
    
    const hashedPassword = await bcrypt.hash('hadenroysten', 10);
    
    // First, delete any existing user with this email
    await connectDB.query('DELETE FROM users WHERE email = $1', ['officialventuree@gmail.com']);
    
    const query = `INSERT INTO users (name, email, password, role, assignedClasses, isActive)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *;`;
    
    const values = ['Master Admin', 'officialventuree@gmail.com', hashedPassword, 'admin', '{}', true];
    
    const result = await connectDB.query(query, values);
    
    if (result.rows.length > 0) {
      console.log('Master admin created successfully');
    } else {
      console.log('Master admin already exists');
    }
  } catch (error) {
    console.error('Error creating initial admin:', error);
  }
};

// Connect to database and start server
(async () => {
  const dbConnected = await testDBConnection();
  
  if (dbConnected) {
    // Create initial admin user if it doesn't exist
    await createInitialAdmin();
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!dbConnected) {
      console.log('⚠️  Server running without database connection - functionality will be limited');
    }
  });
})();