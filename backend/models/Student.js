const db = require('../config/db');

// Create students table if it doesn't exist
const createStudentsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      studentId VARCHAR(100) UNIQUE NOT NULL,
      form VARCHAR(50) NOT NULL,
      classId INTEGER REFERENCES classes(id),
      parentContact VARCHAR(255),
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Students table created or already exists');
  } catch (error) {
    console.error('Error creating students table:', error);
  }
};

// Initialize the table
createStudentsTable();

const Student = {
  // Create a new student
  create: async (studentData) => {
    const { name, email, studentId, form, classId, parentContact } = studentData;
    
    const query = `
      INSERT INTO students (name, email, studentId, form, classId, parentContact)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    
    const values = [name, email, studentId, form, classId, parentContact];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating student: ${error.message}`);
    }
  },

  // Find student by ID
  findById: async (id) => {
    const query = 'SELECT * FROM students WHERE id = $1';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding student: ${error.message}`);
    }
  },

  // Find student by student ID
  findByStudentId: async (studentId) => {
    const query = 'SELECT * FROM students WHERE studentId = $1';
    const values = [studentId];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding student: ${error.message}`);
    }
  },

  // Find all students in a class
  findByClass: async (classId) => {
    const query = 'SELECT * FROM students WHERE classId = $1 AND isActive = true ORDER BY name';
    const values = [classId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding students: ${error.message}`);
    }
  },

  // Find all students
  findAll: async () => {
    const query = 'SELECT * FROM students WHERE isActive = true ORDER BY name';
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting students: ${error.message}`);
    }
  },

  // Update student
  update: async (id, studentData) => {
    const { name, email, studentId, form, classId, parentContact, isActive } = studentData;
    let query = 'UPDATE students SET updated_at = CURRENT_TIMESTAMP';
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
    if (studentId) {
      query += `, studentId = $${paramCount++}`;
      values.push(studentId);
    }
    if (form) {
      query += `, form = $${paramCount++}`;
      values.push(form);
    }
    if (classId) {
      query += `, classId = $${paramCount++}`;
      values.push(classId);
    }
    if (parentContact) {
      query += `, parentContact = $${paramCount++}`;
      values.push(parentContact);
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
      throw new Error(`Error updating student: ${error.message}`);
    }
  },

  // Delete student (soft delete by setting isActive to false)
  delete: async (id) => {
    const query = 'UPDATE students SET isActive = false WHERE id = $1 RETURNING *';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting student: ${error.message}`);
    }
  }
};

module.exports = Student;