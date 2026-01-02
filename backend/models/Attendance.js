const db = require('../config/db');

// Create attendance table if it doesn't exist
const createAttendanceTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      studentId INTEGER REFERENCES students(id),
      classId INTEGER REFERENCES classes(id),
      date DATE NOT NULL,
      status VARCHAR(20) NOT NULL, -- present, absent, late
      session VARCHAR(20), -- morning, afternoon, full-day
      teacherId INTEGER REFERENCES users(id),
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(studentId, classId, date) -- Prevent duplicate entries for same student/class/date
    );
  `;
  
  try {
    await db.query(query);
    console.log('Attendance table created or already exists');
  } catch (error) {
    console.error('Error creating attendance table:', error);
  }
};

// Initialize the table
createAttendanceTable();

const Attendance = {
  // Create a new attendance record
  create: async (attendanceData) => {
    const { studentId, classId, date, status, session, teacherId, notes } = attendanceData;
    
    const query = `
      INSERT INTO attendance (studentId, classId, date, status, session, teacherId, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [studentId, classId, date, status, session, teacherId, notes];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating attendance record: ${error.message}`);
    }
  },

  // Find attendance by ID
  findById: async (id) => {
    const query = 'SELECT * FROM attendance WHERE id = $1';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding attendance: ${error.message}`);
    }
  },

  // Find attendance for a student in a class for a specific date
  findByStudentClassDate: async (studentId, classId, date) => {
    const query = 'SELECT * FROM attendance WHERE studentId = $1 AND classId = $2 AND date = $3';
    const values = [studentId, classId, date];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding attendance: ${error.message}`);
    }
  },

  // Find all attendance records for a student
  findByStudent: async (studentId) => {
    const query = 'SELECT * FROM attendance WHERE studentId = $1 ORDER BY date DESC';
    const values = [studentId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding attendance: ${error.message}`);
    }
  },

  // Find all attendance records for a class
  findByClass: async (classId) => {
    const query = 'SELECT * FROM attendance WHERE classId = $1 ORDER BY date DESC, studentId';
    const values = [classId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding attendance: ${error.message}`);
    }
  },

  // Find all attendance records for a class on a specific date
  findByClassDate: async (classId, date) => {
    const query = 'SELECT * FROM attendance WHERE classId = $1 AND date = $2 ORDER BY studentId';
    const values = [classId, date];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding attendance: ${error.message}`);
    }
  },

  // Find attendance for a student in a date range
  findByStudentDateRange: async (studentId, startDate, endDate) => {
    const query = 'SELECT * FROM attendance WHERE studentId = $1 AND date BETWEEN $2 AND $3 ORDER BY date';
    const values = [studentId, startDate, endDate];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding attendance: ${error.message}`);
    }
  },

  // Find attendance for a class in a date range
  findByClassDateRange: async (classId, startDate, endDate) => {
    const query = 'SELECT * FROM attendance WHERE classId = $1 AND date BETWEEN $2 AND $3 ORDER BY date, studentId';
    const values = [classId, startDate, endDate];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding attendance: ${error.message}`);
    }
  },

  // Update attendance record
  update: async (id, attendanceData) => {
    const { status, session, notes } = attendanceData;
    let query = 'UPDATE attendance SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;

    if (status) {
      query += `, status = $${paramCount++}`;
      values.push(status);
    }
    if (session) {
      query += `, session = $${paramCount++}`;
      values.push(session);
    }
    if (notes) {
      query += `, notes = $${paramCount++}`;
      values.push(notes);
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating attendance: ${error.message}`);
    }
  },

  // Delete attendance record
  delete: async (id) => {
    const query = 'DELETE FROM attendance WHERE id = $1 RETURNING *';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting attendance: ${error.message}`);
    }
  }
};

module.exports = Attendance;