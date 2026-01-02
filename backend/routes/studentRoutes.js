const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass
} = require('../controllers/studentController');

const router = express.Router();

// All routes are protected
router.route('/')
  .get(protect, getStudents)  // Both admin and teacher can view students
  .post(protect, admin, createStudent);  // Only admin can create

router.route('/:id')
  .get(protect, getStudentById)  // Both admin and teacher can view specific student
  .put(protect, admin, updateStudent)  // Only admin can update
  .delete(protect, admin, deleteStudent);  // Only admin can delete

router.route('/class/:classId')
  .get(protect, getStudentsByClass);  // Get students by class

module.exports = router;