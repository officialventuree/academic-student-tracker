const db = require('../config/db');

// Create carry marks table if it doesn't exist
const createCarryMarksTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS carryMarks (
      id SERIAL PRIMARY KEY,
      studentId INTEGER REFERENCES students(id),
      classId INTEGER REFERENCES classes(id),
      subject VARCHAR(255) NOT NULL,
      form VARCHAR(50) NOT NULL,
      semester INTEGER NOT NULL, -- 1 or 2
      academicYear VARCHAR(20) NOT NULL,
      us1 DECIMAL(5,2) DEFAULT 0,
      us2 DECIMAL(5,2) DEFAULT 0,
      uasa1 DECIMAL(5,2) DEFAULT 0, -- UASA for semester 1
      us3 DECIMAL(5,2) DEFAULT 0,
      us4 DECIMAL(5,2) DEFAULT 0,
      uasa2 DECIMAL(5,2) DEFAULT 0, -- UASA for semester 2
      assignmentScore DECIMAL(5,2) DEFAULT 0,
      attendanceScore DECIMAL(5,2) DEFAULT 0,
      totalMark DECIMAL(5,2) DEFAULT 0,
      grade VARCHAR(5),
      teacherId INTEGER REFERENCES users(id),
      calculatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Carry marks table created or already exists');
  } catch (error) {
    console.error('Error creating carry marks table:', error);
  }
};

// Initialize the table
createCarryMarksTable();

const CarryMark = {
  // Create a new carry mark record
  create: async (carryMarkData) => {
    const { 
      studentId, classId, subject, form, semester, academicYear, 
      us1, us2, uasa1, us3, us4, uasa2, assignmentScore, attendanceScore, 
      totalMark, grade, teacherId 
    } = carryMarkData;
    
    const query = `
      INSERT INTO carryMarks (
        studentId, classId, subject, form, semester, academicYear,
        us1, us2, uasa1, us3, us4, uasa2, assignmentScore, attendanceScore,
        totalMark, grade, teacherId
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *;
    `;
    
    const values = [
      studentId, classId, subject, form, semester, academicYear,
      us1 || 0, us2 || 0, uasa1 || 0, us3 || 0, us4 || 0, uasa2 || 0, 
      assignmentScore || 0, attendanceScore || 0, totalMark || 0, grade, teacherId
    ];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating carry mark: ${error.message}`);
    }
  },

  // Find carry mark by ID
  findById: async (id) => {
    const query = 'SELECT * FROM carryMarks WHERE id = $1';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding carry mark: ${error.message}`);
    }
  },

  // Find carry marks for a student in a specific subject and academic year
  findByStudentSubject: async (studentId, subject, academicYear) => {
    const query = 'SELECT * FROM carryMarks WHERE studentId = $1 AND subject = $2 AND academicYear = $3 ORDER BY semester';
    const values = [studentId, subject, academicYear];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding carry marks: ${error.message}`);
    }
  },

  // Find carry marks for a student in a specific form
  findByStudentForm: async (studentId, form) => {
    const query = 'SELECT * FROM carryMarks WHERE studentId = $1 AND form = $2 ORDER BY academicYear, semester, subject';
    const values = [studentId, form];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding carry marks: ${error.message}`);
    }
  },

  // Find carry marks for a class in a specific subject and academic year
  findByClassSubject: async (classId, subject, academicYear) => {
    const query = 'SELECT * FROM carryMarks WHERE classId = $1 AND subject = $2 AND academicYear = $3 ORDER BY studentId, semester';
    const values = [classId, subject, academicYear];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding carry marks: ${error.message}`);
    }
  },

  // Find carry marks for a student across all subjects and forms
  findByStudent: async (studentId) => {
    const query = 'SELECT * FROM carryMarks WHERE studentId = $1 ORDER BY form, academicYear, semester, subject';
    const values = [studentId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding carry marks: ${error.message}`);
    }
  },

  // Update carry mark record
  update: async (id, carryMarkData) => {
    const { 
      us1, us2, uasa1, us3, us4, uasa2, assignmentScore, attendanceScore, 
      totalMark, grade, teacherId 
    } = carryMarkData;
    
    let query = 'UPDATE carryMarks SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;

    if (us1 !== undefined) {
      query += `, us1 = $${paramCount++}`;
      values.push(us1);
    }
    if (us2 !== undefined) {
      query += `, us2 = $${paramCount++}`;
      values.push(us2);
    }
    if (uasa1 !== undefined) {
      query += `, uasa1 = $${paramCount++}`;
      values.push(uasa1);
    }
    if (us3 !== undefined) {
      query += `, us3 = $${paramCount++}`;
      values.push(us3);
    }
    if (us4 !== undefined) {
      query += `, us4 = $${paramCount++}`;
      values.push(us4);
    }
    if (uasa2 !== undefined) {
      query += `, uasa2 = $${paramCount++}`;
      values.push(uasa2);
    }
    if (assignmentScore !== undefined) {
      query += `, assignmentScore = $${paramCount++}`;
      values.push(assignmentScore);
    }
    if (attendanceScore !== undefined) {
      query += `, attendanceScore = $${paramCount++}`;
      values.push(attendanceScore);
    }
    if (totalMark !== undefined) {
      query += `, totalMark = $${paramCount++}`;
      values.push(totalMark);
    }
    if (grade) {
      query += `, grade = $${paramCount++}`;
      values.push(grade);
    }
    if (teacherId) {
      query += `, teacherId = $${paramCount++}`;
      values.push(teacherId);
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating carry mark: ${error.message}`);
    }
  },

  // Delete carry mark record
  delete: async (id) => {
    const query = 'DELETE FROM carryMarks WHERE id = $1 RETURNING *';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting carry mark: ${error.message}`);
    }
  }
};

module.exports = CarryMark;