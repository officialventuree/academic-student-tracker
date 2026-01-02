const db = require('../config/db');

// Create admin logs table if it doesn't exist
const createAdminLogsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS adminLogs (
      id SERIAL PRIMARY KEY,
      userId INTEGER REFERENCES users(id),
      action VARCHAR(255) NOT NULL, -- e.g., 'create_student', 'update_marks', 'delete_user'
      entityType VARCHAR(100), -- e.g., 'student', 'assessment', 'user'
      entityId INTEGER, -- ID of the entity affected
      description TEXT,
      ipAddress INET,
      userAgent TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Admin logs table created or already exists');
  } catch (error) {
    console.error('Error creating admin logs table:', error);
  }
};

// Initialize the table
createAdminLogsTable();

const AdminLog = {
  // Create a new admin log entry
  create: async (logData) => {
    const { userId, action, entityType, entityId, description, ipAddress, userAgent } = logData;
    
    const query = `
      INSERT INTO adminLogs (userId, action, entityType, entityId, description, ipAddress, userAgent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [userId, action, entityType, entityId, description, ipAddress, userAgent];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating admin log: ${error.message}`);
    }
  },

  // Find admin log by ID
  findById: async (id) => {
    const query = 'SELECT * FROM adminLogs WHERE id = $1';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding admin log: ${error.message}`);
    }
  },

  // Find all admin logs
  findAll: async () => {
    const query = 'SELECT * FROM adminLogs ORDER BY createdAt DESC';
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting admin logs: ${error.message}`);
    }
  },

  // Find admin logs by user ID
  findByUser: async (userId) => {
    const query = 'SELECT * FROM adminLogs WHERE userId = $1 ORDER BY createdAt DESC';
    const values = [userId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding admin logs: ${error.message}`);
    }
  },

  // Find admin logs by action type
  findByAction: async (action) => {
    const query = 'SELECT * FROM adminLogs WHERE action = $1 ORDER BY createdAt DESC';
    const values = [action];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding admin logs: ${error.message}`);
    }
  },

  // Find admin logs by date range
  findByDateRange: async (startDate, endDate) => {
    const query = 'SELECT * FROM adminLogs WHERE createdAt BETWEEN $1 AND $2 ORDER BY createdAt DESC';
    const values = [startDate, endDate];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding admin logs: ${error.message}`);
    }
  }
};

module.exports = AdminLog;