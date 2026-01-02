const Class = require('../models/Class');
const User = require('../models/User');
const Student = require('../models/Student');
const asyncHandler = require('express-async-handler');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private (Admin and Teacher)
const getClasses = asyncHandler(async (req, res) => {
  try {
    const classes = await Class.findAll();
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get class by ID
// @route   GET /api/classes/:id
// @access  Private (Admin and Teacher)
const getClassById = asyncHandler(async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);

    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classObj);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Admin only)
const createClass = asyncHandler(async (req, res) => {
  try {
    const { className, form, teacherId, subject, capacity } = req.body;

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(400).json({ message: 'Teacher not found' });
    }

    const classObj = await Class.create({
      className,
      form,
      teacherId,
      subject,
      capacity
    });

    res.status(201).json(classObj);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private (Admin only)
const updateClass = asyncHandler(async (req, res) => {
  try {
    const { className, form, teacherId, subject, capacity, isActive } = req.body;

    const classObj = await Class.findById(req.params.id);

    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if teacher exists if being updated
    if (teacherId) {
      const teacher = await User.findById(teacherId);
      if (!teacher) {
        return res.status(400).json({ message: 'Teacher not found' });
      }
    }

    const updatedClass = await Class.update(req.params.id, {
      className: className || classObj.className,
      form: form || classObj.form,
      teacherId: teacherId || classObj.teacherId,
      subject: subject || classObj.subject,
      capacity: capacity || classObj.capacity,
      isActive: isActive !== undefined ? isActive : classObj.isActive
    });

    res.json(updatedClass);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private (Admin only)
const deleteClass = asyncHandler(async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);

    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if any students are enrolled in this class
    const students = await Student.findByClass(req.params.id);
    if (students.length > 0) {
      return res.status(400).json({ message: 'Cannot delete class with enrolled students' });
    }

    await Class.delete(req.params.id);

    res.json({ message: 'Class removed' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get classes by teacher
// @route   GET /api/classes/teacher/:teacherId
// @access  Private (Admin only)
const getClassesByTeacher = asyncHandler(async (req, res) => {
  try {
    const classes = await Class.findByTeacher(req.params.teacherId);

    res.json(classes);
  } catch (error) {
    console.error('Get classes by teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassesByTeacher
};