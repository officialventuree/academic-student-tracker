const Assessment = require('../models/Assessment');
const Student = require('../models/Student');
const Class = require('../models/Class');
const asyncHandler = require('express-async-handler');

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Private (Admin and Teacher)
const getAssessments = asyncHandler(async (req, res) => {
  try {
    const { classId, studentId, assessmentType } = req.query;
    
    let assessments;
    
    if (classId) {
      if (assessmentType) {
        assessments = await Assessment.findByClassAndType(classId, assessmentType);
      } else {
        assessments = await Assessment.findByClass(classId);
      }
    } else if (studentId) {
      assessments = await Assessment.findByStudent(studentId);
    } else {
      // For admin access - all assessments
      if (req.user.role === 'admin') {
        // We would need to implement a method to fetch all assessments
        // For now, return empty array or implement the method
        assessments = [];
      } else {
        return res.status(403).json({ message: 'Class or student ID required' });
      }
    }
    
    res.json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get assessment by ID
// @route   GET /api/assessments/:id
// @access  Private (Admin and Teacher)
const getAssessmentById = asyncHandler(async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Private (Admin and Teacher)
const createAssessment = asyncHandler(async (req, res) => {
  try {
    const { 
      studentId, classId, assessmentType, subject, score, maxScore, 
      dateTaken, term, academicYear 
    } = req.body;

    // Check if student and class exist
    const student = await Student.findById(studentId);
    const classObj = await Class.findById(classId);

    if (!student || !classObj) {
      return res.status(400).json({ message: 'Student or class not found' });
    }

    // Check if teacher is assigned to this class (for teacher role)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(classId.toString())) {
        return res.status(403).json({ message: 'Not authorized to assess this class' });
      }
    }

    const assessment = await Assessment.create({
      studentId,
      classId,
      assessmentType,
      subject,
      score,
      maxScore,
      dateTaken,
      term,
      academicYear,
      teacherId: req.user.id
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update an assessment
// @route   PUT /api/assessments/:id
// @access  Private (Admin and Teacher)
const updateAssessment = asyncHandler(async (req, res) => {
  try {
    const { 
      studentId, classId, assessmentType, subject, score, maxScore, 
      dateTaken, term, academicYear 
    } = req.body;

    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Check if teacher is assigned to this class (for teacher role)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(assessment.classId.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this assessment' });
      }
    }

    const updatedAssessment = await Assessment.update(req.params.id, {
      studentId: studentId || assessment.studentId,
      classId: classId || assessment.classId,
      assessmentType: assessmentType || assessment.assessmentType,
      subject: subject || assessment.subject,
      score: score || assessment.score,
      maxScore: maxScore || assessment.maxScore,
      dateTaken: dateTaken || assessment.dateTaken,
      term: term || assessment.term,
      academicYear: academicYear || assessment.academicYear
    });

    res.json(updatedAssessment);
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete an assessment
// @route   DELETE /api/assessments/:id
// @access  Private (Admin and Teacher)
const deleteAssessment = asyncHandler(async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Check if teacher is assigned to this class (for teacher role)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(assessment.classId.toString())) {
        return res.status(403).json({ message: 'Not authorized to delete this assessment' });
      }
    }

    await Assessment.delete(req.params.id);

    res.json({ message: 'Assessment removed' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get assessments by student and subject
// @route   GET /api/assessments/student/:studentId/subject/:subject
// @access  Private (Admin and Teacher)
const getAssessmentsByStudentAndSubject = asyncHandler(async (req, res) => {
  try {
    const { studentId, subject } = req.params;

    const assessments = await Assessment.findByStudentAndSubject(studentId, subject);

    res.json(assessments);
  } catch (error) {
    console.error('Get assessments by student and subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentsByStudentAndSubject
};