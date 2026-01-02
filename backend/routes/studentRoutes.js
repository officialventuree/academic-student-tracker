const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deactivateStudent,
  updateStudentClass,
  updateStudentForm
} = require('../controllers/studentController');

const router = express.Router();

// All routes are protected
router.route('/')
  .get(protect, getStudents)  // Both admin and teacher can view students
  .post(protect, admin, createStudent);  // Only admin can create

router.route('/:id')
  .get(protect, getStudentById)  // Both admin and teacher can view specific student
  .put(protect, admin, updateStudent)  // Only admin can update
  .delete(protect, admin, deactivateStudent);  // Only admin can deactivate

router.route('/:id/class').put(protect, admin, updateStudentClass);  // Only admin can update class
router.route('/:id/form').put(protect, admin, updateStudentForm);  // Only admin can update form

module.exports = router;