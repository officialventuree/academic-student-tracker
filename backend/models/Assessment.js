const db = require('../config/db');

// Create assessments table if it doesn't exist
const createAssessmentsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS assessments (
      id SERIAL PRIMARY KEY,
      studentId INTEGER REFERENCES students(id),
      classId INTEGER REFERENCES classes(id),
      assessmentType VARCHAR(50) NOT NULL, -- US1, US2, UASA, US3, US4, UASA2
      subject VARCHAR(255) NOT NULL,
      score DECIMAL(5,2),
      maxScore DECIMAL(5,2) DEFAULT 100,
      dateTaken DATE,
      term VARCHAR(20), -- Term 1, Term 2, Term 3
      academicYear VARCHAR(20),
      teacherId INTEGER REFERENCES users(id),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Assessments table created or already exists');
  } catch (error) {
    console.error('Error creating assessments table:', error);
  }
};

// Initialize the table
createAssessmentsTable();

const Assessment = {
  // Create a new assessment
  create: async (assessmentData) => {
    const { studentId, classId, assessmentType, subject, score, maxScore, dateTaken, term, academicYear, teacherId } = assessmentData;
    
    const query = `
      INSERT INTO assessments (studentId, classId, assessmentType, subject, score, maxScore, dateTaken, term, academicYear, teacherId)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    
    const values = [studentId, classId, assessmentType, subject, score, maxScore, dateTaken, term, academicYear, teacherId];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating assessment: ${error.message}`);
    }
  },

  // Find assessment by ID
  findById: async (id) => {
    const query = 'SELECT * FROM assessments WHERE id = $1';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding assessment: ${error.message}`);
    }
  },

  // Find all assessments for a student
  findByStudent: async (studentId) => {
    const query = 'SELECT * FROM assessments WHERE studentId = $1 ORDER BY dateTaken DESC';
    const values = [studentId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding assessments: ${error.message}`);
    }
  },

  // Find all assessments for a class
  findByClass: async (classId) => {
    const query = 'SELECT * FROM assessments WHERE classId = $1 ORDER BY dateTaken DESC';
    const values = [classId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding assessments: ${error.message}`);
    }
  },

  // Find all assessments for a specific assessment type in a class
  findByClassAndType: async (classId, assessmentType) => {
    const query = 'SELECT * FROM assessments WHERE classId = $1 AND assessmentType = $2 ORDER BY dateTaken DESC';
    const values = [classId, assessmentType];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding assessments: ${error.message}`);
    }
  },

  // Find all assessments for a student in a specific subject
  findByStudentAndSubject: async (studentId, subject) => {
    const query = 'SELECT * FROM assessments WHERE studentId = $1 AND subject = $2 ORDER BY dateTaken DESC';
    const values = [studentId, subject];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding assessments: ${error.message}`);
    }
  },

  // Update assessment
  update: async (id, assessmentData) => {
    const { studentId, classId, assessmentType, subject, score, maxScore, dateTaken, term, academicYear, teacherId } = assessmentData;
    let query = 'UPDATE assessments SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;

    if (studentId) {
      query += `, studentId = $${paramCount++}`;
      values.push(studentId);
    }
    if (classId) {
      query += `, classId = $${paramCount++}`;
      values.push(classId);
    }
    if (assessmentType) {
      query += `, assessmentType = $${paramCount++}`;
      values.push(assessmentType);
    }
    if (subject) {
      query += `, subject = $${paramCount++}`;
      values.push(subject);
    }
    if (score) {
      query += `, score = $${paramCount++}`;
      values.push(score);
    }
    if (maxScore) {
      query += `, maxScore = $${paramCount++}`;
      values.push(maxScore);
    }
    if (dateTaken) {
      query += `, dateTaken = $${paramCount++}`;
      values.push(dateTaken);
    }
    if (term) {
      query += `, term = $${paramCount++}`;
      values.push(term);
    }
    if (academicYear) {
      query += `, academicYear = $${paramCount++}`;
      values.push(academicYear);
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
      throw new Error(`Error updating assessment: ${error.message}`);
    }
  },

  // Delete assessment
  delete: async (id) => {
    const query = 'DELETE FROM assessments WHERE id = $1 RETURNING *';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting assessment: ${error.message}`);
    }
  }
};

module.exports = Assessment;