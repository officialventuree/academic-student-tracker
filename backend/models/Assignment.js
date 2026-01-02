const db = require('../config/db');

// Create assignments table if it doesn't exist
const createAssignmentsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      classId INTEGER REFERENCES classes(id),
      subject VARCHAR(255) NOT NULL,
      dueDate DATE,
      maxScore DECIMAL(5,2) DEFAULT 100,
      assignedDate DATE DEFAULT CURRENT_DATE,
      teacherId INTEGER REFERENCES users(id),
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Assignments table created or already exists');
  } catch (error) {
    console.error('Error creating assignments table:', error);
  }
};

// Create assignment submissions table if it doesn't exist
const createAssignmentSubmissionsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS assignmentSubmissions (
      id SERIAL PRIMARY KEY,
      assignmentId INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
      studentId INTEGER REFERENCES students(id),
      score DECIMAL(5,2),
      submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'pending', -- pending, submitted, graded
      teacherFeedback TEXT,
      teacherId INTEGER REFERENCES users(id),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Assignment submissions table created or already exists');
  } catch (error) {
    console.error('Error creating assignment submissions table:', error);
  }
};

// Initialize the tables
createAssignmentsTable();
createAssignmentSubmissionsTable();

const Assignment = {
  // Create a new assignment
  create: async (assignmentData) => {
    const { title, description, classId, subject, dueDate, maxScore, teacherId } = assignmentData;
    
    const query = `
      INSERT INTO assignments (title, description, classId, subject, dueDate, maxScore, teacherId)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [title, description, classId, subject, dueDate, maxScore, teacherId];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating assignment: ${error.message}`);
    }
  },

  // Find assignment by ID
  findById: async (id) => {
    const query = 'SELECT * FROM assignments WHERE id = $1';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding assignment: ${error.message}`);
    }
  },

  // Find all assignments for a class
  findByClass: async (classId) => {
    const query = 'SELECT * FROM assignments WHERE classId = $1 AND isActive = true ORDER BY dueDate';
    const values = [classId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding assignments: ${error.message}`);
    }
  },

  // Find all assignments for a teacher
  findByTeacher: async (teacherId) => {
    const query = 'SELECT * FROM assignments WHERE teacherId = $1 AND isActive = true ORDER BY dueDate';
    const values = [teacherId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding assignments: ${error.message}`);
    }
  },

  // Update assignment
  update: async (id, assignmentData) => {
    const { title, description, classId, subject, dueDate, maxScore, isActive } = assignmentData;
    let query = 'UPDATE assignments SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;

    if (title) {
      query += `, title = $${paramCount++}`;
      values.push(title);
    }
    if (description) {
      query += `, description = $${paramCount++}`;
      values.push(description);
    }
    if (classId) {
      query += `, classId = $${paramCount++}`;
      values.push(classId);
    }
    if (subject) {
      query += `, subject = $${paramCount++}`;
      values.push(subject);
    }
    if (dueDate) {
      query += `, dueDate = $${paramCount++}`;
      values.push(dueDate);
    }
    if (maxScore) {
      query += `, maxScore = $${paramCount++}`;
      values.push(maxScore);
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
      throw new Error(`Error updating assignment: ${error.message}`);
    }
  },

  // Delete assignment (soft delete by setting isActive to false)
  delete: async (id) => {
    const query = 'UPDATE assignments SET isActive = false WHERE id = $1 RETURNING *';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting assignment: ${error.message}`);
    }
  },

  // Assignment Submissions Methods
  // Create a new assignment submission
  createSubmission: async (submissionData) => {
    const { assignmentId, studentId, score, status, teacherFeedback, teacherId } = submissionData;
    
    const query = `
      INSERT INTO assignmentSubmissions (assignmentId, studentId, score, status, teacherFeedback, teacherId)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    
    const values = [assignmentId, studentId, score, status, teacherFeedback, teacherId];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating assignment submission: ${error.message}`);
    }
  },

  // Find assignment submission by ID
  findSubmissionById: async (id) => {
    const query = 'SELECT * FROM assignmentSubmissions WHERE id = $1';
    const values = [id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding assignment submission: ${error.message}`);
    }
  },

  // Find all submissions for an assignment
  findSubmissionsByAssignment: async (assignmentId) => {
    const query = 'SELECT * FROM assignmentSubmissions WHERE assignmentId = $1 ORDER BY submittedAt DESC';
    const values = [assignmentId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding assignment submissions: ${error.message}`);
    }
  },

  // Find all submissions for a student
  findSubmissionsByStudent: async (studentId) => {
    const query = 'SELECT * FROM assignmentSubmissions WHERE studentId = $1 ORDER BY submittedAt DESC';
    const values = [studentId];
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding assignment submissions: ${error.message}`);
    }
  },

  // Find submission by assignment and student
  findSubmissionByAssignmentAndStudent: async (assignmentId, studentId) => {
    const query = 'SELECT * FROM assignmentSubmissions WHERE assignmentId = $1 AND studentId = $2';
    const values = [assignmentId, studentId];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding assignment submission: ${error.message}`);
    }
  },

  // Update assignment submission
  updateSubmission: async (id, submissionData) => {
    const { score, status, teacherFeedback } = submissionData;
    let query = 'UPDATE assignmentSubmissions SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;

    if (score !== undefined) {
      query += `, score = $${paramCount++}`;
      values.push(score);
    }
    if (status) {
      query += `, status = $${paramCount++}`;
      values.push(status);
    }
    if (teacherFeedback) {
      query += `, teacherFeedback = $${paramCount++}`;
      values.push(teacherFeedback);
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating assignment submission: ${error.message}`);
    }
  }
};

module.exports = Assignment;