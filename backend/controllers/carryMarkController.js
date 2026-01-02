const CarryMark = require('../models/CarryMark');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Assessment = require('../models/Assessment');
const asyncHandler = require('express-async-handler');

// @desc    Get all carry marks
// @route   GET /api/carrymarks
// @access  Private (Admin and Teacher)
const getCarryMarks = asyncHandler(async (req, res) => {
  try {
    const { studentId, subject, academicYear } = req.query;
    
    let carryMarks;
    
    if (studentId) {
      if (subject && academicYear) {
        carryMarks = await CarryMark.findByStudentSubject(studentId, subject, academicYear);
      } else {
        carryMarks = await CarryMark.findByStudent(studentId);
      }
    } else {
      // For admin access - all carry marks
      if (req.user.role === 'admin') {
        // We would need to implement a method to fetch all carry marks
        // For now, return empty array or implement the method
        carryMarks = [];
      } else {
        return res.status(403).json({ message: 'Student ID required' });
      }
    }
    
    res.json(carryMarks);
  } catch (error) {
    console.error('Get carry marks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get carry mark by ID
// @route   GET /api/carrymarks/:id
// @access  Private (Admin and Teacher)
const getCarryMarkById = asyncHandler(async (req, res) => {
  try {
    const carryMark = await CarryMark.findById(req.params.id);

    if (!carryMark) {
      return res.status(404).json({ message: 'Carry mark not found' });
    }

    res.json(carryMark);
  } catch (error) {
    console.error('Get carry mark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create or update carry mark
// @route   POST /api/carrymarks
// @access  Private (Admin and Teacher)
const createCarryMark = asyncHandler(async (req, res) => {
  try {
    const { 
      studentId, classId, subject, form, semester, academicYear,
      us1, us2, uasa1, us3, us4, uasa2, assignmentScore, attendanceScore,
      totalMark, grade 
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
        return res.status(403).json({ message: 'Not authorized to manage carry marks for this class' });
      }
    }

    // Check if a carry mark record already exists for this student, subject, and academic year
    const existingCarryMarks = await CarryMark.findByStudentSubject(studentId, subject, academicYear);
    let carryMark;

    if (existingCarryMarks.length > 0) {
      // Find the specific semester record if it exists
      const existingSemesterRecord = existingCarryMarks.find(cm => cm.semester === semester);
      
      if (existingSemesterRecord) {
        // Update existing record
        carryMark = await CarryMark.update(existingSemesterRecord.id, {
          us1, us2, uasa1, us3, us4, uasa2, assignmentScore, attendanceScore,
          totalMark, grade
        });
      } else {
        // Create new semester record
        carryMark = await CarryMark.create({
          studentId, classId, subject, form, semester, academicYear,
          us1, us2, uasa1, us3, us4, uasa2, assignmentScore, attendanceScore,
          totalMark, grade, teacherId: req.user.id
        });
      }
    } else {
      // Create new record
      carryMark = await CarryMark.create({
        studentId, classId, subject, form, semester, academicYear,
        us1, us2, uasa1, us3, us4, uasa2, assignmentScore, attendanceScore,
        totalMark, grade, teacherId: req.user.id
      });
    }

    res.status(201).json(carryMark);
  } catch (error) {
    console.error('Create carry mark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a carry mark
// @route   PUT /api/carrymarks/:id
// @access  Private (Admin and Teacher)
const updateCarryMark = asyncHandler(async (req, res) => {
  try {
    const { 
      us1, us2, uasa1, us3, us4, uasa2, assignmentScore, attendanceScore,
      totalMark, grade 
    } = req.body;

    const carryMark = await CarryMark.findById(req.params.id);

    if (!carryMark) {
      return res.status(404).json({ message: 'Carry mark not found' });
    }

    // Check if teacher is assigned to this class (for teacher role)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(carryMark.classId.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this carry mark' });
      }
    }

    const updatedCarryMark = await CarryMark.update(req.params.id, {
      us1: us1 !== undefined ? us1 : carryMark.us1,
      us2: us2 !== undefined ? us2 : carryMark.us2,
      uasa1: uasa1 !== undefined ? uasa1 : carryMark.uasa1,
      us3: us3 !== undefined ? us3 : carryMark.us3,
      us4: us4 !== undefined ? us4 : carryMark.us4,
      uasa2: uasa2 !== undefined ? uasa2 : carryMark.uasa2,
      assignmentScore: assignmentScore !== undefined ? assignmentScore : carryMark.assignmentScore,
      attendanceScore: attendanceScore !== undefined ? attendanceScore : carryMark.attendanceScore,
      totalMark: totalMark !== undefined ? totalMark : carryMark.totalMark,
      grade: grade || carryMark.grade
    });

    res.json(updatedCarryMark);
  } catch (error) {
    console.error('Update carry mark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a carry mark
// @route   DELETE /api/carrymarks/:id
// @access  Private (Admin only)
const deleteCarryMark = asyncHandler(async (req, res) => {
  try {
    const carryMark = await CarryMark.findById(req.params.id);

    if (!carryMark) {
      return res.status(404).json({ message: 'Carry mark not found' });
    }

    await CarryMark.delete(req.params.id);

    res.json({ message: 'Carry mark removed' });
  } catch (error) {
    console.error('Delete carry mark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  getCarryMarks,
  getCarryMarkById,
  createCarryMark,
  updateCarryMark,
  deleteCarryMark
};