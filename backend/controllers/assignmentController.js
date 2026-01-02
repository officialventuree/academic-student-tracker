const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const Class = require('../models/Class');
const asyncHandler = require('express-async-handler');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private (Admin and Teacher)
const getAssignments = asyncHandler(async (req, res) => {
  try {
    const { classId, teacherId } = req.query;
    
    let assignments;
    
    if (classId) {
      assignments = await Assignment.findByClass(classId);
    } else if (teacherId) {
      assignments = await Assignment.findByTeacher(teacherId);
    } else {
      // For admin access - all assignments
      if (req.user.role === 'admin') {
        // We would need to implement a method to fetch all assignments
        // For now, return empty array or implement the method
        assignments = [];
      } else {
        return res.status(403).json({ message: 'Class or teacher ID required' });
      }
    }
    
    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private (Admin and Teacher)
const getAssignmentById = asyncHandler(async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Admin and Teacher)
const createAssignment = asyncHandler(async (req, res) => {
  try {
    const { 
      title, description, classId, subject, dueDate, maxScore 
    } = req.body;

    // Check if class exists
    const classObj = await Class.findById(classId);

    if (!classObj) {
      return res.status(400).json({ message: 'Class not found' });
    }

    // Check if teacher is assigned to this class (for teacher role)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(classId.toString())) {
        return res.status(403).json({ message: 'Not authorized to create assignment for this class' });
      }
    }

    const assignment = await Assignment.create({
      title,
      description,
      classId,
      subject,
      dueDate,
      maxScore,
      teacherId: req.user.id
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update an assignment
// @route   PUT /api/assignments/:id
// @access  Private (Admin and Teacher)
const updateAssignment = asyncHandler(async (req, res) => {
  try {
    const { 
      title, description, classId, subject, dueDate, maxScore, isActive 
    } = req.body;

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher is assigned to this class (for teacher role)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(assignment.classId.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this assignment' });
      }
    }

    const updatedAssignment = await Assignment.update(req.params.id, {
      title: title || assignment.title,
      description: description || assignment.description,
      classId: classId || assignment.classId,
      subject: subject || assignment.subject,
      dueDate: dueDate || assignment.dueDate,
      maxScore: maxScore || assignment.maxScore,
      isActive: isActive !== undefined ? isActive : assignment.isActive
    });

    res.json(updatedAssignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Admin and Teacher)
const deleteAssignment = asyncHandler(async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher is assigned to this class (for teacher role)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(assignment.classId.toString())) {
        return res.status(403).json({ message: 'Not authorized to delete this assignment' });
      }
    }

    await Assignment.delete(req.params.id);

    res.json({ message: 'Assignment removed' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Students)
const submitAssignment = asyncHandler(async (req, res) => {
  try {
    const { studentId, score, status, teacherFeedback } = req.body;

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is in the class (this would require additional validation)
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(400).json({ message: 'Student not found' });
    }

    const submission = await Assignment.createSubmission({
      assignmentId: req.params.id,
      studentId,
      score: score || null,
      status: status || 'submitted',
      teacherFeedback: teacherFeedback || null,
      teacherId: req.user.id // Assuming teacher is submitting for student
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get assignment submissions
// @route   GET /api/assignments/:id/submissions
// @access  Private (Admin and Teacher)
const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  try {
    const submissions = await Assignment.findSubmissionsByAssignment(req.params.id);

    res.json(submissions);
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update assignment submission
// @route   PUT /api/assignments/submissions/:id
// @access  Private (Admin and Teacher)
const updateAssignmentSubmission = asyncHandler(async (req, res) => {
  try {
    const { score, status, teacherFeedback } = req.body;

    const submission = await Assignment.findSubmissionById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if teacher is assigned to the class (for teacher role)
    const assignment = await Assignment.findById(submission.assignmentId);
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(assignment.classId.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this submission' });
      }
    }

    const updatedSubmission = await Assignment.updateSubmission(req.params.id, {
      score: score !== undefined ? score : submission.score,
      status: status || submission.status,
      teacherFeedback: teacherFeedback || submission.teacherFeedback
    });

    res.json(updatedSubmission);
  } catch (error) {
    console.error('Update assignment submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  updateAssignmentSubmission
};