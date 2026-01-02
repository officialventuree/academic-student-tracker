const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Create users table if it doesn't exist
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'teacher',
      assignedClasses TEXT[] DEFAULT '{}',
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Users table created or already exists');
  } catch (error) {
    console.error('Error creating users table:', error);
  }
};

// Initialize the table
createUsersTable();

const User = {
  // Create a new user
  create: async (userData) => {
    const { name, email, password, role, assignedClasses } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (name, email, password, role, assignedClasses)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, assignedClasses, isActive, createdAt, updatedAt;
    `;
    
    const values = [name, email, hashedPassword, role, assignedClasses || []];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  },

  // Find user by email
  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const values = [email];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  },

  // Find user by ID
  findById: async (id) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  },

  // Update user
  update: async (id, userData) => {
    const { name, email, password, role, assignedClasses, isActive } = userData;
    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;

    if (name) {
      query += `, name = $${paramCount++}`;
      values.push(name);
    }
    if (email) {
      query += `, email = $${paramCount++}`;
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = $${paramCount++}`;
      values.push(hashedPassword);
    }
    if (role) {
      query += `, role = $${paramCount++}`;
      values.push(role);
    }
    if (assignedClasses) {
      query += `, assignedClasses = $${paramCount++}`;
      values.push(assignedClasses);
    }
    if (isActive !== undefined) {
      query += `, isActive = $${paramCount++}`;
      values.push(isActive);
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  },

  // Delete user (soft delete by setting isActive to false)
  delete: async (id) => {
    const query = 'UPDATE users SET isActive = false WHERE id = $1 RETURNING *';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  },

  // Get all users
  findAll: async () => {
    const query = 'SELECT * FROM users WHERE isActive = true';
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }
  },

  // Check password
  checkPassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = User;