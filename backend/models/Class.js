const db = require('../config/db');

// Create classes table if it doesn't exist
const createClassesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS classes (
      id SERIAL PRIMARY KEY,
      className VARCHAR(255) NOT NULL,
      form VARCHAR(50) NOT NULL,
      teacherId INTEGER REFERENCES users(id),
      subject VARCHAR(255),
      capacity INTEGER DEFAULT 40,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Classes table created or already exists');
  } catch (error) {
    console.error('Error creating classes table:', error);
  }
};

// Initialize the table
createClassesTable();

const Class = {
  // Create a new class
  create: async (classData) => {
    const { className, form, teacherId, subject, capacity } = classData;
    
    const query = `
      INSERT INTO classes (className, form, teacherId, subject, capacity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const values = [className, form, teacherId, subject, capacity];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating class: ${error.message}`);
    }
  },

  // Find class by ID
  findById: async (id) => {
    const query = 'SELECT * FROM classes WHERE id = $1';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding class: ${error.message}`);
    }
  },

  // Find all classes
  findAll: async () => {
    const query = 'SELECT * FROM classes WHERE isActive = true ORDER BY form, className';
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting classes: ${error.message}`);
    }
  },

  // Find classes by teacher ID
  findByTeacher: async (teacherId) => {
    const query = 'SELECT * FROM classes WHERE teacherId = $1 AND isActive = true ORDER BY form, className';
    const values = [teacherId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding classes: ${error.message}`);
    }
  },

  // Update class
  update: async (id, classData) => {
    const { className, form, teacherId, subject, capacity, isActive } = classData;
    let query = 'UPDATE classes SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;

    if (className) {
      query += `, className = $${paramCount++}`;
      values.push(className);
    }
    if (form) {
      query += `, form = $${paramCount++}`;
      values.push(form);
    }
    if (teacherId) {
      query += `, teacherId = $${paramCount++}`;
      values.push(teacherId);
    }
    if (subject) {
      query += `, subject = $${paramCount++}`;
      values.push(subject);
    }
    if (capacity) {
      query += `, capacity = $${paramCount++}`;
      values.push(capacity);
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
      throw new Error(`Error updating class: ${error.message}`);
    }
  },

  // Delete class (soft delete by setting isActive to false)
  delete: async (id) => {
    const query = 'UPDATE classes SET isActive = false WHERE id = $1 RETURNING *';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting class: ${error.message}`);
    }
  }
};

module.exports = Class;