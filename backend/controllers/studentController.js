const Student = require('../models/Student');
const Class = require('../models/Class');
const asyncHandler = require('express-async-handler');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin and Teacher)
const getStudents = asyncHandler(async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (Admin and Teacher)
const getStudentById = asyncHandler(async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (Admin only)
const createStudent = asyncHandler(async (req, res) => {
  try {
    const { name, email, studentId, form, classId, parentContact } = req.body;

    // Check if student ID already exists
    const existingStudent = await Student.findByStudentId(studentId);
    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    const student = await Student.create({
      name,
      email,
      studentId,
      form,
      classId,
      parentContact
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (Admin only)
const updateStudent = asyncHandler(async (req, res) => {
  try {
    const { name, email, studentId, form, classId, parentContact, isActive } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const updatedStudent = await Student.update(req.params.id, {
      name: name || student.name,
      email: email || student.email,
      studentId: studentId || student.studentId,
      form: form || student.form,
      classId: classId || student.classId,
      parentContact: parentContact || student.parentContact,
      isActive: isActive !== undefined ? isActive : student.isActive
    });

    res.json(updatedStudent);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
const deleteStudent = asyncHandler(async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.delete(req.params.id);

    res.json({ message: 'Student removed' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get students by class
// @route   GET /api/students/class/:classId
// @access  Private (Admin and Teacher)
const getStudentsByClass = asyncHandler(async (req, res) => {
  try {
    const students = await Student.findByClass(req.params.classId);

    res.json(students);
  } catch (error) {
    console.error('Get students by class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass
};